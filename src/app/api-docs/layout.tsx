import { Metadata } from "next";

// The API docs page is a client-rendered Swagger UI (ssr: false) that fetches
// its spec in the browser, so crawlers see an empty shell. Keep it out of the
// index while still allowing the page to be reached and its links followed.
export const metadata: Metadata = {
  title: "API Documentation | Velonx",
  description: "Interactive OpenAPI reference for the Velonx platform API.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/api-docs",
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
