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
- [`registry-api`](../registry-api) corriendo y accesible (local o desplegado).

## Cómo levantarlo local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Revisar que NEXT_PUBLIC_API_URL apunte a registry-api

# 3. Levantar registry-api en otra terminal (puerto 3000 por defecto)
cd ../registry-api && npm run dev

# 4. Levantar el servidor de desarrollo
npm run dev
```

El servidor corre por defecto en `http://localhost:3001` si el puerto `3000` ya está en uso por
`registry-api` (Next.js elige automáticamente el siguiente puerto libre), o en `3000` si
`registry-api` corre en otro puerto.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de `registry-api`. Pública (se usa también desde el navegador), por eso lleva el prefijo `NEXT_PUBLIC_`. | `http://localhost:3000` |

Ver `.env.example` para el valor por defecto de desarrollo local. La URL de producción (Render)
todavía no existe: cuando `registry-api` se despliegue, reemplazar el valor en la configuración
de variables de entorno de Vercel.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Genera el build de producción. |
| `npm start` | Sirve el build de producción (requiere `npm run build` previo). |
| `npm run lint` | Corre ESLint sobre el proyecto. |

## Despliegue en Vercel

El proyecto no requiere configuración adicional: es un proyecto Next.js estándar (App Router,
sin servidor custom).

1. Importar el repositorio en Vercel.
2. Configurar la variable de entorno `NEXT_PUBLIC_API_URL` en el panel del proyecto (Settings →
   Environment Variables), apuntando a la URL pública de `registry-api` en Render.
3. Vercel detecta Next.js automáticamente y usa `npm run build` como comando de build; no hace
   falta tocar el `Build Command` ni el `Output Directory`.

La página principal (`/`) se renderiza dinámicamente en cada request (no queda prerenderizada en
build time), porque el catálogo cambia con el tiempo a medida que se agregan skills y prompts
nuevos en `adminoryslabs-skills`.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (tokens de diseño configurados como colores custom en `src/app/globals.css`,
  vía `@theme`)
- Google Fonts vía `next/font`: Space Grotesk (headings), Inter (cuerpo), JetBrains Mono
  (comandos y código)
