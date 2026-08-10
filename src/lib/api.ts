import type { ItemDetail, ItemsResponse, ItemType } from "@/types/item";

// URL base de registry-api. Sin valor de producción todavía: Render no está
// desplegado (ver CLAUDE.md del ecosistema). En local apunta al servidor
// levantado con `npm run dev` dentro de registry-api.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchItemsParams {
  type?: ItemType;
  q?: string;
}

async function safeFetch(url: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiError(
      "No fue posible conectar con el servidor de Armory. Verificar que registry-api esté corriendo.",
    );
  }
  if (!res.ok) {
    throw new ApiError(`El servidor respondió con un error (${res.status}).`);
  }
  return res;
}

export async function fetchItems(
  params: FetchItemsParams = {},
): Promise<ItemsResponse> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  const res = await safeFetch(`${API_URL}/items${query ? `?${query}` : ""}`);
  return res.json();
}

export async function fetchItemDetail(name: string): Promise<ItemDetail> {
  const res = await safeFetch(`${API_URL}/items/${encodeURIComponent(name)}`);
  return res.json();
}

/**
 * Construye el comando de instalación sin pedir el detalle del item.
 * El backend expone `install_command` en `GET /items/:name`, pero el patrón
 * es determinístico (`npx skills add adminoryslabs/Skills --skill <name>`),
 * así que las cards de la grilla lo arman localmente y evitan una llamada de
 * red extra solo para copiar un comando. Ver CLAUDE.md, sección Decisiones.
 */
export function buildInstallCommand(name: string): string {
  return `npx skills add adminoryslabs/Skills --skill ${name}`;
}

export { API_URL };
