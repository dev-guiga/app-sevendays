import type { Metadata } from "next";
import { Rationale, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

import { QueryProvider } from "@/components/query-provider";

import { UserAccessGuard, UserProvider } from "@/contexts/user-context";

import "./globals.css";

const interFont = Inter({
  variable: "--inter-font",
  subsets: ["latin"],
});

const rationale = Rationale({
  variable: "--rationale-font",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Se7en Days",
  description: "Seu horário e nossa prioridade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${interFont.variable} ${rationale.variable} antialiased relative [&::-webkit-scrollbar]:hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <UserProvider>
              <Header />
              <UserAccessGuard>{children}</UserAccessGuard>
              <Toaster />
              <Footer />
            </UserProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
