import { Metadata } from "next";
import Link from "next/link";
import CareerDetailClient from "./CareerDetailClient";
import { OpportunityService } from "@/lib/services/career.service";
import { MOCK_JOBS, getTechStack, isJobOpen } from "@/lib/data/careerMockData";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
  const pageUrl = `${siteUrl}/career/${decodedSlug}`;

  try {
    // 1. Check mock metadata first
    if (MOCK_JOBS[decodedSlug]) {
      const mock = MOCK_JOBS[decodedSlug];
      const isClosed = !isJobOpen(mock);

      // Ensure absolute image URL
      const rawImageUrl = mock.imageUrl?.trim();
      let finalImageUrl = `${siteUrl}/og/default.png`; // Fallback default
      if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
        if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
          finalImageUrl = rawImageUrl;
        } else {
          const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
          finalImageUrl = `${siteUrl}${normalizedPath}`;
        }
      }

      return {
        metadataBase: new URL(siteUrl),
        title: `${mock.title} at ${mock.company} | Velonx Careers`,
        description: mock.metaDesc,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          title: `${mock.title} at ${mock.company}`,
          description: mock.metaDesc,
          images: [
            {
              url: finalImageUrl,
              width: 1200,
              height: 630,
              alt: `${mock.title} at ${mock.company}`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `${mock.title} at ${mock.company}`,
          description: mock.metaDesc,
          images: [finalImageUrl],
        },
        // Noindex closed listings so Google drops them from search results
        ...(isClosed ? { robots: { index: false, follow: true } } : {}),
      };
    }

    // 2. Fetch from database
    const opportunity = await OpportunityService.getById(decodedSlug);
    if (opportunity) {
      // Security: if DRAFT, metadata is only visible to ADMIN
      if (opportunity.status === "DRAFT") {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
          return {
            title: "Opportunity Listing | Velonx Careers",
            description: "Explore vetted student internship and career opportunities at Velonx. Democratizing tech hiring."
          };
        }
      }

      const desc = opportunity.description.substring(0, 150) + "...";
      const isClosed = !isJobOpen({
        status: opportunity.status,
        deadline: opportunity.deadline?.toISOString() ?? null,
      });

      // Ensure absolute image URL
      const rawImageUrl = opportunity.imageUrl?.trim();
      let finalImageUrl = `${siteUrl}/og/default.png`; // Fallback default
      if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
        if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
          finalImageUrl = rawImageUrl;
        } else {
          const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
          finalImageUrl = `${siteUrl}${normalizedPath}`;
        }
      }

      return {
        metadataBase: new URL(siteUrl),
        title: `${opportunity.title} at ${opportunity.company} | Velonx Careers`,
        description: desc,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          title: `${opportunity.title} at ${opportunity.company}`,
          description: desc,
          images: [
            {
              url: finalImageUrl,
              width: 1200,
              height: 630,
              alt: `${opportunity.title} at ${opportunity.company}`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `${opportunity.title} at ${opportunity.company}`,
          description: desc,
          images: [finalImageUrl],
        },
        // Noindex closed listings so Google drops them from search results
        ...(isClosed ? { robots: { index: false, follow: true } } : {}),
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

/**
 * Build JSON-LD JobPosting structured data for search engines.
 * Now always includes validThrough for both mock and DB opportunities.
 */
function buildJsonLd(slug: string, opportunity: any): any {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";

  if (MOCK_JOBS[slug]) {
    const mock = MOCK_JOBS[slug];
    const isRemote = mock.location.toLowerCase().includes("remote");
    const employmentType = mock.type === "INTERNSHIP" ? "INTERN" : "FULL_TIME";

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": mock.title,
      "description": mock.about,
      "datePosted": mock.datePosted,
      "validThrough": mock.validThrough,
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

    return jsonLd;
  }

  if (opportunity) {
    const isRemote = opportunity.location.toLowerCase().includes("remote");
    const employmentType = opportunity.type === "INTERNSHIP" ? "INTERN" : "FULL_TIME";

    // Always provide validThrough — use deadline if available, else 6 months from creation
    let validThrough: string;
    if (opportunity.deadline) {
      validThrough = new Date(opportunity.deadline).toISOString();
    } else if (opportunity.status === "CLOSED") {
      // Closed without deadline — use updatedAt as a reasonable proxy
      validThrough = new Date(opportunity.updatedAt || opportunity.createdAt).toISOString();
    } else {
      // Active without deadline — default to 6 months from creation
      const sixMonthsOut = new Date(opportunity.createdAt);
      sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
      validThrough = sixMonthsOut.toISOString();
    }

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opportunity.title,
      "description": opportunity.description,
      "datePosted": new Date(opportunity.createdAt).toISOString().split('T')[0],
      "validThrough": validThrough,
      "employmentType": employmentType,
      "hiringOrganization": {
        "@type": "Organization",
        "name": opportunity.company,
        "sameAs": "https://velonx.in",
        ...(opportunity.imageUrl ? { "logo": opportunity.imageUrl } : {})
      },
      "url": `${siteUrl}/career/${opportunity.slug || opportunity.id}`,
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
          "addressLocality": opportunity.location,
          "addressCountry": "IN"
        }
      };
    }

    return jsonLd;
  }

  return null;
}

/**
 * Fetch a handful of published blog posts for the interlink CTA section.
 * This adds real, crawlable internal links between career listings and blog content.
 */
async function getRelatedBlogPosts(): Promise<{ slug: string; title: string }[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return posts.map(p => ({ slug: p.slug || "", title: p.title })).filter(p => p.slug);
  } catch (err) {
    console.error("Failed to fetch blog posts for career CTA:", err);
    return [];
  }
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let opportunity: any = null;

  // Resolve job data — mock first, then database
  const mockJob = MOCK_JOBS[decodedSlug] || null;

  if (!mockJob) {
    try {
      const dbOpp = await OpportunityService.getById(decodedSlug);
      if (dbOpp) {
        // Security check: only admins can view drafts
        if (dbOpp.status === "DRAFT") {
          const session = await auth();
          if (session?.user?.role !== "ADMIN") {
            return (
              <div style={{ minHeight: '100vh', paddingTop: '9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Opportunity Not Found</h1>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                  The listing you are looking for does not exist or has been removed.
                </p>
                <Link href="/career" style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                  ← Back to Careers
                </Link>
              </div>
            );
          }
        }
        // Serialize Date properties to satisfy Next.js page props transition
        opportunity = JSON.parse(JSON.stringify(dbOpp));
      }
    } catch (err) {
      console.error("Failed server-side fetch of opportunity:", err);
    }
  }

  // The resolved job for SSR — either mock or DB
  const job = mockJob || opportunity;

  // Build JSON-LD structured data
  const jsonLd = buildJsonLd(decodedSlug, opportunity);

  // Fetch related blog posts for interlinking CTA
  const blogPosts = await getRelatedBlogPosts();

  // Compute display values for SSR
  const jobOpen = job ? isJobOpen({ status: job.status, deadline: job.deadline }) : true;
  const techStack = job ? getTechStack(job) : [];

  // Logo initials and color for SSR
  const initials = job?.logoText || (job?.company ? job.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO');
  const logoColors = ['#F0771A', '#F59E0B', '#FB923C', '#FCD34D', '#e0650d'];
  const charCode = job?.company ? job.company.charCodeAt(0) : 0;
  const determinedLogoColor = job?.logoColor || logoColors[charCode % logoColors.length];

  const formattedSalary = job?.salary || "Competitive / Stipend";
  const formattedLocation = job?.location || "Remote / Office";
  const formattedDuration = job?.duration || (job?.type === "INTERNSHIP" ? "3-6 Months" : "Full-Time");
  const formattedExperience = job?.exp || (job?.type === "INTERNSHIP" ? "Student / Intern" : "Fresher / Junior");

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}

      {/*
        SERVER-RENDERED ARTICLE — This is the critical SEO fix.
        All job content is present in the raw HTML so crawlers (Google, AdSense reviewers)
        see real content, not an empty shell. The CareerDetailClient component hydrates
        over this content to add interactivity (modals, animations, bookmarks, apply flows).
      */}
      {job ? (
        <div id="ssr-career-content" className="min-h-screen bg-background pt-8 relative overflow-hidden pb-16">
          <div className="container px-4 md:px-8 max-w-7xl mx-auto">
            <article itemScope itemType="https://schema.org/JobPosting">
              {/* Hidden schema.org microdata for crawlers */}
              <meta itemProp="title" content={job.title} />
              <meta itemProp="datePosted" content={job.datePosted || new Date((job as any).createdAt || Date.now()).toISOString().split('T')[0]} />
              {(job.validThrough || job.deadline) && (
                <meta itemProp="validThrough" content={job.validThrough || new Date(job.deadline!).toISOString()} />
              )}

              {/* Closed listing banner */}
              {!jobOpen && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <p style={{ fontWeight: 700, color: '#ef4444', fontSize: '1rem', margin: 0 }}>
                    ⚠ This listing has closed
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', margin: 0 }}>
                    {job.deadline
                      ? `The application deadline was ${new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
                      : 'This position is no longer accepting applications.'}
                    {' '}
                    <Link href="/career" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                      Explore open opportunities →
                    </Link>
                  </p>
                </div>
              )}

              {/* Hero Section */}
              <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Company Logo Initials */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '1rem',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      color: determinedLogoColor,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        background: 'rgba(240,119,26,0.1)',
                        color: '#F0771A',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}>
                        {job.badge || (job.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'FULL-TIME')}
                      </span>
                      {jobOpen ? (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          background: 'rgba(34,197,94,0.1)',
                          color: '#22c55e',
                        }}>ACTIVE</span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444',
                        }}>CLOSED</span>
                      )}
                    </div>
                    <h1 itemProp="title" style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                      {job.title}
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      <span itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                        <span itemProp="name">{job.company}</span>
                      </span>
                      {' '}• Engineering Department
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stipend / Salary</span>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0.15rem 0 0' }}>{formattedSalary}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
                    <p itemProp="jobLocation" style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0.15rem 0 0' }}>{formattedLocation}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0.15rem 0 0' }}>{formattedDuration}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</span>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0.15rem 0 0' }}>{formattedExperience}</p>
                  </div>
                  {job.deadline && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</span>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0.15rem 0 0', color: jobOpen ? 'inherit' : '#ef4444' }}>
                        {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </header>

              {/* About the Role */}
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  About the Role
                </h2>
                <div itemProp="description">
                  {(job.about || job.description || "").split('\n').filter((p: string) => p.trim()).map((para: string, idx: number) => (
                    <p key={idx} style={{ color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1rem', fontSize: '0.95rem' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Key Responsibilities
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {job.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.2rem' }}>✓</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements & Technical Skills */}
              {job.requirements && job.requirements.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Requirements &amp; Technical Skills
                  </h2>
                  <ul itemProp="qualifications" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {job.requirements.map((req: string, idx: number) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.2rem' }}>✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Technology Stack */}
              {techStack.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Technology Stack
                  </h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Core technologies and libraries utilized daily in this role:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {techStack.map((tech: string, idx: number) => (
                      <span
                        key={idx}
                        itemProp="skills"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.5rem',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Blog CTA Interlink Section — Server-rendered for SEO */}
            {blogPosts.length > 0 && (
              <section
                aria-label="Related career guides"
                style={{
                  marginTop: '2.5rem',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  📚 Preparing for this role? Read our career guides
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Get an edge with Velonx&apos;s curated preparation guides, placement strategies, and interview tips written by industry professionals.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {blogPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                        }}
                      >
                        {post.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      ) : (
        /* Not found SSR fallback */
        <div style={{ minHeight: '100vh', paddingTop: '9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Opportunity Not Found</h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
            The listing you are looking for does not exist or has been removed.
          </p>
          <Link href="/career" style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>
            ← Back to Careers
          </Link>
        </div>
      )}

      {/*
        Client component for interactivity — hydrates over the SSR content above.
        Handles: apply modals, login modals, GSAP animations, bookmarks, share,
        similar jobs section, and file upload flows.
      */}
      <CareerDetailClient id={decodedSlug} initialOpportunity={opportunity} />
    </>
  );
}
