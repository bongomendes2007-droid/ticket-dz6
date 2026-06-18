import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ticket DZ6 — Plataforma de ingressos e eventos",
  description:
    "Crie seu evento, venda ingressos online e gerencie tudo em um só lugar. Simples, rápido e profissional.",
  keywords: [
    "ingressos",
    "eventos",
    "venda de ingressos",
    "check-in QR Code",
    "Ticket DZ6",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="overflow-x-clip font-sans antialiased">{children}</body>
    </html>
  );
}
