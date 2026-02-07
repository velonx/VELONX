"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle2, Sparkles, Lightbulb, Code } from "lucide-react";
import toast from "react-hot-toast";

export default function SubmitProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    goals: '',
    teamSize: '',
  });
  const [techInput, setTechInput] = useState('');

  const handleAddTech = () => {
    if (techInput.trim() && formData.techStack.length < 15) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.techStack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    setLoading(true);

    try {
      // Create a user request for project submission
      const response = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROJECT_SUBMISSION',
          reason: JSON.stringify({
            title: formData.title,
            description: formData.description,
            techStack: formData.techStack,
            goals: formData.goals,
            teamSize: formData.teamSize,
            submittedBy: session?.user?.id,
          }),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error?.message || 'Failed to submit project idea');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit project idea');
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
              Project Idea Submitted!
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Thank you for submitting your project idea. Our team will review it and get back to you within 48 hours.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-bold text-[#023047] mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Our team reviews your project idea</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Once approved, it will appear in "Running Projects"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Other students can request to join your project</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You'll manage join requests from your dashboard</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/projects')}
                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl px-8"
              >
                Browse Projects
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-2 border-border hover:border-[#219EBC] text-foreground font-bold rounded-xl px-8"
              >
                Back to Home
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
            Submit Project Idea
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#023047] mb-4">
            Build Something Amazing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Have an innovative project idea? Share it with our community! Once approved, you'll lead the project and collaborate with talented students.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
            <CardHeader className="p-12 border-b border-gray-50">
              <CardTitle className="text-2xl font-black text-[#023047]">
                Project Submission
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Tell us about your project idea
              </p>
            </CardHeader>
            <CardContent className="p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#023047] flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#219EBC]" />
                    Project Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold text-foreground">
                      Project Title *
                    </Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., AI-Powered Study Buddy, Community Food Sharing App"
                      className="h-12 bg-gray-50 border-0 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold text-foreground">
                      Project Description *
                    </Label>
                    <textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what your project does, the problem it solves, and its key features..."
                      maxLength={1000}
                      className="w-full h-40 bg-gray-50 border-0 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#219EBC] resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.description.length}/1000 characters
                    </p>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#023047] flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#219EBC]" />
                    Technical Stack
                  </h3>
                  
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-foreground">
                      Technologies * (Add at least 1)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTech();
                          }
                        }}
                        placeholder="e.g., React, Node.js, Python, MongoDB"
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTech}
                        disabled={!techInput.trim() || formData.techStack.length >= 15}
                        className="h-12 px-6 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                      >
                        Add
                      </Button>
                    </div>
                    {formData.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.techStack.map((tech, index) => (
                          <Badge
                            key={index}
                            className="bg-[#219EBC]/10 text-[#219EBC] border-0 font-bold px-3 py-1.5 text-sm hover:bg-[#219EBC]/20 cursor-pointer"
                            onClick={() => handleRemoveTech(index)}
                          >
                            {tech} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.techStack.length}/15 technologies added. Click on a tech to remove it.
                    </p>
                  </div>
                </div>

                {/* Project Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-sm font-bold text-foreground">
                    Project Goals & Expected Outcomes *
                  </Label>
                  <textarea
                    id="goals"
                    required
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="What do you hope to achieve with this project? What will be the final deliverables?"
                    maxLength={500}
                    className="w-full h-32 bg-gray-50 border-0 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#219EBC] resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.goals.length}/500 characters
                  </p>
                </div>

                {/* Team Size */}
                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-sm font-bold text-foreground">
                    Ideal Team Size *
                  </Label>
                  <Input
                    id="teamSize"
                    type="number"
                    required
                    min="2"
                    max="10"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    placeholder="e.g., 4"
                    className="h-12 bg-gray-50 border-0 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many team members (including you) would be ideal for this project?
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
                      Submitting Project...
                    </>
                  ) : (
                    'Submit Project Idea'
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
