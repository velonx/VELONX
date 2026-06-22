"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AvatarSection from "@/components/settings/AvatarSection";
import { Loader2, CheckCircle2, XCircle, GraduationCap, Link2, User } from "lucide-react";

interface ProfileSettingsFormProps {
  initialData: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
    headline: string | null;
    college: string | null;
    graduationYear: number | null;
    skills: string[];
    location: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    twitterUrl: string | null;
    portfolioUrl: string | null;
  };
}

interface FormState {
  name: string;
  bio: string;
  avatar: string | null;
  headline: string;
  college: string;
  graduationYear: string;
  skills: string; // Comma-separated input
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const { update: updateSession } = useSession();

  // Initialize state
  const [formState, setFormState] = useState<FormState>({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
    headline: initialData.headline || "",
    college: initialData.college || "",
    graduationYear: initialData.graduationYear ? String(initialData.graduationYear) : "",
    skills: initialData.skills?.join(", ") || "",
    location: initialData.location || "",
    linkedinUrl: initialData.linkedinUrl || "",
    githubUrl: initialData.githubUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    portfolioUrl: initialData.portfolioUrl || "",
    isLoading: false,
    error: null,
    success: false,
  });

  // Track original values
  const [originalValues, setOriginalValues] = useState({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
    headline: initialData.headline || "",
    college: initialData.college || "",
    graduationYear: initialData.graduationYear ? String(initialData.graduationYear) : "",
    skills: initialData.skills?.join(", ") || "",
    location: initialData.location || "",
    linkedinUrl: initialData.linkedinUrl || "",
    githubUrl: initialData.githubUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    portfolioUrl: initialData.portfolioUrl || "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (avatar: string) => {
    setFormState((prev) => ({ ...prev, avatar }));
  };

  const handleImageUpload = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    const { getCSRFToken } = await import("@/lib/utils/csrf");
    const csrfToken = await getCSRFToken();

    const response = await fetch("/api/user/profile/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ image: base64 }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to upload image");
    }

    setFormState((prev) => ({ ...prev, avatar: result.data.url }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) errors.name = "Name is required";
    if (formState.graduationYear && isNaN(Number(formState.graduationYear))) {
      errors.graduationYear = "Graduation year must be a valid number";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: false,
    }));

    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      // Format skills as array
      const skillsArray = formState.skills
        ? formState.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          bio: formState.bio.trim() || null,
          avatar: formState.avatar,
          headline: formState.headline.trim() || null,
          college: formState.college.trim() || null,
          graduationYear: formState.graduationYear ? Number(formState.graduationYear) : null,
          skills: skillsArray,
          location: formState.location.trim() || null,
          linkedinUrl: formState.linkedinUrl.trim() || null,
          githubUrl: formState.githubUrl.trim() || null,
          twitterUrl: formState.twitterUrl.trim() || null,
          portfolioUrl: formState.portfolioUrl.trim() || null,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to update profile");
      }

      if (updateSession) {
        await updateSession({
          name: result.data.name,
          image: result.data.image,
        });
      }

      const updatedVals = {
        name: formState.name,
        bio: formState.bio,
        avatar: formState.avatar,
        headline: formState.headline,
        college: formState.college,
        graduationYear: formState.graduationYear,
        skills: formState.skills,
        location: formState.location,
        linkedinUrl: formState.linkedinUrl,
        githubUrl: formState.githubUrl,
        twitterUrl: formState.twitterUrl,
        portfolioUrl: formState.portfolioUrl,
      };

      setOriginalValues(updatedVals);
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));
    } catch (error: any) {
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "An error occurred",
      }));
    }
  };

  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      ...originalValues,
      error: null,
      success: false,
    }));
    setValidationErrors({});
  };

  const hasChanges = Object.keys(originalValues).some(
    (key) => formState[key as keyof FormState] !== originalValues[key as keyof typeof originalValues]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <AvatarSection
        currentAvatar={formState.avatar}
        onAvatarChange={handleAvatarChange}
        onImageUpload={handleImageUpload}
        isLoading={formState.isLoading}
      />

      {/* Group 1: Personal Info */}
      <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-primary" />
          Personal Info
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email (Read-only)</Label>
            <Input id="email" value={initialData.email} disabled className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Display Name *</Label>
            <Input id="name" value={formState.name} onChange={(e) => handleInputChange("name", e.target.value)} className="bg-white/5 border-white/10 text-gray-100" />
            {validationErrors.name && <p className="text-xs text-red-400">{validationErrors.name}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline" className="text-gray-300">Professional Headline</Label>
          <Input id="headline" value={formState.headline} onChange={(e) => handleInputChange("headline", e.target.value)} placeholder="e.g. Full-Stack Developer | CS Student" className="bg-white/5 border-white/10 text-gray-100" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-gray-300">Location</Label>
          <Input id="location" value={formState.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="e.g. Bengaluru, India" className="bg-white/5 border-white/10 text-gray-100" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-gray-300">Bio</Label>
          <Textarea id="bio" value={formState.bio} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Tell others about yourself..." className="bg-white/5 border-white/10 text-gray-100 min-h-24" />
        </div>
      </div>

      {/* Group 2: Academic & Career */}
      <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Academic &amp; Skills
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="college" className="text-gray-300">College / University</Label>
            <Input id="college" value={formState.college} onChange={(e) => handleInputChange("college", e.target.value)} placeholder="e.g. IIT Delhi" className="bg-white/5 border-white/10 text-gray-100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradYear" className="text-gray-300">Graduation Year</Label>
            <Input id="gradYear" value={formState.graduationYear} onChange={(e) => handleInputChange("graduationYear", e.target.value)} placeholder="e.g. 2026" className="bg-white/5 border-white/10 text-gray-100" />
            {validationErrors.graduationYear && <p className="text-xs text-red-400">{validationErrors.graduationYear}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills" className="text-gray-300">Skills (Comma-separated)</Label>
          <Input id="skills" value={formState.skills} onChange={(e) => handleInputChange("skills", e.target.value)} placeholder="e.g. React, Node.js, Python, TypeScript" className="bg-white/5 border-white/10 text-gray-100" />
        </div>
      </div>

      {/* Group 3: Links */}
      <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-primary" />
          Social &amp; Portfolio Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-gray-300">LinkedIn URL</Label>
            <Input id="linkedin" value={formState.linkedinUrl} onChange={(e) => handleInputChange("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/username" className="bg-white/5 border-white/10 text-gray-100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="text-gray-300">GitHub URL</Label>
            <Input id="github" value={formState.githubUrl} onChange={(e) => handleInputChange("githubUrl", e.target.value)} placeholder="https://github.com/username" className="bg-white/5 border-white/10 text-gray-100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-gray-300">Twitter URL</Label>
            <Input id="twitter" value={formState.twitterUrl} onChange={(e) => handleInputChange("twitterUrl", e.target.value)} placeholder="https://twitter.com/username" className="bg-white/5 border-white/10 text-gray-100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-gray-300">Portfolio URL</Label>
            <Input id="portfolio" value={formState.portfolioUrl} onChange={(e) => handleInputChange("portfolioUrl", e.target.value)} placeholder="https://portfolio.com" className="bg-white/5 border-white/10 text-gray-100" />
          </div>
        </div>
      </div>

      {/* Messages */}
      {formState.success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">Profile updated successfully!</p>
        </div>
      )}

      {formState.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{formState.error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={formState.isLoading || !hasChanges}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl"
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={formState.isLoading || !hasChanges}
          className="border-white/20 text-gray-300 hover:bg-white/5 font-bold rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
