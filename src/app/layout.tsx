import type { Metadata } from "next";
import "@adminoryslabs/design-system/fonts";
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
