import type { Metadata } from "next";
import themeInit from "@adminoryslabs/design-system/theme-init";
import "@adminoryslabs/design-system/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Armory — Catálogo de skills y prompts",
  description:
    "Buscador y catálogo de skills y prompts para agentes de código de adminoryslabs-skills.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-line="academy"
      data-theme-default="system"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col bg-orys-bg text-orys-fg">
        {children}
      </body>
    </html>
  );
}
