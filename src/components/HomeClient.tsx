"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CatalogSection } from "@/components/CatalogSection";
import { HarnessesSection } from "@/components/HarnessesSection";
import { LauncherCta } from "@/components/LauncherCta";
import { Footer } from "@/components/Footer";
import { ItemModal } from "@/components/ItemModal";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { ItemSummary } from "@/types/item";

interface HomeClientProps {
  initialSkills: ItemSummary[] | null;
  initialPrompts: ItemSummary[] | null;
}

export function HomeClient({ initialSkills, initialPrompts }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [selectedItem, setSelectedItem] = useState<ItemSummary | null>(null);

  return (
    <>
      <Header query={query} onQueryChange={setQuery} />
      <main className="flex-1">
        <Hero />
        <CatalogSection
          id="skills"
          type="skill"
          title="Skills"
          description="Instrucciones completas para tu agente. Instalalas con un comando."
          query={debouncedQuery}
          initialItems={initialSkills}
          onItemOpen={setSelectedItem}
        />
        <CatalogSection
          id="prompts"
          type="prompt"
          title="Prompts"
          description="Instrucciones cortas listas para pegar tal cual, sin instalación."
          query={debouncedQuery}
          initialItems={initialPrompts}
          onItemOpen={setSelectedItem}
        />
        <HarnessesSection />
        <LauncherCta />
      </main>
      <Footer />

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
