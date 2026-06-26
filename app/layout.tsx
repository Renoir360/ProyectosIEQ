import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Proyectos IT",
  description: "Sistema de monitoreo y control de proyectos tecnológicos de Clínica IEQ.",
};

import { MotionWrapper } from "@/components/ui/motion-wrapper";

import { Footer } from "@/components/layout/footer";

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Toaster } from "@/components/ui/toaster";

import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <ErrorBoundary>
              <main className="flex-1 relative z-10">
                <MotionWrapper direction="none" duration={0.6}>
                  {children}
                </MotionWrapper>
              </main>
            </ErrorBoundary>
            <Toaster />
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
