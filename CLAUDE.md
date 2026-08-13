# registry-web

Frontend del ecosistema Armory. Sitio público de descubrimiento del catálogo de
`adminoryslabs-skills` (nombre público: **Armory**). Ver
`D:\DMC_Courses\Armory\CLAUDE.md` para el contexto completo del ecosistema (los otros repos, el
contrato de contenido, el plan de despliegue) y `../registry-api/CLAUDE.md` para el backend que
este repo consume.

## Qué hay

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**, pensado para desplegarse en Vercel
  sin configuración adicional (sin servidor custom).
- **Single-page app** en `/`: todas las secciones del brief (header, hero, skills, prompts,
  harnesses, launcher, footer) viven en una sola ruta. El detalle de un item es un panel modal
  (`ItemModal`), no una ruta aparte.
- **Server Component + Client Component**: `src/app/page.tsx` es un Server Component que trae el
  listado inicial de skills y prompts en el request (`fetchItems` server-side) y se lo pasa a
  `HomeClient`, que maneja la búsqueda en vivo, el estado del modal y todo el fetch posterior
  client-side. La página usa `export const dynamic = "force-dynamic"` para no quedar
  prerenderizada en build time — el catálogo cambia con el tiempo.
- **Cliente de API en `src/lib/api.ts`**: `fetchItems`, `fetchItemDetail`,
  `buildInstallCommand`. Lee la URL base desde `NEXT_PUBLIC_API_URL` (default
  `http://localhost:3000`). Envuelve errores de red/HTTP en `ApiError` con mensaje en español
  listo para mostrar en UI.
- **Dark mode únicamente**: no hay toggle claro/oscuro. `globals.css` define los tokens de color
  del AiHub como colores custom de Tailwind vía `@theme` (Tailwind v4, sin `tailwind.config.js`
  — la configuración vive en CSS).

## Cómo correrlo en local

```bash
npm install
cp .env.example .env.local   # revisar que NEXT_PUBLIC_API_URL apunte a registry-api
cd ../registry-api && npm run dev   # en otra terminal, puerto 3000 por defecto
npm run dev                          # de vuelta en registry-web
```

El servidor de dev corre en `3001` si el `3000` ya está tomado por `registry-api` (Next.js elige
el siguiente puerto libre), o en `3000` si `registry-api` corre en otro puerto. Sin
`registry-api` levantado, `page.tsx` cae a `initialSkills/initialPrompts: null` y `HomeClient`
hace su propio fetch client-side, mostrando el estado de error de `ApiError` en vez de romper el
build/SSR.

Otros scripts: `npm run build`, `npm start` (sirve el build), `npm run lint`.

## Decisiones tomadas

- **Comando de instalación sin pedir el detalle**: `GET /items/:name` devuelve
  `install_command`, pero el patrón es determinístico
  (`npx skills add adminoryslabs/Skills --skill <name>`). Las cards de la grilla de Skills lo
  arman localmente con `buildInstallCommand(name)` en vez de pedir el detalle solo para copiar un
  comando — ahorra una llamada de red por click. El modal de detalle, que sí pide el detalle de
  todos modos, usa `install_command` del backend cuando está disponible y cae a
  `buildInstallCommand` si no vino en la respuesta.
- **Copiar un prompt sí requiere el detalle**: los items de `GET /items` no traen `body` (según
  el contrato de `registry-api`), así que el botón "Copiar prompt" pide `GET /items/:name` recién
  al hacer click, con feedback de "Copiando..." mientras espera.
- **Búsqueda global compartida**: el input del header (`Header`) no filtra nada por sí mismo —
  actualiza un estado en `HomeClient` con debounce de 300ms (`useDebouncedValue`) que se pasa
  como `query` a las dos secciones de catálogo (Skills y Prompts). Cada sección hace su propio
  `GET /items?type=...&q=...`, así que ambas reaccionan al mismo texto de búsqueda sin
  necesidad de un input de búsqueda por sección.
- **SSR solo para la carga inicial, no para la búsqueda**: `page.tsx` (Server Component) resuelve
  el primer listado de skills y prompts en el servidor para que la primera respuesta HTTP ya
  incluya datos reales (necesario tanto para verificar con `curl` como para evitar el flash de
  "cargando" en la primera carga). Cualquier búsqueda posterior es 100% client-side; `page.tsx`
  no vuelve a ejecutarse mientras el usuario escribe.
- **Estado vacío de Prompts distinto del de "sin resultados"**: si `type=prompt` devuelve
  `count: 0` sin búsqueda activa, se trata como un estado propio ("Todavía no hay prompts
  publicados") en vez de mostrar el mensaje genérico de "sin resultados para tu búsqueda", que
  está reservado para cuando una búsqueda con texto no encuentra coincidencias.
- **Sección Harnesses no consume la API**: el modelo de datos de `registry-api` no tiene un
  `type: harness` — es contenido estático en `HarnessesSection.tsx`. La card de `gentle-ai` ya
  enlaza al repo real (`github.com/Gentleman-Programming/gentle-ai`) con el crédito explícito a
  Gentleman-Programming (no es una creación de OrysLabs); el `ComingSoonBadge` quedó reservado
  para la promesa de "más harnesses propios de OrysLabs", no para gentle-ai.
- **CTA del launcher ya no es estático**: `LauncherCta.tsx` enlaza a
  `github.com/adminoryslabs/armory-launcher-desktop/releases/latest` (commit `1675a6f`). Antes de
  ese commit era un placeholder "Próximamente" porque el repo del launcher no existía todavía —
  si se toca este componente, no reintroducir el estado "coming soon".
- **Border-radius**: el sistema define máximo 2-3px en toda la UI. Se usan las utilidades por
  defecto de Tailwind (`rounded-sm`, sin `rounded-md/lg/xl/full`) en vez de definir un token de
  radio custom global, porque no todos los elementos necesitan el mismo radio y forzarlo con
  `!important` global hubiera roto elementos legítimamente circulares (ninguno existe hoy, pero
  no había necesidad de cerrar esa puerta).

## Relación con el ecosistema

`registry-web` es cliente de solo lectura de `registry-api` (nunca toca Postgres ni el repo de
contenido directamente) y no tiene dependientes propios — es una hoja del grafo. `launcher-desktop`
no depende de este repo, pero comparte el mismo backend y `registry-web` enlaza a sus releases
desde `LauncherCta`. Detalle completo del ecosistema en `D:\DMC_Courses\Armory\CLAUDE.md`.

## Estructura

```
registry-web/
├── .env.example
├── README.md
├── src/
│   ├── app/
│   │   ├── layout.tsx      # fuentes (next/font), metadata, wrapper HTML
│   │   ├── page.tsx        # Server Component: SSR del listado inicial
│   │   └── globals.css     # tokens de color/tipografía del AiHub vía @theme
│   ├── components/
│   │   ├── HomeClient.tsx      # orquesta estado de búsqueda y modal
│   │   ├── Header.tsx          # buscador global
│   │   ├── Hero.tsx            # comando de instalación genérico + copiar
│   │   ├── CatalogSection.tsx  # grid de Skills o Prompts: fetch, loading, error, vacío
│   │   ├── ItemCard.tsx        # card individual de la grilla
│   │   ├── ItemModal.tsx       # detalle completo de un item
│   │   ├── CopyButton.tsx      # botón de copiar reusable (texto sync o async)
│   │   ├── HarnessesSection.tsx  # sección estática, gentle-ai enlaza a su repo real
│   │   ├── LauncherCta.tsx       # enlaza a la última release de armory-launcher-desktop
│   │   ├── ComingSoonBadge.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts              # cliente de registry-api
│   │   └── useDebouncedValue.ts
│   └── types/
│       └── item.ts             # ItemSummary, ItemDetail, ItemsResponse
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
