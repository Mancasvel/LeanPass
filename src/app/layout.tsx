import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LeanPass - Generador de Guías de Estudio con IA",
  description: "Sube tus exámenes antiguos y genera guías de estudio personalizadas con inteligencia artificial. Optimiza tu preparación académica.",
  keywords: "estudio, exámenes, IA, guía de estudio, preparación académica, PDF, análisis de texto",
  authors: [{ name: "LeanPass Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
