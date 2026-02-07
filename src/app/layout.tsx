import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Outfit, Great_Vibes, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Providers from "@/components/providers";
import { ScrollAnimationProvider } from "@/components/scroll-animation-provider";
import { Toaster } from "react-hot-toast";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { GoogleAnalytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  weight: ["400", "600", "700"],
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

import { defaultMetadata } from "@/lib/seo.config";

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${outfit.variable} ${greatVibes.variable} ${dancingScript.variable} antialiased min-h-screen flex flex-col`}
      >
        <GoogleAnalytics />
        <Providers>
          <ThemeProvider>
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '10px',
                },
                success: {
                  iconTheme: {
                    primary: '#219EBC',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <ConditionalNavbar />
            <main id="main-content" className="flex-1">
              <ScrollAnimationProvider>
                {children}
              </ScrollAnimationProvider>
            </main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
