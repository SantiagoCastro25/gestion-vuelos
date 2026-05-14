import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "SkyAI — Encuentra los Vuelos Más Baratos con Inteligencia Artificial",
    template: "%s | SkyAI",
  },
  description:
    "SkyAI usa inteligencia artificial para predecir cuándo comprar tu vuelo al mejor precio. Compara vuelos, hoteles y paquetes a nivel mundial con predicción de precios en tiempo real.",
  keywords: [
    "vuelos baratos",
    "comparar vuelos",
    "predicción precios vuelos",
    "inteligencia artificial viajes",
    "buscar vuelos",
    "hoteles baratos",
    "paquetes turísticos",
  ],
  authors: [{ name: "SkyAI" }],
  creator: "SkyAI",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://skyai.app",
    title: "SkyAI — Vuelos Inteligentes",
    description: "Encuentra los mejores vuelos con predicción de precios por IA",
    siteName: "SkyAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyAI — Vuelos Inteligentes",
    description: "Predicción de precios de vuelos con inteligencia artificial",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
