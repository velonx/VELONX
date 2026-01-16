import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Providers from "@/components/providers";
import { ScrollAnimationProvider } from "@/components/scroll-animation-provider";
import { Toaster } from "react-hot-toast";

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

export const metadata: Metadata = {
  title: "Velonx - Bridging the Gap, Building Futures",
  description: "A student-driven innovation & technology community platform where learners build real projects, explore emerging tech, and grow together.",
  keywords: ["student community", "tech community", "innovation", "projects", "mentorship", "hackathon"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
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
          <Navbar />
          <main className="flex-1">
            <ScrollAnimationProvider>
              {children}
            </ScrollAnimationProvider>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
