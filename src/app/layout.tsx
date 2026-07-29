import type {} from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { ScrollAnimationProvider } from "@/components/scroll-animation-provider";
import { Toaster } from "react-hot-toast";
import { AppShellSwitcher } from "@/components/app-shell/AppShellSwitcher";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400;1,8..60,500&display=swap"
          rel="stylesheet"
        />
      </head>
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
                  background: '#1A1916',
                  color: '#F5F5EE',
                  borderRadius: '10px',
                },
                success: {
                  iconTheme: {
                    primary: '#F0771A',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <AppShellSwitcher>
              <ScrollAnimationProvider>
                {children}
              </ScrollAnimationProvider>
            </AppShellSwitcher>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
