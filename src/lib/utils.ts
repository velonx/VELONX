import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskSensitiveData(text: string): string {
  if (!text) return "";
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4,10}/g;

  return text
    .replace(emailRegex, '[email@protected]')
    .replace(phoneRegex, (match) => {
      const digitsOnly = match.replace(/\D/g, "");
      if (digitsOnly.length < 8) return match;
      return '[phone hidden]';
    });
}

export function normalizeStylizedText(text: string): string {
  if (!text) return "";
  return Array.from(text).map(char => {
    const cp = char.codePointAt(0);
    if (!cp) return char;

    // Mathematical Alphanumeric Symbols range: U+1D400 to U+1D7FF
    if (cp >= 0x1D400 && cp <= 0x1D7FF) {
      // Bold serif
      if (cp >= 0x1D400 && cp <= 0x1D419) return String.fromCodePoint(cp - 0x1D400 + 0x41);
      if (cp >= 0x1D41A && cp <= 0x1D433) return String.fromCodePoint(cp - 0x1D41A + 0x61);
      // Italic serif
      if (cp >= 0x1D434 && cp <= 0x1D44D) return String.fromCodePoint(cp - 0x1D434 + 0x41);
      if (cp >= 0x1D44E && cp <= 0x1D467) return String.fromCodePoint(cp - 0x1D44E + 0x61);
      // Bold italic serif
      if (cp >= 0x1D468 && cp <= 0x1D481) return String.fromCodePoint(cp - 0x1D468 + 0x41);
      if (cp >= 0x1D482 && cp <= 0x1D49B) return String.fromCodePoint(cp - 0x1D482 + 0x61);
      // Script
      if (cp >= 0x1D49C && cp <= 0x1D4B5) return String.fromCodePoint(cp - 0x1D49C + 0x41);
      if (cp >= 0x1D4B6 && cp <= 0x1D4CF) return String.fromCodePoint(cp - 0x1D4B6 + 0x61);
      // Fraktur
      if (cp >= 0x1D504 && cp <= 0x1D51D) return String.fromCodePoint(cp - 0x1D504 + 0x41);
      if (cp >= 0x1D51E && cp <= 0x1D537) return String.fromCodePoint(cp - 0x1D51E + 0x61);
      // Sans-serif
      if (cp >= 0x1D5A0 && cp <= 0x1D5B9) return String.fromCodePoint(cp - 0x1D5A0 + 0x41);
      if (cp >= 0x1D5BA && cp <= 0x1D5D3) return String.fromCodePoint(cp - 0x1D5BA + 0x61);
      // Sans-serif bold
      if (cp >= 0x1D5D4 && cp <= 0x1D5ED) return String.fromCodePoint(cp - 0x1D5D4 + 0x41);
      if (cp >= 0x1D5EE && cp <= 0x1D607) return String.fromCodePoint(cp - 0x1D5EE + 0x61);
      // Sans-serif italic
      if (cp >= 0x1D608 && cp <= 0x1D621) return String.fromCodePoint(cp - 0x1D608 + 0x41);
      if (cp >= 0x1D622 && cp <= 0x1D63B) return String.fromCodePoint(cp - 0x1D622 + 0x61);
      // Sans-serif bold italic
      if (cp >= 0x1D63C && cp <= 0x1D655) return String.fromCodePoint(cp - 0x1D63C + 0x41);
      if (cp >= 0x1D656 && cp <= 0x1D66F) return String.fromCodePoint(cp - 0x1D656 + 0x61);
      // Monospace
      if (cp >= 0x1D670 && cp <= 0x1D689) return String.fromCodePoint(cp - 0x1D670 + 0x41);
      if (cp >= 0x1D68A && cp <= 0x1D6A3) return String.fromCodePoint(cp - 0x1D68A + 0x61);
    }
    return char;
  }).join("");
}

export function slugifyPost(postId: string, content: string): string {
  const normalized = normalizeStylizedText(content);
  let cleaned = normalized
    .replace(/(?:\s*#\w+)+\s*$/, "") // remove tags
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-"); // merge spaces and dashes into a single dash
  
  if (cleaned.length > 80) {
    cleaned = cleaned.slice(0, 80).replace(/-$/, "");
  }
  return cleaned ? `${postId}-${cleaned}` : postId;
}

export function slugifyResource(id: string, title: string): string {
  const normalized = normalizeStylizedText(title || "");
  let cleaned = normalized
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-");

  if (cleaned.length > 60) {
    cleaned = cleaned.slice(0, 60).replace(/-$/, "");
  }
  return cleaned ? `${cleaned}-${id}` : id;
}

export function extractIdFromSlug(slugOrId: string): string {
  if (!slugOrId) return "";
  const trimmed = slugOrId.trim();

  // If it's already a 24-character hex ObjectId
  if (trimmed.match(/^[0-9a-fA-F]{24}$/i)) return trimmed;

  // Match 24-character hex ObjectId preceded by hyphen or start
  const matchHex = trimmed.match(/(?:^|-)([0-9a-fA-F]{24})$/i);
  if (matchHex) return matchHex[1];

  return trimmed;
}




