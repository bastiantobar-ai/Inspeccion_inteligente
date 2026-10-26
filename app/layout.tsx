import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kriterio - Kavak",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink-2 antialiased">
        {children}
      </body>
    </html>
  );
}
