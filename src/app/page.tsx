import { HomeClient } from "@/components/HomeClient";
import { fetchItems } from "@/lib/api";
import type { ItemSummary } from "@/types/item";

// El catálogo cambia en vivo (se agregan skills/prompts nuevos), así que el
// listado inicial se resuelve en cada request en vez de quedar prerenderizado
// en build time.
export const dynamic = "force-dynamic";

// Server Component: trae el listado inicial de skills y prompts en el
// request al servidor (SSR) para que la primera carga muestre datos reales
// de registry-api sin depender de que el JS del cliente ya haya corrido.
// La búsqueda en vivo posterior sigue siendo client-side (ver HomeClient).
async function loadInitial(type: "skill" | "prompt"): Promise<ItemSummary[] | null> {
  try {
    const response = await fetchItems({ type });
    return response.items;
  } catch {
    // Si registry-api no responde durante el build/request, HomeClient hace
    // su propio fetch client-side y muestra el estado de error correspondiente.
    return null;
  }
}

export default async function Home() {
  const [initialSkills, initialPrompts] = await Promise.all([
    loadInitial("skill"),
    loadInitial("prompt"),
  ]);

  return <HomeClient initialSkills={initialSkills} initialPrompts={initialPrompts} />;
}
