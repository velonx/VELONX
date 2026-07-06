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

