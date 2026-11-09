# registry-web (Armory)

Sitio público de descubrimiento del catálogo de skills y prompts para agentes de código
publicado en [`adminoryslabs-skills`](https://github.com/adminoryslabs/Skills). Nombre público:
**Armory**.

Es un cliente de solo lectura de [`registry-api`](../registry-api): no toca la base de datos ni
el repositorio de contenido directamente. No reemplaza el instalador
`npx skills add adminoryslabs/Skills --skill <nombre>` — lo complementa permitiendo buscar,
filtrar y usar el catálogo desde el navegador.

Ver `D:\DMC_Courses\Armory\CLAUDE.md` para el contexto completo del ecosistema.

## Qué hace

- Busca y filtra en vivo los skills y prompts indexados en `registry-api`.
- Para cada skill, muestra el comando de instalación listo para copiar
  (`npx skills add adminoryslabs/Skills --skill <nombre>`).
- Para cada prompt, permite copiar el contenido completo al portapapeles.
- Muestra el detalle completo de un item (descripción, tags, contenido) en un panel modal, sin
  necesidad de una ruta aparte.

## Requisitos

- Node.js 18+
- Un token de GitHub con permiso `read:packages` en la variable `NODE_AUTH_TOKEN`. El paquete
  `@adminoryslabs/design-system` es privado y se instala desde GitHub Packages.
- [`registry-api`](../registry-api) corriendo y accesible (local o desplegado).

## Cómo levantarlo local

```bash
# 1. Configurar el token de GitHub Packages (read:packages)
export NODE_AUTH_TOKEN="tu_token"        # PowerShell: $env:NODE_AUTH_TOKEN = "tu_token"

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Revisar que NEXT_PUBLIC_API_URL apunte a registry-api

# 4. Levantar registry-api en otra terminal (puerto 3000 por defecto)
cd ../registry-api && npm run dev

# 5. Levantar el servidor de desarrollo
npm run dev
```

El servidor corre por defecto en `http://localhost:3001` si el puerto `3000` ya está en uso por
`registry-api` (Next.js elige automáticamente el siguiente puerto libre), o en `3000` si
`registry-api` corre en otro puerto.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de `registry-api`. Pública (se usa también desde el navegador), por eso lleva el prefijo `NEXT_PUBLIC_`. | `http://localhost:3000` |
| `NODE_AUTH_TOKEN` | Token de GitHub con `read:packages`, necesario para instalar `@adminoryslabs/design-system` desde GitHub Packages. Solo se usa en `npm install` y en el build. | `ghp_...` (no commitear) |

Ver `.env.example` para el valor por defecto de desarrollo local. En producción,
`NEXT_PUBLIC_API_URL` debe apuntar a la URL pública de `registry-api` (por ejemplo,
`https://api-armory.oryslabs.com`).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Genera el build de producción. |
| `npm start` | Sirve el build de producción (requiere `npm run build` previo). |
| `npm run lint` | Corre ESLint sobre el proyecto. |

## Despliegue en la VPS

El sitio se despliega en la VPS compartida de OrysLabs, detrás de Traefik, igual que el resto de
los proyectos.

1. Push a `main`: GitHub Actions construye la imagen, la publica en GHCR y la despliega por SSH en
   `/opt/apps/armory-web/`.
2. El contenedor corre el servidor standalone de Next.js en el puerto `3000` (interno) y Traefik
   lo publica en `https://armory.oryslabs.com`.
3. La ruta de salud del contenedor es `GET /api/health` y no depende de `registry-api`.

Variables y secretos en GitHub Actions:

| Nombre | Tipo | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | variable | URL pública de `registry-api`; se hornea en el build (`https://api-armory.oryslabs.com`). |
| `NPM_TOKEN` | secreto | Token con `read:packages` para instalar el design system en el build. |
| `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER` | secretos | Acceso de despliegue a la VPS. |

La página principal (`/`) se renderiza dinámicamente en cada request (no queda prerenderizada en
build time), porque el catálogo cambia con el tiempo a medida que se agregan skills y prompts
nuevos en `adminoryslabs-skills`.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + `@adminoryslabs/design-system` (línea **academy**): tokens `--orys-*` y
  clases `orys-*`. El tema se importa en `src/app/globals.css` y la línea se declara con
  `<html data-line="academy">`.
- Inter (texto) y JetBrains Mono (comandos y código) vía `next/font`.
- Regla de color: no se escriben colores a mano (ni hex ni rgba). Solo se usan tokens
  `--orys-*` o clases `orys-*` del design system.
