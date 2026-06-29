"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AvatarSection from "@/components/settings/AvatarSection";
import CoverImageSection from "@/components/settings/CoverImageSection";
import { Loader2, CheckCircle2, XCircle, GraduationCap, Link2, User, Briefcase, FileText } from "lucide-react";

interface ProfileSettingsFormProps {
  initialData: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    coverImage?: string | null;
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
    resumeUrl?: string | null;
    resumeText?: string | null;
    lookingFor?: string | null;
  };
}

interface FormState {
  name: string;
  bio: string;
  avatar: string | null;
  coverImage: string | null;
  headline: string;
  college: string;
  graduationYear: string;
  skills: string; // Comma-separated input
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  resumeUrl: string | null;
  lookingFor: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const { update: updateSession } = useSession();

  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeTextExtracted, setResumeTextExtracted] = useState<boolean>(
    !!(initialData.resumeText && initialData.resumeText.trim().length > 20)
  );

  // Initialize state
  const [formState, setFormState] = useState<FormState>({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
    coverImage: initialData.coverImage || null,
    headline: initialData.headline || "",
    college: initialData.college || "",
    graduationYear: initialData.graduationYear ? String(initialData.graduationYear) : "",
    skills: initialData.skills?.join(", ") || "",
    location: initialData.location || "",
    linkedinUrl: initialData.linkedinUrl || "",
    githubUrl: initialData.githubUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    portfolioUrl: initialData.portfolioUrl || "",
    resumeUrl: initialData.resumeUrl || null,
    lookingFor: initialData.lookingFor || "",
    isLoading: false,
    error: null,
    success: false,
  });

  // Track original values
  const [originalValues, setOriginalValues] = useState({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
    coverImage: initialData.coverImage || null,
    headline: initialData.headline || "",
    college: initialData.college || "",
    graduationYear: initialData.graduationYear ? String(initialData.graduationYear) : "",
    skills: initialData.skills?.join(", ") || "",
    location: initialData.location || "",
    linkedinUrl: initialData.linkedinUrl || "",
    githubUrl: initialData.githubUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    portfolioUrl: initialData.portfolioUrl || "",
    resumeUrl: initialData.resumeUrl || null,
    lookingFor: initialData.lookingFor || "",
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

  const handleCoverChange = (coverImage: string | null) => {
    setFormState((prev) => ({ ...prev, coverImage }));
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

  const handleCoverUpload = async (file: File) => {
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

    setFormState((prev) => ({ ...prev, coverImage: result.data.url }));
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFormState((prev) => ({
        ...prev,
        error: "Only PDF format is supported for resumes.",
      }));
      return;
    }

    setIsResumeUploading(true);
    setFormState((prev) => ({ ...prev, error: null, success: false }));

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const response = await fetch("/api/user/profile/upload-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ resume: base64, fileName: file.name }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to upload resume");
      }

      setFormState((prev) => ({ ...prev, resumeUrl: result.data.url }));
      setResumeTextExtracted(!!result.data.textExtracted);
    } catch (error: any) {
      setFormState((prev) => ({
        ...prev,
        error: error.message || "An error occurred during resume upload",
      }));
    } finally {
      setIsResumeUploading(false);
    }
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
          coverImage: formState.coverImage,
          headline: formState.headline.trim() || null,
          college: formState.college.trim() || null,
          graduationYear: formState.graduationYear ? Number(formState.graduationYear) : null,
          skills: skillsArray,
          location: formState.location.trim() || null,
          linkedinUrl: formState.linkedinUrl.trim() || null,
          githubUrl: formState.githubUrl.trim() || null,
          twitterUrl: formState.twitterUrl.trim() || null,
          portfolioUrl: formState.portfolioUrl.trim() || null,
          resumeUrl: formState.resumeUrl || null,
          lookingFor: formState.lookingFor || null,
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
          profileComplete: result.data.profileComplete,
        });
      }

      const updatedVals = {
        name: formState.name,
        bio: formState.bio,
        avatar: formState.avatar,
        coverImage: formState.coverImage,
        headline: formState.headline,
        college: formState.college,
        graduationYear: formState.graduationYear,
        skills: formState.skills,
        location: formState.location,
        linkedinUrl: formState.linkedinUrl,
        githubUrl: formState.githubUrl,
        twitterUrl: formState.twitterUrl,
        portfolioUrl: formState.portfolioUrl,
        resumeUrl: formState.resumeUrl,
        lookingFor: formState.lookingFor,
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
      {/* Cover Image */}
      <CoverImageSection
        currentCover={formState.coverImage}
        onCoverChange={handleCoverChange}
        onImageUpload={handleCoverUpload}
        isLoading={formState.isLoading}
      />

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
            <Label htmlFor="email" className="text-foreground/90 font-medium">Email (Read-only)</Label>
            <Input id="email" value={initialData.email} disabled className="bg-muted/40 border-border text-muted-foreground cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/90 font-medium">Display Name *</Label>
            <Input id="name" value={formState.name} onChange={(e) => handleInputChange("name", e.target.value)} className="bg-background border-border text-foreground" />
            {validationErrors.name && <p className="text-xs text-red-400">{validationErrors.name}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline" className="text-foreground/90 font-medium">Professional Headline</Label>
          <Input id="headline" value={formState.headline} onChange={(e) => handleInputChange("headline", e.target.value)} placeholder="e.g. Full-Stack Developer | CS Student" className="bg-background border-border text-foreground" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-foreground/90 font-medium">Location</Label>
          <Input id="location" value={formState.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="e.g. Bengaluru, India" className="bg-background border-border text-foreground" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-foreground/90 font-medium">Bio</Label>
          <Textarea id="bio" value={formState.bio} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Tell others about yourself..." className="bg-background border-border text-foreground min-h-24" />
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
            <Label htmlFor="college" className="text-foreground/90 font-medium">College / University</Label>
            <Input id="college" value={formState.college} onChange={(e) => handleInputChange("college", e.target.value)} placeholder="e.g. IIT Delhi" className="bg-background border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradYear" className="text-foreground/90 font-medium">Graduation Year</Label>
            <Input id="gradYear" value={formState.graduationYear} onChange={(e) => handleInputChange("graduationYear", e.target.value)} placeholder="e.g. 2026" className="bg-background border-border text-foreground" />
            {validationErrors.graduationYear && <p className="text-xs text-red-400">{validationErrors.graduationYear}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills" className="text-foreground/90 font-medium">Skills (Comma-separated)</Label>
          <Input id="skills" value={formState.skills} onChange={(e) => handleInputChange("skills", e.target.value)} placeholder="e.g. React, Node.js, Python, TypeScript" className="bg-background border-border text-foreground" />
        </div>
      </div>

      {/* Group 3: Career & Resume */}
      <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Career &amp; Resume
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="lookingFor" className="text-foreground/90 font-medium">What are you looking for? *</Label>
            <select
              id="lookingFor"
              value={formState.lookingFor}
              onChange={(e) => handleInputChange("lookingFor", e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select option...</option>
              <option value="INTERNSHIP">Internships Only</option>
              <option value="JOB">Full-Time Jobs Only</option>
              <option value="BOTH">Both Internships &amp; Jobs</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume" className="text-foreground/90 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Upload Resume (PDF only) *
            </Label>
            <div className="flex flex-col gap-2">
              <input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleResumeFileChange}
                disabled={isResumeUploading || formState.isLoading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {isResumeUploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Uploading &amp; extracting resume text for AI...
                </div>
              )}
              {formState.resumeUrl ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resume uploaded!</span>
                    <a
                      href={formState.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:text-primary/80 font-bold ml-1"
                    >
                      View PDF
                    </a>
                  </div>
                  {resumeTextExtracted ? (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                      <span>✨</span>
                      AI can read your resume — matching accuracy is high
                    </div>
                  ) : (
                    <div className="text-xs text-yellow-500">
                      ⚙️ Resume text not extracted yet — re-upload to enable full AI matching
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-orange-400 font-semibold">
                  ⚠️ Resume is required to complete your profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group 4: Links */}
      <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-primary" />
          Social &amp; Portfolio Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-foreground/90 font-medium">LinkedIn URL</Label>
            <Input id="linkedin" value={formState.linkedinUrl} onChange={(e) => handleInputChange("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/username" className="bg-background border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="text-foreground/90 font-medium">GitHub URL</Label>
            <Input id="github" value={formState.githubUrl} onChange={(e) => handleInputChange("githubUrl", e.target.value)} placeholder="https://github.com/username" className="bg-background border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-foreground/90 font-medium">Twitter URL</Label>
            <Input id="twitter" value={formState.twitterUrl} onChange={(e) => handleInputChange("twitterUrl", e.target.value)} placeholder="https://twitter.com/username" className="bg-background border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-foreground/90 font-medium">Portfolio URL</Label>
            <Input id="portfolio" value={formState.portfolioUrl} onChange={(e) => handleInputChange("portfolioUrl", e.target.value)} placeholder="https://portfolio.com" className="bg-background border-border text-foreground" />
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
          className="border-border text-foreground hover:bg-muted font-bold rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
