"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle2, Sparkles, Briefcase, GraduationCap, Link as LinkIcon, Github, Twitter } from "lucide-react";
import toast from "react-hot-toast";
import { isValidGitHubUrl, isValidTwitterUrl, isValidLinkedInUrl } from "@/lib/validations/mentor";

export default function ApplyMentorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    company: '',
    expertise: [] as string[],
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    yearsOfExperience: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
  });

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && formData.expertise.length < 10) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()],
      });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index),
    });
  };

  const validateUrl = (field: 'linkedinUrl' | 'githubUrl' | 'twitterUrl', value: string) => {
    if (!value) {
      // Empty is valid for optional fields
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }

    let isValid = false;
    let errorMessage = '';

    switch (field) {
      case 'linkedinUrl':
        isValid = isValidLinkedInUrl(value);
        errorMessage = 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)';
        break;
      case 'githubUrl':
        isValid = isValidGitHubUrl(value);
        errorMessage = 'Please enter a valid GitHub URL (e.g., https://github.com/username)';
        break;
      case 'twitterUrl':
        isValid = isValidTwitterUrl(value);
        errorMessage = 'Please enter a valid Twitter URL (e.g., https://twitter.com/username or https://x.com/username)';
        break;
    }

    setValidationErrors(prev => ({ ...prev, [field]: isValid ? '' : errorMessage }));
    return isValid;
  };

  const handleUrlChange = (field: 'linkedinUrl' | 'githubUrl' | 'twitterUrl', value: string) => {
    setFormData({ ...formData, [field]: value });
    validateUrl(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.expertise.length === 0) {
      toast.error('Please add at least one area of expertise');
      return;
    }

    // Validate all URL fields before submission
    const linkedinValid = validateUrl('linkedinUrl', formData.linkedinUrl);
    const githubValid = validateUrl('githubUrl', formData.githubUrl);
    const twitterValid = validateUrl('twitterUrl', formData.twitterUrl);

    if (!linkedinValid || !githubValid || !twitterValid) {
      toast.error('Please fix the URL validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Get CSRF token for the POST request
      const { getCSRFToken } = await import('@/lib/utils/csrf');
      const csrfToken = await getCSRFToken();

      // Create a user request for mentor application
      const response = await fetch('/api/user-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'MENTOR_APPLICATION',
          reason: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company,
            expertise: formData.expertise,
            bio: formData.bio,
            linkedinUrl: formData.linkedinUrl || null,
            githubUrl: formData.githubUrl || null,
            twitterUrl: formData.twitterUrl || null,
            yearsOfExperience: formData.yearsOfExperience,
          }),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl py-20">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-[#023047] mb-4">
              Application Submitted!
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Thank you for applying to become a mentor. Our team will review your application and get back to you within 3-5 business days.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-bold text-[#023047] mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Our team reviews your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We&apos;ll contact you for a brief interview</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Once approved, you&apos;ll be added to our mentor directory</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl px-8"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => router.push('/mentors')}
                variant="outline"
                className="border-2 border-border hover:border-[#219EBC] text-foreground font-bold rounded-xl px-8"
              >
                Browse Mentors
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-[#219EBC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9C46A]/10 border border-[#E9C46A]/30 px-4 py-2 text-sm font-medium text-[#8B7A52] mb-6">
            <Sparkles className="w-4 h-4" />
            Become a Mentor
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#023047] mb-4">
            Share Your Knowledge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Join our community of mentors and help shape the next generation of tech professionals. Share your experience, guide aspiring developers, and make a lasting impact.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
            <CardHeader className="p-12 border-b border-gray-50">
              <CardTitle className="text-2xl font-black text-[#023047]">
                Mentor Application
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Tell us about yourself and your expertise
              </p>
            </CardHeader>
            <CardContent className="p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#023047] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#219EBC]" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-bold text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#023047] flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#219EBC]" />
                    Professional Background
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-bold text-foreground">
                        Current Company *
                      </Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g., Google, Microsoft, Startup Inc."
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm font-bold text-foreground">
                        Years of Experience *
                      </Label>
                      <Input
                        id="experience"
                        type="number"
                        required
                        min="1"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        placeholder="5"
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-sm font-bold text-foreground flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn Profile (Optional)
                    </Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleUrlChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className={`h-12 bg-gray-50 border-0 rounded-xl ${validationErrors.linkedinUrl ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {validationErrors.linkedinUrl && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.linkedinUrl}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub Profile (Optional)
                      </Label>
                      <Input
                        id="github"
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => handleUrlChange('githubUrl', e.target.value)}
                        placeholder="https://github.com/username"
                        className={`h-12 bg-gray-50 border-0 rounded-xl ${validationErrors.githubUrl ? 'ring-2 ring-red-500' : ''}`}
                      />
                      {validationErrors.githubUrl && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.githubUrl}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter Profile (Optional)
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={formData.twitterUrl}
                        onChange={(e) => handleUrlChange('twitterUrl', e.target.value)}
                        placeholder="https://twitter.com/username"
                        className={`h-12 bg-gray-50 border-0 rounded-xl ${validationErrors.twitterUrl ? 'ring-2 ring-red-500' : ''}`}
                      />
                      {validationErrors.twitterUrl && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.twitterUrl}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-foreground">
                    Areas of Expertise * (Add at least 1)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddExpertise();
                        }
                      }}
                      placeholder="e.g., React, Node.js, Python, AI/ML"
                      className="h-12 bg-gray-50 border-0 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={handleAddExpertise}
                      disabled={!expertiseInput.trim() || formData.expertise.length >= 10}
                      className="h-12 px-6 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                    >
                      Add
                    </Button>
                  </div>
                  {formData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.expertise.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-[#219EBC]/10 text-[#219EBC] border-0 font-bold px-3 py-1.5 text-sm hover:bg-[#219EBC]/20 cursor-pointer"
                          onClick={() => handleRemoveExpertise(index)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.expertise.length}/10 skills added. Click on a skill to remove it.
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-bold text-foreground">
                    Tell us about yourself *
                  </Label>
                  <textarea
                    id="bio"
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Share your background, what you're passionate about, and why you want to become a mentor..."
                    maxLength={1000}
                    className="w-full h-40 bg-gray-50 border-0 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#219EBC] resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio.length}/1000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-xl text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
