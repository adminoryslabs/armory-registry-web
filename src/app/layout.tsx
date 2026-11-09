import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Armory — Catálogo de skills y prompts",
  description:
    "Buscador y catálogo de skills y prompts para agentes de código de adminoryslabs-skills.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-line="academy" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-orys-bg text-orys-fg">
        {children}
      </body>
    </html>
  );
}
