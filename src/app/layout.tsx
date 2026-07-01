import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "abra.ai | AI Magic Trick Creator",
  description: "Record a gesture and generate stunning video magic tricks powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-[#09090B] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
