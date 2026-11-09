#!/usr/bin/env bash
# Deploy one application on the VPS. Invoked by GitHub Actions over SSH.
# Copy to <repo>/deploy/deploy.sh and replace armory-web.
#
# The registry token arrives on STDIN so it never appears in a command line, a
# process list, or the remote shell history. THIS IS WHY THIS IS A FILE and not
# a heredoc: stdin is already taken by the token, so the two cannot share it.
#
#   IMAGE_TAG=<sha> ACTOR=<github-user> bash deploy.sh  < token
set -euo pipefail

: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${ACTOR:?ACTOR is required}"

cd "/opt/apps/armory-web"
export IMAGE_TAG

docker login ghcr.io -u "$ACTOR" --password-stdin
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

# Not --quiet on purpose: a silent pull can leave the SSH connection with no
# traffic for minutes and something in the path drops it. Progress output is
# what keeps the pipe alive.
echo "==> pulling $IMAGE_TAG"
docker compose pull

# Run migrations to completion before anything serves traffic. Harmless no-op
# when the stack declares no `migrate` service.
if docker compose config --services | grep -qx migrate; then
  echo "==> migrating"
  docker compose run --rm migrate
fi

echo "==> starting"
mapfile -t SERVICES < <(docker compose config --services | grep -vx migrate)
docker compose up -d --remove-orphans "${SERVICES[@]}"

echo "==> waiting for health"
unhealthy=""
for _ in $(seq 1 30); do
  unhealthy=$(docker compose ps --format '{{.Service}} {{.Health}}' \
    | awk '$1 != "migrate" && $2 != "healthy" {print $1}' | tr '\n' ' ')
  [ -z "$unhealthy" ] && break
  sleep 5
done

if [ -n "$unhealthy" ]; then
  echo "still unhealthy after 150s: $unhealthy"
  docker compose ps
  # shellcheck disable=SC2086
  docker compose logs --tail 40 $unhealthy
  exit 1
fi

docker compose ps --format '{{.Service}}\t{{.Image}}\t{{.Status}}'
docker image prune -f >/dev/null
echo "==> deployed $IMAGE_TAG"
