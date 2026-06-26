import { Metadata } from "next";
import CareerDetailClient from "./CareerDetailClient";
import { OpportunityService } from "@/lib/services/career.service";

interface Props {
  params: Promise<{ slug: string }>;
}

// Same mock jobs metadata mapping for server-side SEO rendering
const MOCK_METADATA: Record<string, { title: string; company: string; desc: string; type: "INTERNSHIP" | "JOB"; location: string; datePosted: string }> = {
  razorpay: {
    title: "Frontend Development Intern",
    company: "Razorpay",
    desc: "Razorpay is looking for a Frontend Development Intern to build secure, lightning-fast payment pages and dashboard metrics.",
    type: "INTERNSHIP",
    location: "Bangalore",
    datePosted: "2026-06-25"
  },
  snowflake: {
    title: "Junior Software Engineer (Backend)",
    company: "Snowflake Inc",
    desc: "Snowflake is seeking a Junior Software Engineer to optimize queries, design data processing pipelines, and build microservices in Go.",
    type: "JOB",
    location: "Remote",
    datePosted: "2026-06-25"
  },
  cred: {
    title: "Product Design Intern",
    company: "Cred",
    desc: "CRED is looking for a Product Design Intern to build intuitive transitions, credit visualizers, and premium user experience interfaces.",
    type: "INTERNSHIP",
    location: "Remote",
    datePosted: "2026-06-25"
  },
  zomato: {
    title: "Associate Android Developer",
    company: "Zomato",
    desc: "Zomato is seeking an Associate Android Developer to scale consumer delivery apps, write location APIs, and compose compose UI.",
    type: "JOB",
    location: "Gurgaon",
    datePosted: "2026-06-25"
  },
  microsoft: {
    title: "Machine Learning Research Intern",
    company: "Microsoft Research",
    desc: "Microsoft Research India is looking for a Research Intern to train, optimize, and compression-tune Large Language Models.",
    type: "INTERNSHIP",
    location: "Bangalore",
    datePosted: "2026-06-25"
  }
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
  const pageUrl = `${siteUrl}/career/${slug}`;

  try {
    // 1. Check mock metadata first
    if (MOCK_METADATA[slug]) {
      const mock = MOCK_METADATA[slug];
      return {
        title: `${mock.title} at ${mock.company} | Velonx Careers`,
        description: mock.desc,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          title: `${mock.title} at ${mock.company}`,
          description: mock.desc,
        }
      };
    }

    // 2. Fetch from database (will check if it's ObjectId or slug, and generate slug if missing)
    const opportunity = await OpportunityService.getById(slug);
    if (opportunity) {
      const desc = opportunity.description.substring(0, 150) + "...";
      return {
        title: `${opportunity.title} at ${opportunity.company} | Velonx Careers`,
        description: desc,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          title: `${opportunity.title} at ${opportunity.company}`,
          description: desc,
          images: opportunity.imageUrl ? [{ url: opportunity.imageUrl, alt: opportunity.title }] : [],
        }
      };
    }

    return {
      title: "Opportunity Listing | Velonx Careers",
      description: "Explore vetted student internship and career opportunities at Velonx. Democratizing tech hiring."
    };
  } catch (error) {
    console.error("SEO Metadata generation error:", error);
    return {
      title: "Opportunity Listing | Velonx Careers",
      description: "Explore vetted student internship and career opportunities at Velonx. Democratizing tech hiring."
    };
  }
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  let opportunity: any = null;

  try {
    const dbOpp = await OpportunityService.getById(slug);
    if (dbOpp) {
      // Serialize Date properties to satisfy Next.js page props transition
      opportunity = JSON.parse(JSON.stringify(dbOpp));
    }
  } catch (err) {
    console.error("Failed server-side fetch of opportunity:", err);
  }

  // Generate JSON-LD schema search crawler script
  let jsonLd: any = null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";

  if (MOCK_METADATA[slug]) {
    const mock = MOCK_METADATA[slug];
    const isRemote = mock.location.toLowerCase().includes("remote");
    const employmentType = mock.type === "INTERNSHIP" ? "INTERN" : "FULL_TIME";

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": mock.title,
      "description": mock.desc,
      "datePosted": mock.datePosted,
      "employmentType": employmentType,
      "hiringOrganization": {
        "@type": "Organization",
        "name": mock.company,
        "sameAs": "https://velonx.in"
      },
      "url": `${siteUrl}/career/${slug}`,
      "directApply": true
    };

    if (isRemote) {
      jsonLd.jobLocationType = "TELECOMMUTE";
      jsonLd.applicantLocationRequirements = {
        "@type": "Country",
        "name": "IN"
      };
    } else {
      jsonLd.jobLocation = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": mock.location,
          "addressCountry": "IN"
        }
      };
    }
  } else if (opportunity) {
    const isRemote = opportunity.location.toLowerCase().includes("remote");
    const employmentType = opportunity.type === "INTERNSHIP" ? "INTERN" : "FULL_TIME";

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opportunity.title,
      "description": opportunity.description,
      "datePosted": new Date(opportunity.createdAt).toISOString().split('T')[0],
      "employmentType": employmentType,
      "hiringOrganization": {
        "@type": "Organization",
        "name": opportunity.company,
        "sameAs": "https://velonx.in",
        ...(opportunity.imageUrl ? { "logo": opportunity.imageUrl } : {})
      },
      "url": `${siteUrl}/career/${opportunity.slug || opportunity.id}`,
      "directApply": true,
      ...(opportunity.deadline ? { "validThrough": new Date(opportunity.deadline).toISOString() } : {})
    };

    if (isRemote) {
      jsonLd.jobLocationType = "TELECOMMUTE";
      jsonLd.applicantLocationRequirements = {
        "@type": "Country",
        "name": "IN"
      };
    } else {
      jsonLd.jobLocation = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": opportunity.location,
          "addressCountry": "IN"
        }
      };
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <CareerDetailClient id={slug} initialOpportunity={opportunity} />
    </>
  );
}
