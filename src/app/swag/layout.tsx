import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velonx Swag Store | Redeem Your XP",
  description: "Exclusive premium merchandise for the Velonx community. Turn your hard-earned XP into notebooks, bottles, apparel, and more.",
  openGraph: {
    title: "Velonx Swag Store | Premium Merchandise",
    description: "Redeem your XP for high-quality student essentials. Exclusive for the Velonx community.",
    url: "https://velonx.in/swag",
    siteName: "Velonx",
    images: [
      {
        url: "/swag-hero.webp",
        width: 1200,
        height: 630,
        alt: "Velonx Swag Store",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velonx Swag Store",
    description: "Redeem your XP for exclusive premium merchandise.",
    images: ["/swag-hero.webp"],
  },
};

export default function SwagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
