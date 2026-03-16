"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  Star,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  company: string;
  bio: string;
  imageUrl?: string;
  rating: number;
  totalSessions: number;
  available: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

export default function MentorCRUD() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    expertise: [] as string[],
    bio: "",
    imageUrl: "",
    rating: 0,
    totalSessions: 0,
    available: true,
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
  });
  const [expertiseInput, setExpertiseInput] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mentors?pageSize=100");
      const data = await response.json();
      if (data.success) {
        setMentors(data.data);
      }
    } catch (error) {
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "velonx/mentors");

    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && formData.expertise.length < 20) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()],
      });
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index),
    });
  };

  const handleOpenDialog = (mentor?: Mentor) => {
    if (mentor) {
      setEditingMentor(mentor);
      setFormData({
        name: mentor.name,
        email: mentor.email,
        company: mentor.company,
        expertise: mentor.expertise,
        bio: mentor.bio,
        imageUrl: mentor.imageUrl || "",
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
        available: mentor.available,
        linkedinUrl: mentor.linkedinUrl || "",
        githubUrl: mentor.githubUrl || "",
        twitterUrl: mentor.twitterUrl || "",
      });
    } else {
      setEditingMentor(null);
      setFormData({
        name: "",
        email: "",
        company: "",
        expertise: [],
        bio: "",
        imageUrl: "",
        rating: 0,
        totalSessions: 0,
        available: true,
        linkedinUrl: "",
        githubUrl: "",
        twitterUrl: "",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.expertise.length === 0) {
      toast.error("Please add at least one area of expertise");
      return;
    }

    setLoading(true);
    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const url = editingMentor
        ? `/api/mentors/${editingMentor.id}`
        : "/api/mentors";
      const method = editingMentor ? "PATCH" : "POST";

      // Prepare data with proper types and null handling
      const submitData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        expertise: formData.expertise,
        bio: formData.bio,
        imageUrl: formData.imageUrl || undefined,
        rating: formData.rating || 0,
        totalSessions: formData.totalSessions || 0,
        available: formData.available,
        linkedinUrl: formData.linkedinUrl || null,
        githubUrl: formData.githubUrl || null,
        twitterUrl: formData.twitterUrl || null,
      };

      console.log('Submitting mentor data:', submitData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        toast.error('Invalid server response');
        return;
      }

      if (response.ok && data.success) {
        toast.success(
          editingMentor
            ? "Mentor updated successfully"
            : "Mentor created successfully"
        );
        setShowDialog(false);
        fetchMentors();
      } else {
        console.error('Mentor save error:', data);
        
        if (data.error?.details?.errors) {
          const errorMessages = data.error.details.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join('; ');
          toast.error(errorMessages);
        } else {
          toast.error(data.error?.message || "Failed to save mentor");
        }
      }
    } catch (error) {
      toast.error("Failed to save mentor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mentorId: string, mentorName: string) => {
    if (!confirm(`Are you sure you want to delete ${mentorName}?`)) return;

    setLoading(true);
    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const response = await fetch(`/api/mentors/${mentorId}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Mentor deleted successfully");
        fetchMentors();
      } else {
        toast.error(data.error?.message || "Failed to delete mentor");
      }
    } catch (error) {
      toast.error("Failed to delete mentor");
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#219EBC]" />
              Mentor Management
            </CardTitle>
            <p className="text-muted-foreground">
              Create, update, and manage mentors
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="h-12 px-6 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Mentor
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, company, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 bg-muted/40 border-border rounded-xl"
            />
          </div>
        </div>

        {/* Mentors List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No mentors found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by adding your first mentor"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="bg-muted/40 border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                      {mentor.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mentor.imageUrl}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        mentor.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 truncate">
                        {mentor.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="truncate">{mentor.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{mentor.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-foreground">
                        {mentor.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mentor.totalSessions} sessions
                    </div>
                    <div className="ml-auto">
                      {mentor.available ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                      <Badge
                        key={idx}
                        className="bg-[#219EBC]/10 text-[#219EBC] border-[#219EBC]/20 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge className="bg-muted text-muted-foreground border-border text-xs">
                        +{mentor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenDialog(mentor)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(mentor.id, mentor.name)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingMentor ? "Edit Mentor" : "Add New Mentor"}
            </DialogTitle>
            <DialogDescription>
              {editingMentor ? "Update mentor information and settings" : "Fill in the details to add a new mentor to the platform"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {formData.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl cursor-pointer font-bold text-sm"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max size: 5MB. Formats: JPG, PNG, WebP
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Google, Microsoft, etc."
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available">Availability</Label>
                <select
                  id="available"
                  value={formData.available ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      available: e.target.value === "true",
                    })
                  }
                  className="w-full h-12 bg-background border border-border rounded-xl px-4"
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expertise * (Add at least 1)</Label>
              <div className="flex gap-2">
                <Input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder="e.g., React, Node.js, Python"
                  className="h-12"
                />
                <Button
                  type="button"
                  onClick={handleAddExpertise}
                  disabled={
                    !expertiseInput.trim() || formData.expertise.length >= 20
                  }
                  className="h-12 px-6"
                >
                  Add
                </Button>
              </div>
              {formData.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.expertise.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-[#219EBC]/10 text-[#219EBC] border-[#219EBC]/20 cursor-pointer hover:bg-[#219EBC]/20"
                      onClick={() => handleRemoveExpertise(index)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <textarea
                id="bio"
                required
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about this mentor..."
                className="w-full h-32 bg-background border border-border rounded-xl p-4 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                  className="h-12"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingMentor ? (
                  "Update Mentor"
                ) : (
                  "Create Mentor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
