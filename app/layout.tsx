import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowState — Calendar Intelligence for Engineers",
  description:
    "Know when you actually code best. FlowState analyzes your GitHub commit history to protect your peak hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0C10] text-[#F1F5F9] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
