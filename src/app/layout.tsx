import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/pagamento"; // Isso inicia a rotina automaticamente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata= {
  title: "Bolão Minas Cap",
  description: "Compre seu bolão de forma online e segura!",
  openGraph: {
    title: "Bolão Minas Cap",
    description: "Compre seu bolão de forma online e segura!",
    url: "https://minascap.shop",
    siteName: "Bolão Minas Cap",
    images: [
      {
        url: "https://app.minascap.com/assets/icon/icon-512x512.png", // Caminho da imagem
        width: 512,
        height: 512,
        alt: "Bolão Minas Cap - Pagamento Pix",
      },
    ],
    type: "website",
  },
};;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
