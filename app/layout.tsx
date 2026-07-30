import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspección Inteligente - Kavak",
  description: "Sistema de generación de checklists con IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/40 to-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
