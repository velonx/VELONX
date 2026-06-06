import type {} from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import Providers from "@/components/providers";
import { ScrollAnimationProvider } from "@/components/scroll-animation-provider";
import { Toaster } from "react-hot-toast";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { GoogleAnalytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };
const bebasNeue = { variable: "--font-bebas" };
const outfit = { variable: "--font-outfit" };
const greatVibes = { variable: "--font-great-vibes" };
const dancingScript = { variable: "--font-dancing-script" };
const amaticSC = { variable: "--font-amatic-sc" };
const indieFlower = { variable: "--font-indie-flower" };
const sniglet = { variable: "--font-sniglet" };
const girassol = { variable: "--font-girassol" };
const spaceGrotesk = { variable: "--font-space-grotesk" };

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
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${outfit.variable} ${greatVibes.variable} ${dancingScript.variable} ${amaticSC.variable} ${indieFlower.variable} ${sniglet.variable} ${girassol.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}
      >
        <GoogleAnalytics />
        <Providers>
          <ThemeProvider>

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
                    primary: '#226CE0',
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
