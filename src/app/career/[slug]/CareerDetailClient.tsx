"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowLeft, Clock, MapPin, IndianRupee, ExternalLink, 
  Share2, Check, LogIn, X, Lock, Loader2, Upload, 
  Bookmark, ChevronRight, ShieldCheck, HelpCircle, Briefcase, GraduationCap, CalendarClock
} from 'lucide-react';
import { CareerDetailSkeleton } from "@/components/boneyard";
import "./career-detail.css";
import { analytics } from "@/components/analytics";

// Static mock data repository matching career-detail.html
const MOCK_JOBS: Record<string, any> = {
  razorpay: {
    id: "razorpay",
    type: "INTERNSHIP",
    title: "Frontend Development Intern",
    company: "Razorpay",
    imageUrl: null,
    logoText: "RP",
    logoColor: "var(--violet-light)",
    salary: "₹45,000 / mo",
    location: "Bangalore / Remote",
    duration: "6 Months",
    exp: "Fresher / Student",
    badge: "HOT OPPORTUNITY",
    badgeClass: "badge-cyan",
    stack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    about: "Razorpay is looking for an energetic, core-focused Frontend Development Intern to assist our payment experience teams. You will work directly with seasoned architects to design secure, lightning-fast landing panels, custom dashboard metrics, and progressive checkout widgets. We value builders who focus on writing dry, standard-compliant code, optimization frameworks, and clean systems over simple tutorials.",
    responsibilities: [
      "Build fully reusable, pixel-perfect user components based on Figma mockups.",
      "Collaborate with backend engineers to integrate APIs using robust websocket streams and REST fetch requests.",
      "Analyze web performance metrics, specifically debugging and optimizing Largest Contentful Paint (LCP) speeds.",
      "Write modular unit test cases to secure checkout logic structures."
    ],
    requirements: [
      "Strong foundations in native Modern Javascript (ES6+), HTML5, and CSS3 layouts.",
      "Practical knowledge of building Single Page Applications using React or Next.js.",
      "Excellent understanding of browser rendering architectures, DOM elements, and CSS custom variables.",
      "Having a submitted project on the Velonx Projects Hub is a significant advantage."
    ],
    applyUrl: "https://razorpay.com/jobs"
  },
  snowflake: {
    id: "snowflake",
    type: "JOB",
    title: "Junior Software Engineer (Backend)",
    company: "Snowflake Inc",
    imageUrl: null,
    logoText: "SF",
    logoColor: "var(--cyan-light)",
    salary: "₹12 - 18 LPA",
    location: "Remote (India)",
    duration: "Full-Time",
    exp: "Fresher / 0-1 Yr",
    badge: "URGENT HIRING",
    badgeClass: "badge-violet",
    stack: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'CI/CD'],
    about: "Snowflake is seeking a Junior Software Engineer to join our core backend data pipelines team. You will work on optimizing large-scale distributed queries, designing high-throughput data processing endpoints, and ensuring database consistency. You will be building resilient microservices using Go and deploying them in high-availability environments.",
    responsibilities: [
      "Design, build, and maintain efficient, reusable, and reliable Go backend microservices.",
      "Optimize SQL query plans and manage schema migrations across relational databases like PostgreSQL.",
      "Create clean API schemas and integrate authentication layers with JWT and OAuth frameworks.",
      "Collaborate on CI/CD pipelines to package and deploy backend dockerized components."
    ],
    requirements: [
      "Solid understanding of Go (Golang) programming and backend system design paradigms.",
      "Good familiarity with relational databases, transaction isolation levels, and indexing strategies.",
      "Familiarity with containerization technologies (Docker, Kubernetes) and Linux shells.",
      "Strong problem-solving skills, solid algorithm fundamentals, and good system debugging."
    ],
    applyUrl: "https://snowflake.com/careers"
  },
  cred: {
    id: "cred",
    type: "INTERNSHIP",
    title: "Product Design Intern",
    company: "Cred",
    imageUrl: null,
    logoText: "CR",
    logoColor: "rgba(16,185,129,1)",
    salary: "₹35,000 / mo",
    location: "Remote (India)",
    duration: "6 Months",
    exp: "Fresher / Student",
    badge: "CREATIVE SPOTLIGHT",
    badgeClass: "badge-green",
    stack: ['Figma', 'UI Layout', 'Prototyping', 'Micro-interactions', 'Design Systems'],
    about: "CRED is looking for a Product Design Intern who is deeply passionate about micro-interactions, clean glassmorphic aesthetic layers, and fluid transitions. You will work alongside our design core to craft intuitive payment tracks, interactive credit score visualizers, and gamified interface loops that amaze premium users.",
    responsibilities: [
      "Create high-fidelity interactive user interfaces and micro-animations in Figma.",
      "Conduct user research, trace user flows, and compile wireframe documents.",
      "Collaborate with frontend developers to ensure perfect visual translation and CSS compliance.",
      "Participate in design reviews and iterate designs based on real user feedback logs."
    ],
    requirements: [
      "Outstanding design portfolio showcasing UI/UX skills, typography, and visual hierarchies.",
      "Expert knowledge of Figma components, auto-layouts, and prototyping interactions.",
      "Basic understanding of HTML/CSS structures, rendering bounds, and layout engines is highly appreciated.",
      "Keen eye for detail, animation curves, color harmony, and micro-interactions."
    ],
    applyUrl: "https://cred.club/careers"
  },
  zomato: {
    id: "zomato",
    type: "JOB",
    title: "Associate Android Developer",
    company: "Zomato",
    imageUrl: null,
    logoText: "ZM",
    logoColor: "rgba(245,158,11,1)",
    salary: "₹10 - 14 LPA",
    location: "Gurgaon, India",
    duration: "Full-Time",
    exp: "Fresher / 0-1 Yr",
    badge: "IMMEDIATE JOINER",
    badgeClass: "badge-amber",
    stack: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'SQLite', 'Reactive Programming'],
    about: "Zomato is seeking an Associate Android Developer to help scale our consumer delivery mobile applications. You will be building responsive UI layouts, designing efficient offline database caches, and optimizing location-tracking battery consumption across millions of active mobile devices in India.",
    responsibilities: [
      "Build modular, responsive android interfaces using Kotlin and Jetpack Compose.",
      "Implement real-time location tracking APIs and local SQLite database architectures.",
      "Optimize Android app bundle sizes, asset loads, and memory footprints for peak efficiency.",
      "Diagnose app performance metrics, trace memory leaks, and debug background service threads."
    ],
    requirements: [
      "Strong foundation in Kotlin development and the official Android SDK environment.",
      "Good understanding of Android lifecycle states, background workers, and local storage.",
      "Experience with modern UI toolkits like Jetpack Compose or XML layout styling.",
      "Familiarity with reactive programming patterns and RESTful API integrations."
    ],
    applyUrl: "https://zomato.com/careers"
  },
  microsoft: {
    id: "microsoft",
    type: "INTERNSHIP",
    title: "Machine Learning Research Intern",
    company: "Microsoft Research",
    imageUrl: null,
    logoText: "MS",
    logoColor: "rgba(236,72,153,1)",
    salary: "₹80,000 / mo",
    location: "Bangalore, India",
    duration: "6 Months",
    exp: "Student / PG",
    badge: "RESEARCH TRACK",
    badgeClass: "badge-pink",
    stack: ['Python', 'PyTorch', 'Transformers', 'LLMs', 'Model Compression'],
    about: "Microsoft Research (MSR) India is looking for a Research Intern to contribute to advanced machine learning projects. You will collaborate with world-class computer scientists on modern NLP model optimizations, low-power edge deployment algorithms, and interactive generative architectures.",
    responsibilities: [
      "Conduct empirical experiments to train, fine-tune, and optimize large language models.",
      "Design model compression algorithms such as pruning, quantization, and knowledge distillation.",
      "Document experimental outcomes, write technical reports, and contribute to academic papers.",
      "Implement pipeline scripts to pre-process complex multimodal datasets."
    ],
    requirements: [
      "Excellent coding capabilities in Python and modern deep learning frameworks (PyTorch / TensorFlow).",
      "Solid mathematical foundations in linear algebra, calculus, and probability.",
      "Strong grasp of machine learning fundamentals, transformers, and model optimization methods.",
      "Prior research experience or contributions to open-source ML projects is a huge plus."
    ],
    applyUrl: "https://microsoft.com/careers"
  }
};

const COMMON_TECH = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind',
  'Node.js', 'Express', 'Go', 'Golang', 'Python', 'PyTorch', 'TensorFlow', 'LLMs',
  'Kotlin', 'Android', 'Java', 'Swift', 'iOS', 'Flutter', 'React Native',
  'PostgreSQL', 'MongoDB', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'CI/CD',
  'Figma', 'UI/UX', 'Design Systems', 'Machine Learning', 'Deep Learning',
  'Git', 'GitHub', 'Web Performance', 'LCP', 'Vite'
];

const PRECOMPILED_TECH_REGEXES = COMMON_TECH.map(tech => {
  const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return { tech, regex: new RegExp(`\\b${escaped}\\b`, 'i') };
});

function getTechStack(job: any): string[] {
  if (job.stack && job.stack.length > 0) return job.stack;
  
  const tags = new Set<string>();
  const searchStr = `${job.title} ${job.about || job.description || ""} ${(job.requirements || []).join(' ')}`.toLowerCase();
  
  for (const { tech, regex } of PRECOMPILED_TECH_REGEXES) {
    if (regex.test(searchStr)) {
      tags.add(tech);
    }
  }
  
  if (searchStr.includes('next.js') || searchStr.includes('nextjs')) tags.add('Next.js');
  if (searchStr.includes('node.js') || searchStr.includes('nodejs')) tags.add('Node.js');
  
  const result = Array.from(tags);
  return result.length > 0 ? result.slice(0, 6) : ['Developer', 'Engineering'];
}

interface Props {
  id: string;
  initialOpportunity: any;
}



export default function CareerDetailClient({ id, initialOpportunity }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  
  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formProfileUrl, setFormProfileUrl] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formCoverNote, setFormCoverNote] = useState("");
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "completed">("idle");
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Similar jobs
  const [similarOpportunities, setSimilarOpportunities] = useState<any[]>([]);

  // Load active opportunity
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 1. Check if mock key
      if (MOCK_JOBS[id]) {
        setJob(MOCK_JOBS[id]);
        analytics.jobView(MOCK_JOBS[id].id, MOCK_JOBS[id].title);
        setLoading(false);
        return;
      }

      // 2. Use initialOpportunity if supplied
      if (initialOpportunity) {
        setJob(initialOpportunity);
        analytics.jobView(initialOpportunity.id, initialOpportunity.title);
        setLoading(false);
        return;
      }

      // 3. Client-side fetch as fallback
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const result = await res.json();
        if (result.success && result.data) {
          setJob(result.data);
          analytics.jobView(result.data.id, result.data.title);
        } else {
          toast.error("Opportunity not found");
        }
      } catch (err) {
        console.error("Failed to load opportunity", err);
        toast.error("Failed to load opportunity listing");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, initialOpportunity]);

  // Load similar opportunities
  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await fetch("/api/opportunities");
        const result = await res.json();
        if (result.success && result.data) {
          const list: any[] = result.data;
          // Filter out current job and limit to 3
          const filtered = list.filter((opp: any) => opp.id !== id).slice(0, 3);
          
          if (filtered.length > 0) {
            setSimilarOpportunities(filtered);
          } else {
            // Fallback to mock keys excluding current
            const fallbackKeys = Object.keys(MOCK_JOBS).filter(key => key !== id).slice(0, 3);
            setSimilarOpportunities(fallbackKeys.map(k => MOCK_JOBS[k]));
          }
        }
      } catch (err) {
        console.error("Failed to load similar opportunities", err);
        // Fallback to mock keys
        const fallbackKeys = Object.keys(MOCK_JOBS).filter(key => key !== id).slice(0, 3);
        setSimilarOpportunities(fallbackKeys.map(k => MOCK_JOBS[k]));
      }
    };

    fetchSimilar();
  }, [id]);

  // Bookmark check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedJobs = JSON.parse(localStorage.getItem("velonx_saved_jobs") || "[]");
      setIsBookmarked(savedJobs.includes(id));
    }
  }, [id]);

  // GSAP Animations trigger on job load
  useEffect(() => {
    if (!loading && job && typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Simple character reveal logic
      const heading = document.getElementById("job-title-heading");
      if (heading) {
        const originalText = heading.textContent || "";
        // Only run character split animation if not already run
        if (!heading.querySelector(".char-reveal")) {
          heading.innerHTML = originalText.split("").map(char => {
            if (char === " ") return " ";
            return `<span class="char-reveal">${char}</span>`;
          }).join("");

          gsap.to(".char-reveal", {
            opacity: 1,
            y: 0,
            rotate: 0,
            stagger: 0.015,
            duration: 0.7,
            ease: "back.out(1.4)",
            delay: 0.1
          });
        }
      }

      // Entrance staggered fade ins
      const tl = gsap.timeline();
      tl.to(".reveal", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        onComplete: () => {
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
        }
      });
    }
  }, [loading, job]);

  // Bookmark toggler
  const toggleBookmark = () => {
    let savedJobs = JSON.parse(localStorage.getItem("velonx_saved_jobs") || "[]");
    
    if (savedJobs.includes(id)) {
      savedJobs = savedJobs.filter((key: string) => key !== id);
      setIsBookmarked(false);
      toast.success("Opportunity removed from bookmarks");
    } else {
      savedJobs.push(id);
      setIsBookmarked(true);
      toast.success("Opportunity bookmarked! 📝");
    }
    
    localStorage.setItem("velonx_saved_jobs", JSON.stringify(savedJobs));
    
    // Scale bounce animation
    const btn = document.getElementById("btn-save-job");
    if (btn) {
      gsap.fromTo(btn, { scale: 0.93 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
    }
  };

  const copyToClipboard = async (text: string) => {
    let copySuccessful = false;
    
    // 1. Try modern navigator.clipboard first
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        copySuccessful = true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, falling back to textarea copy:", err);
      }
    }

    // 2. Fallback to off-screen textarea method
    if (!copySuccessful) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccessful = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Fallback execCommand copy failed:", err);
      }
    }

    // Show copy result toast
    if (copySuccessful) {
      setIsShareCopied(true);
      toast.success("Listing link copied to clipboard! 📋");
      setTimeout(() => setIsShareCopied(false), 2000);
    } else {
      toast.error("Failed to copy link");
    }
  };

  // Link copy sharing helper
  const handleShare = async () => {
    const url = `${window.location.origin}/career/${job?.slug || id}`;
    analytics.share('native', 'job', job?.id || id);

    // 1. Check navigator.share first to keep user gesture context intact
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.company} — ${job?.title}`,
          text: `Check out this listing on Velonx!`,
          url,
        });
        toast.success("Shared successfully! 🎉");
      } catch (shareErr: any) {
        if (shareErr.name === "AbortError") {
          return; // User cancelled, do not fallback to copy
        }
        console.warn("Native share failed, falling back to copy to clipboard:", shareErr);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  // Open apply trigger (checks session first)
  const openApplyFlow = () => {
    if (status !== "authenticated") {
      setShowLoginModal(true);
      return;
    }
    if (job?.applyUrl) {
      analytics.jobApply(job.id, job.title);
      // Track application click in backend
      fetch(`/api/opportunities/${job.id}/apply`, { method: "POST" }).catch(e => console.error(e));
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
      toast.success(`Opening application for ${job.title}...`);
    } else {
      toast.error("Application link not available");
    }
  };

  // File drag-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateFileUpload(e.target.files[0]);
    }
  };

  // File upload visual simulator
  const simulateFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }
    setSelectedFile(file);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus("completed");
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  const resetUploadZone = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form submit Visual simulation
  const handleApplyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadStatus !== "completed") {
      toast.error("Please upload your resume to complete application");
      return;
    }

    setSubmitting(true);

    // Track application click in backend
    fetch(`/api/opportunities/${job.id}/apply`, { method: "POST" }).catch(e => console.error(e));

    setTimeout(() => {
      setSubmitting(false);
      setApplySuccess(true);
      toast.success("Application details sent! 🚀");
      
      // Auto open external applyUrl link after visual success delay
      setTimeout(() => {
        if (job?.applyUrl) {
          analytics.jobApply(job.id, job.title);
          window.open(job.applyUrl, "_blank");
        }
      }, 2000);
    }, 1500);
  };

  // Close modal dialogs
  const closeModals = () => {
    setShowApplyModal(false);
    // Reset states back
    setApplySuccess(false);
    setFormName("");
    setFormProfileUrl("");
    setFormGithubUrl("");
    setFormCoverNote("");
    resetUploadZone();
  };

  if (loading) {
    return <CareerDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-36 bg-background flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Opportunity Not Found</h2>
        <p className="text-muted-foreground mt-2">The listing you are looking for does not exist or has been closed.</p>
        <Link href="/career" className="btn btn-primary mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Careers
        </Link>
      </div>
    );
  }

  // Deduce logo details
  const initials = job.logoText || (job.company ? job.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO');
  const logoColors = ['#A78BFA', '#22D3EE', '#34D399', '#FCD34D', '#F9A8D4'];
  const charCode = job.company ? job.company.charCodeAt(0) : 0;
  const determinedLogoColor = job.logoColor || logoColors[charCode % logoColors.length];

  // Deduce stats
  const formattedSalary = job.salary || "Competitive / Stipend";
  const formattedLocation = job.location || "Remote / Office";
  const formattedDuration = job.duration || (job.type === "INTERNSHIP" ? "3-6 Months" : "Full-Time");
  const formattedExperience = job.exp || (job.type === "INTERNSHIP" ? "Student / Intern" : "Fresher / Junior");

  // Compute open/closed status based on deadline
  const isOpen = job.status === 'ACTIVE' && (!job.deadline || new Date(job.deadline) >= new Date());

  return (
    <div className="min-h-screen bg-background pt-8 relative overflow-hidden pb-16">
      
      {/* Background Animated Mesh Glow Elements */}
      <div className="mesh-glow-container">
        <div className="mesh-glow-node node-1"></div>
        <div className="mesh-glow-node node-2"></div>
        <div className="mesh-glow-node node-3"></div>
      </div>

      {/* Login Required Dialog Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-[#f97316]" />

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
              <p className="text-muted-foreground text-sm mb-1">
                You need to be logged in to apply for
              </p>
              <p className="text-primary font-semibold text-base mb-6">
                &ldquo;{job.title}&rdquo;
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/auth/login?callbackUrl=/career/${job?.slug || id}`)}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Apply
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full h-11 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION FORM DIALOG MODAL */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.65)" }}
          onClick={closeModals}
        >
          <div
            className="relative bg-card border border-border rounded-3xl p-8 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={closeModals}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {!applySuccess ? (
              <div className="dialog-form-wrapper">
                <h2 className="text-2xl font-bold text-foreground">Apply to {job.company}</h2>
                <p className="text-muted-foreground text-sm mb-6 mt-1">Submit your vetted project credentials</p>

                <form onSubmit={handleApplyFormSubmit} className="space-y-5">
                  <div className="input-field-group">
                    <input 
                      type="text" 
                      id="form-name" 
                      className={`input-field ${formName ? "has-value" : ""}`}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder=" " 
                      required 
                      autoComplete="name"
                    />
                    <label htmlFor="form-name" className="input-label">Full Name</label>
                  </div>

                  <div className="input-field-group">
                    <input 
                      type="url" 
                      id="form-profile-url" 
                      className={`input-field ${formProfileUrl ? "has-value" : ""}`}
                      value={formProfileUrl}
                      onChange={(e) => setFormProfileUrl(e.target.value)}
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="form-profile-url" className="input-label">Velonx Project Profile URL</label>
                  </div>

                  <div className="input-field-group">
                    <input 
                      type="url" 
                      id="form-github-url" 
                      className={`input-field ${formGithubUrl ? "has-value" : ""}`}
                      value={formGithubUrl}
                      onChange={(e) => setFormGithubUrl(e.target.value)}
                      placeholder=" " 
                      required 
                    />
                    <label htmlFor="form-github-url" className="input-label">GitHub Repository Link</label>
                  </div>

                  <div className="input-field-group">
                    <textarea 
                      id="form-cover-note" 
                      className={`input-field ${formCoverNote ? "has-value" : ""}`}
                      value={formCoverNote}
                      onChange={(e) => setFormCoverNote(e.target.value)}
                      rows={3} 
                      placeholder=" " 
                      style={{ resize: "none" }} 
                      required
                    ></textarea>
                    <label htmlFor="form-cover-note" className="input-label">Cover Note / Why you?</label>
                  </div>

                  {/* Resume Upload Zone */}
                  <div className="input-field-group">
                    {uploadStatus === "idle" && (
                      <div 
                        className={`resume-upload-zone ${dragOver ? "dragover" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="upload-icon w-6 h-6 text-muted-foreground" />
                        <span className="upload-text text-sm font-semibold text-foreground">Drag & drop your resume or click to upload</span>
                        <span className="upload-subtext text-xs text-muted-foreground">PDF, DOCX up to 5MB</span>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: "none" }} 
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileSelect}
                        />
                      </div>
                    )}

                    {uploadStatus !== "idle" && (
                      <div className="upload-progress-container flex flex-col gap-2">
                        <div className="upload-progress-bar-wrapper bg-border h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="upload-progress-bar bg-primary h-full transition-all duration-150" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="upload-progress-details flex justify-between items-center text-xs">
                          <span className="upload-filename truncate font-semibold text-foreground max-w-[70%]">
                            {selectedFile ? selectedFile.name : "resume.pdf"}
                          </span>
                          <span 
                            className={`upload-percentage font-bold ${uploadStatus === "completed" ? "text-teal-600" : "text-primary"}`}
                          >
                            {uploadStatus === "completed" ? "Completed ✓" : `${uploadProgress}%`}
                          </span>
                        </div>
                        {uploadStatus === "completed" && (
                          <button 
                            type="button" 
                            onClick={resetUploadZone}
                            className="text-[10px] text-red-500 font-bold self-start hover:underline mt-1"
                          >
                            Remove file
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn btn-primary form-submit-btn w-full flex items-center justify-center py-3 font-bold"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Submit Skill Application 🚀
                  </button>
                </form>
              </div>
            ) : (
              <div className="dialog-success-wrapper flex flex-col items-center text-center py-6">
                <div className="success-checkmark-wrapper w-20 h-20 mb-4 text-teal-600">
                  <svg className="success-checkmark w-20 h-20" viewBox="0 0 52 52">
                    <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-foreground">Application Submitted!</h2>
                <p className="text-muted-foreground text-sm max-w-sm mt-2">
                  Your Velonx profile and project credentials have been transmitted to the company’s core engineering leaders. Opening the final application step...
                </p>
                <button onClick={closeModals} className="btn btn-primary success-done-btn w-full max-w-50 mt-6">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="container px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/career">Careers</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span id="breadcrumb-active" className="truncate font-semibold text-foreground">
            {job.company} — {job.title}
          </span>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="career-detail-layout">
          
          {/* Top Hero Card (Full Width) */}
          <header className="card card-glass job-hero-card reveal opacity-0 transform translate-y-8">
            <div className="job-hero-top">
              {job.imageUrl ? (
                <div className="company-large-logo has-image">
                  <Image 
                    src={job.imageUrl} 
                    alt={job.company} 
                    width={90} 
                    height={90} 
                    className="object-contain w-full h-full rounded-xl" 
                  />
                </div>
              ) : (
                <div className="company-large-logo" style={{ color: determinedLogoColor }}>
                  {initials}
                </div>
              )}
              <div className="job-hero-info">
                <div className="badge-row">
                  <span className={`badge ${job.badgeClass || (job.type === 'INTERNSHIP' ? 'badge-cyan' : 'badge-violet')}`}>
                    {job.badge || (job.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'FULL-TIME')}
                  </span>
                  {isOpen ? (
                    <span className="badge badge-green badge-live">ACTIVE</span>
                  ) : (
                    <span className="badge font-bold py-1 px-3.5 rounded-full text-[10px] tracking-wide" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>CLOSED</span>
                  )}
                </div>
                <h1 id="job-title-heading">{job.title}</h1>
                <p className="text-muted-foreground text-sm font-semibold">{job.company} • Engineering Department</p>
              </div>
            </div>
            
            <div className="job-hero-stats">
              <div className="hero-stat-item">
                <span className="stat-icon-wrapper">
                  <IndianRupee className="w-4.5 h-4.5" />
                </span>
                <div className="hero-stat-details">
                  <span className="hero-stat-label">Stipend / Salary</span>
                  <strong className="text-foreground">{formattedSalary}</strong>
                </div>
              </div>
              <div className="hero-stat-item">
                <span className="stat-icon-wrapper">
                  <MapPin className="w-4.5 h-4.5" />
                </span>
                <div className="hero-stat-details">
                  <span className="hero-stat-label">Location</span>
                  <strong className="text-foreground">{formattedLocation}</strong>
                </div>
              </div>
              <div className="hero-stat-item">
                <span className="stat-icon-wrapper">
                  <Clock className="w-4.5 h-4.5" />
                </span>
                <div className="hero-stat-details">
                  <span className="hero-stat-label">Duration</span>
                  <strong className="text-foreground">{formattedDuration}</strong>
                </div>
              </div>
              <div className="hero-stat-item">
                <span className="stat-icon-wrapper">
                  <Briefcase className="w-4.5 h-4.5" />
                </span>
                <div className="hero-stat-details">
                  <span className="hero-stat-label">Experience</span>
                  <strong className="text-foreground">{formattedExperience}</strong>
                </div>
              </div>
              {job.deadline && (
                <div className="hero-stat-item">
                  <span className="stat-icon-wrapper">
                    <CalendarClock className="w-4.5 h-4.5" />
                  </span>
                  <div className="hero-stat-details">
                    <span className="hero-stat-label">Deadline</span>
                    <strong className={`${isOpen ? 'text-foreground' : 'text-red-500'}`}>
                      {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Left Column (Main Details Content) */}
          <main className="career-main-content reveal opacity-0 transform translate-y-8">
            
            {/* About the Role */}
            <article className="card card-glass content-block-card">
              <h2 className="job-section-title">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                About the Role
              </h2>
              <div className="flex flex-col gap-4">
                {(job.about || job.description || "").split('\n').filter((p: string) => p.trim()).map((para: string, idx: number) => (
                  <p key={idx} className="about-text">
                    {para}
                  </p>
                ))}
              </div>
            </article>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <article className="card card-glass content-block-card">
                <h2 className="job-section-title">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  Key Responsibilities
                </h2>
                <ul className="requirement-list">
                  {job.responsibilities.map((resp: string, idx: number) => (
                    <li key={idx}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="list-check-icon w-4 h-4 text-primary shrink-0 mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Requirements & Skills */}
            {job.requirements && job.requirements.length > 0 && (
              <article className="card card-glass content-block-card">
                <h2 className="job-section-title">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                  Requirements & Technical Skills
                </h2>
                <ul className="requirement-list">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="list-check-icon w-4 h-4 text-primary shrink-0 mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Technology Stack */}
            <article className="card card-glass content-block-card" id="tech-stack-card">
              <h2 className="job-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                Technology Stack
              </h2>
              <p className="about-text mb-4">Core technologies and libraries utilized daily in this role:</p>
              <div className="tech-stack-grid" id="job-tech-stack-container">
                {getTechStack(job).map((tech: string, idx: number) => (
                  <div key={idx} className="tech-tag-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    {tech}
                  </div>
                ))}
              </div>
            </article>

            {/* Perks removed as requested */}

          </main>

          {/* Right Column (Sidebar) */}
          <aside className="sidebar-wrapper reveal opacity-0 transform translate-y-8">
            
            {/* Action panel widget */}
            <div className="card card-glass action-panel-card">
              {isOpen ? (
                <button 
                  type="button"
                  onClick={openApplyFlow}
                  className="btn btn-primary w-full flex items-center justify-center py-3.5 font-bold"
                >
                  Apply For This Role ⚡
                </button>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-red-500 font-bold text-base">Applications Closed</p>
                  <p className="text-muted-foreground text-xs">
                    {job.deadline 
                      ? `The deadline was ${new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                      : 'This position is no longer accepting applications'}
                  </p>
                </div>
              )}
            </div>

            {/* Standalone Share Widget */}
            <div className="card card-glass p-5 flex items-center justify-center">
              <button 
                type="button"
                onClick={handleShare}
                className="btn-action-outline w-full flex items-center justify-center py-2.5 font-bold"
              >
                {isShareCopied ? (
                  <Check className="w-4.5 h-4.5 text-green-500 mr-2" />
                ) : (
                  <Share2 className="w-4.5 h-4.5 mr-2" />
                )}
                {isShareCopied ? "Link Copied!" : "Share Job"}
              </button>
            </div>

            {/* Timeline pipeline widget removed as requested */}
          </aside>

          {/* Similar Opportunities (Bottom Row) */}
          <section className="similar-jobs-section reveal opacity-0 transform translate-y-8">
            <div className="similar-jobs-title-row">
              <h2 className="text-2xl font-extrabold text-foreground">Explore Other Openings</h2>
              <Link href="/career" className="btn btn-secondary btn-sm flex items-center gap-1">
                View All Opportunities ⚡
              </Link>
            </div>
            <div className="similar-jobs-grid">
              {similarOpportunities.map((item, idx) => {
                const itemInitials = item.company ? item.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO';
                const itemLogoColor = logoColors[item.company ? item.company.charCodeAt(0) % logoColors.length : idx % logoColors.length];
                
                return (
                  <article key={item.id || idx} className="card similar-job-card flex flex-col justify-between">
                    <div>
                      <div className="similar-job-header">
                        {item.imageUrl ? (
                          <div className="similar-job-logo has-image">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.company} 
                              width={46} 
                              height={46} 
                              className="object-contain w-full h-full rounded-md" 
                            />
                          </div>
                        ) : (
                          <div className="similar-job-logo" style={{ color: itemLogoColor }}>
                            {itemInitials}
                          </div>
                        )}
                        <div className="similar-job-meta">
                          <h3 className="similar-job-title truncate max-w-45">{item.title}</h3>
                          <span className="similar-job-company text-xs text-muted-foreground">{item.company}</span>
                        </div>
                      </div>
                      
                      <div className="similar-job-tags mt-3.5">
                        {getTechStack(item).slice(0, 3).map((tag: string, tagIdx: number) => (
                          <span key={tagIdx} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="similar-job-stats my-3.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {item.salary || "Competitive"}</span>
                      </div>

                      <Link href={`/career/${item.slug || item.id}`} className="btn btn-secondary btn-sm w-full flex items-center justify-center font-bold text-center">
                        View Listing
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
