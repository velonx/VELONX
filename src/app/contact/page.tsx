"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Mail,
  MapPin,
  Send,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────── */
type Subject =
  | "General Inquiry"
  | "Partnership"
  | "Technical Support"
  | "Feature Request"
  | "Other";

const SUBJECTS: Subject[] = [
  "General Inquiry",
  "Partnership",
  "Technical Support",
  "Feature Request",
  "Other",
];

/* ─── Animation variants ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

/* ─── SubjectChip ────────────────────────────────────────── */
function SubjectChip({
  label,
  selected,
  onClick,
}: {
  label: Subject;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl text-sm font-bold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:ring-offset-2 ${
        selected
          ? "bg-[#219EBC] text-white border-[#219EBC] shadow-lg shadow-[#219EBC]/25"
          : "bg-card text-muted-foreground border-border hover:border-[#219EBC]/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<Subject>("General Inquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    message.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response body was not valid JSON (e.g. 502 from gateway)
      }

      if (!res.ok || !data.success) {
        // data.error may be a string, an object {message:...}, or undefined
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : typeof data.error?.message === "string"
            ? data.error.message
            : res.status === 500
            ? "Server error — please try again later."
            : "Failed to send message. Please try again.";
        throw new Error(errMsg);
      }

      setSent(true);
    } catch (err: any) {
      setError(
        typeof err.message === "string" && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24">
        {/* subtle grid bg decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#219EBC 1px,transparent 1px),linear-gradient(90deg,#219EBC 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#219EBC]/10 blur-[120px]"
        />

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/20 text-[#219EBC] text-sm font-bold mb-8"
          >
            <MessageSquare className="w-4 h-4" />
            We respond within 24 hours
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight tracking-tight"
          >
            Get in{" "}
            <span className="relative">
              <span className="text-[#219EBC]">Touch</span>
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full fill-[#219EBC]/30"
              >
                <path d="M0,8 Q100,0 200,8" stroke="#219EBC" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
          >
            Have a question, idea, or want to partner? Drop us a message and
            we'll get back to you.
          </motion.p>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="pb-32 -mt-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* ── Contact Form (3/5) ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:col-span-3"
            >
              <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-xl shadow-black/5">
                <AnimatePresence mode="wait">
                  {sent ? (
                    /* ── Success screen ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-black text-foreground mb-3">
                        Message Sent!
                      </h2>
                      <p className="text-muted-foreground text-lg mb-2">
                        Thanks, <span className="font-bold text-foreground">{name}</span>!
                      </p>
                      <p className="text-muted-foreground max-w-sm">
                        We've received your message and sent a confirmation to{" "}
                        <span className="text-[#219EBC] font-semibold">{email}</span>.
                        Expect a reply within 1–2 business days.
                      </p>
                      <button
                        onClick={() => {
                          setSent(false);
                          setName("");
                          setEmail("");
                          setSubject("General Inquiry");
                          setMessage("");
                        }}
                        className="mt-8 text-sm font-bold text-[#219EBC] hover:underline"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    /* ── Form ── */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-7"
                      noValidate
                    >
                      <div>
                        <h2 className="text-2xl font-black text-foreground mb-1">
                          Send us a message
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Fill in the form and we'll be in touch shortly.
                        </p>
                      </div>

                      {/* Name + Email */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label
                            htmlFor="contact-name"
                            className="block text-xs font-bold text-muted-foreground uppercase tracking-widest"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            maxLength={100}
                            required
                            className="w-full h-14 bg-muted border border-border rounded-2xl px-5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-transparent transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="contact-email"
                            className="block text-xs font-bold text-muted-foreground uppercase tracking-widest"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="w-full h-14 bg-muted border border-border rounded-2xl px-5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Subject chips */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Subject
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.map((s) => (
                            <SubjectChip
                              key={s}
                              label={s}
                              selected={subject === s}
                              onClick={() => setSubject(s)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="contact-message"
                            className="block text-xs font-bold text-muted-foreground uppercase tracking-widest"
                          >
                            Message <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs text-muted-foreground">
                            {message.length}/5000
                          </span>
                        </div>
                        <textarea
                          id="contact-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us how we can help you..."
                          rows={5}
                          maxLength={5000}
                          required
                          className="w-full bg-muted border border-border rounded-[20px] px-5 py-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-red-600 dark:text-red-400 text-sm"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      {/* Submit */}
                      <button
                        id="contact-submit-btn"
                        type="submit"
                        disabled={!isValid || loading}
                        className="w-full h-14 flex items-center justify-center gap-2 bg-[#023047] hover:bg-[#054a6d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl text-base shadow-xl shadow-[#023047]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Sidebar (2/5) ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="lg:col-span-2 space-y-6 lg:pt-2"
            >
              {/* Email card */}
              <motion.div
                variants={fadeUp}
                className="bg-card border border-border rounded-[28px] p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-[#219EBC]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#219EBC]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Email Us
                  </p>
                  <a
                    href="mailto:hello@velonx.com"
                    className="text-foreground font-black hover:text-[#219EBC] transition-colors"
                  >
                    hello@velonx.com
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    We reply within 1–2 business days
                  </p>
                </div>
              </motion.div>

              {/* Location card */}
              <motion.div
                variants={fadeUp}
                className="bg-card border border-border rounded-[28px] p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-[#023047]/10 dark:bg-[#219EBC]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#023047] dark:text-[#219EBC]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Headquarters
                  </p>
                  <p className="text-foreground font-black">Silicon Valley, CA, USA</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remote-first team worldwide
                  </p>
                </div>
              </motion.div>

              {/* Response time badge */}
              <motion.div
                variants={fadeUp}
                className="bg-gradient-to-br from-[#219EBC] to-[#023047] rounded-[28px] p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </div>
                  <span className="text-sm font-bold opacity-90">Average Response Time</span>
                </div>
                <p className="text-4xl font-black mb-1">&lt; 24h</p>
                <p className="text-sm opacity-75">Mon – Fri, 9 AM – 6 PM PST</p>
              </motion.div>

              {/* Useful links */}
              <motion.div
                variants={fadeUp}
                className="bg-card border border-border rounded-[28px] p-6"
              >
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Useful Resources
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "About VELONX", path: "/about" },
                    { label: "Terms of Service", path: "/terms" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Blog & Updates", path: "/blog" },
                  ].map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold text-foreground hover:bg-muted group transition-all"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#219EBC] group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
