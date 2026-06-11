"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit, Trash2, XCircle, Download, Eye, Plus, FileText, ArrowLeft, Link as LinkIcon, Compass, Award } from "lucide-react";
import toast from "react-hot-toast";
import { getCSRFToken } from "@/lib/utils/csrf";
import PDFUploadField, { PDFMetadata } from "@/components/admin/PDFUploadField";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";
import Image from "next/image";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url?: string;
  imageUrl?: string;
  accessCount: number;
  pdfUrl?: string;
  pdfPublicId?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  badgeName?: string;
  badgeImageUrl?: string;
  hasCertificate?: boolean;
  modules?: Module[];
  createdAt: string;
}

interface TestSchedule {
  id: string;
  userId: string;
  pathId: string;
  testDate: string;
  status: string;
  score: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  learningPath: {
    id: string;
    title: string;
    hasCertificate: boolean;
  };
}

interface Module {
  id: string;
  pathId: string;
  title: string;
  description: string;
  link: string;
  duration: string;
  order: number;
}

export default function ResourceManagement() {
  // Navigation / Tabs
  const [adminSubTab, setAdminSubTab] = useState<"references" | "paths">("references");

  // ==========================================
  // QUICK REFERENCES STATE & HANDLERS
  // ==========================================
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceImagePreview, setResourceImagePreview] = useState<string | null>(null);
  const [uploadingResourceImage, setUploadingResourceImage] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPDF, setFilterPDF] = useState<"all" | "with-pdf" | "without-pdf">("all");
  const resourceFormRef = useRef<HTMLDivElement>(null);
  const resourceFormElementRef = useRef<HTMLFormElement>(null);

  const { isDragging, dragHandlers } = useDragAndDrop((files) => {
    if (uploadingResourceImage) return;
    const file = files[0];
    if (file) {
      const input = document.getElementById("resourceImageUpload") as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  useEffect(() => {
    fetchResources();
    fetchLearningPaths();
    fetchTestSchedules();
  }, []);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const response = await fetch('/api/resources?pageSize=100');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setResources(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load resources';
      toast.error(errorMessage);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    setDeletingResourceId(id);
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Resource deleted successfully!");
        fetchResources();
      } else {
        throw new Error(data.error?.message || 'Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete resource';
      toast.error(errorMessage);
    } finally {
      setDeletingResourceId(null);
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceImagePreview(resource.imageUrl || null);
    if (resource.pdfUrl && resource.pdfPublicId && resource.pdfFileName && resource.pdfFileSize) {
      setPdfMetadata({
        url: resource.pdfUrl,
        publicId: resource.pdfPublicId,
        fileName: resource.pdfFileName,
        fileSize: resource.pdfFileSize,
      });
    } else {
      setPdfMetadata(undefined);
    }
    setTimeout(() => {
      resourceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelResourceEdit = () => {
    setEditingResource(null);
    setResourceImagePreview(null);
    setPdfMetadata(undefined);
    if (resourceFormElementRef.current) {
      resourceFormElementRef.current.reset();
    }
  };

  const handleNewResource = () => {
    setEditingResource(null);
    setResourceImagePreview(null);
    setPdfMetadata(undefined);
    if (resourceFormElementRef.current) {
      resourceFormElementRef.current.reset();
    }
    setTimeout(() => {
      resourceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredResources = resources.filter((resource) => {
    if (filterPDF === "with-pdf" && !resource.pdfUrl) return false;
    if (filterPDF === "without-pdf" && resource.pdfUrl) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        (resource.pdfFileName && resource.pdfFileName.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // ==========================================
  // LEARNING PATHS STATE & HANDLERS
  // ==========================================
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [deletingPathId, setDeletingPathId] = useState<string | null>(null);
  const [pathSearchQuery, setPathSearchQuery] = useState("");

  // Test Schedules Queue state
  const [testSchedules, setTestSchedules] = useState<TestSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const fetchTestSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const response = await fetch('/api/learning-paths/test-schedules');
      const data = await response.json();
      if (data.success) {
        setTestSchedules(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load test schedules');
      }
    } catch (error) {
      console.error('Error fetching test schedules:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId: string, status: "PASSED" | "FAILED", score?: number) => {
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/learning-paths/test-schedules/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ status, score }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Exam status marked as ${status}!`);
        fetchTestSchedules();
        fetchLearningPaths();
      } else {
        throw new Error(data.error?.message || "Failed to update test status");
      }
    } catch (error) {
      console.error("Error updating test status:", error);
      toast.error(error instanceof Error ? error.message : "Error updating status");
    }
  };
  
  // Modules management state
  const [activePathForModules, setActivePathForModules] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  const pathFormRef = useRef<HTMLDivElement>(null);
  const moduleFormRef = useRef<HTMLDivElement>(null);

  const fetchLearningPaths = async () => {
    setLoadingPaths(true);
    try {
      const response = await fetch('/api/learning-paths');
      const data = await response.json();
      if (data.success) {
        setLearningPaths(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load learning paths');
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load learning paths');
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleEditPath = (path: LearningPath) => {
    setEditingPath(path);
    setTimeout(() => {
      pathFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNewPath = () => {
    setEditingPath(null);
    setTimeout(() => {
      pathFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeletePath = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the roadmap "${title}"? This will also delete all of its modules.`)) {
      return;
    }
    setDeletingPathId(id);
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Learning path deleted successfully!");
        fetchLearningPaths();
        if (activePathForModules?.id === id) {
          setActivePathForModules(null);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to delete path');
      }
    } catch (error) {
      console.error('Error deleting learning path:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete path');
    } finally {
      setDeletingPathId(null);
    }
  };

  const handleManageModules = async (path: LearningPath) => {
    setActivePathForModules(path);
    fetchPathModules(path.id);
  };

  const fetchPathModules = async (pathId: string) => {
    setLoadingModules(true);
    try {
      const response = await fetch(`/api/learning-paths/${pathId}`);
      const data = await response.json();
      if (data.success) {
        setModules(data.data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error("Failed to load modules for this path");
    } finally {
      setLoadingModules(false);
    }
  };

  const handleEditModule = (mod: Module) => {
    setEditingModule(mod);
    setTimeout(() => {
      moduleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete module "${title}"?`)) {
      return;
    }
    setDeletingModuleId(moduleId);
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/learning-paths/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Module deleted successfully!");
        if (activePathForModules) {
          fetchPathModules(activePathForModules.id);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete module');
    } finally {
      setDeletingModuleId(null);
    }
  };

  // Filter learning paths
  const filteredPaths = learningPaths.filter((path) => {
    if (pathSearchQuery) {
      const q = pathSearchQuery.toLowerCase();
      return (
        path.title.toLowerCase().includes(q) ||
        path.description.toLowerCase().includes(q) ||
        (path.badgeName && path.badgeName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-12">
      {/* Sub Tab Switcher */}
      <div className="flex border-b border-gray-100 pb-4 mb-6 gap-6">
        <button
          onClick={() => {
            setAdminSubTab("references");
            setActivePathForModules(null);
          }}
          className={`pb-2 text-lg font-black transition-all border-b-2 px-1 cursor-pointer ${
            adminSubTab === "references"
              ? "border-[#226CE0] text-[#1A234A]"
              : "border-transparent text-gray-400 hover:text-[#1A234A]"
          }`}
        >
          Quick References
        </button>
        <button
          onClick={() => setAdminSubTab("paths")}
          className={`pb-2 text-lg font-black transition-all border-b-2 px-1 cursor-pointer ${
            adminSubTab === "paths"
              ? "border-[#226CE0] text-[#1A234A]"
              : "border-transparent text-gray-400 hover:text-[#1A234A]"
          }`}
        >
          Learning Paths
        </button>
      </div>

      {adminSubTab === "references" ? (
        // ==========================================
        // QUICK REFERENCES MANAGEMENT VIEW
        // ==========================================
        <>
          <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
            <CardHeader className="p-12 border-b border-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-black text-[#1A234A] mb-2">Manage References</h3>
                  <p className="text-gray-400">View, edit, and delete cheat sheets & PDF resources</p>
                </div>
                <Button
                  onClick={handleNewResource}
                  className="h-12 px-6 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#226CE0]/20 hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search resources by title, description, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 bg-gray-50 border-0 rounded-xl"
                  />
                </div>
                <select
                  value={filterPDF}
                  onChange={(e) => setFilterPDF(e.target.value as "all" | "with-pdf" | "without-pdf")}
                  className="h-12 px-4 bg-gray-50 border-0 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#226CE0] outline-none"
                >
                  <option value="all">All Resources</option>
                  <option value="with-pdf">With PDF</option>
                  <option value="without-pdf">Without PDF</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-12">
              {loadingResources ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading resources...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-bold">
                    {searchQuery || filterPDF !== "all" ? "No resources found" : "No resources yet"}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery || filterPDF !== "all"
                      ? "Try adjusting your search or filter"
                      : "Add your first learning resource to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#226CE0]/20 hover:-translate-y-1"
                    >
                      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
                        {resource.imageUrl ? (
                          <Image
                            src={resource.imageUrl}
                            alt={resource.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            width={500}
                            height={500}
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#226CE0]/10 to-[#1A234A]/10 transition-all duration-300 group-hover:from-[#226CE0]/20 group-hover:to-[#1A234A]/20">
                            <BookOpen className="w-16 h-16 text-gray-300 transition-transform duration-300 group-hover:scale-110" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-[#1A234A] line-clamp-2 flex-1">
                            {resource.title}
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-blue-50 text-blue-600 border-0 font-bold text-xs">
                            {resource.type}
                          </Badge>
                          <Badge className="bg-purple-50 text-purple-600 border-0 font-bold text-xs">
                            {resource.category}
                          </Badge>
                          {resource.pdfUrl && (
                            <Badge className="bg-red-50 text-red-600 border-0 font-bold text-xs flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Eye className="w-4 h-4" />
                          <span>{resource.accessCount} views</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditResource(resource)}
                            className="flex-1 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm hover:shadow-md hover:scale-105 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id, resource.title)}
                            disabled={deletingResourceId === resource.id}
                            className="flex-1 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105 cursor-pointer"
                          >
                            {deletingResourceId === resource.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div ref={resourceFormRef}>
            <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
              <CardHeader className="p-12 border-b border-gray-50">
                <h3 className="text-3xl font-black text-[#1A234A] mb-2">
                  {editingResource ? 'Edit Reference' : 'Add New Reference'}
                </h3>
                <p className="text-gray-400">
                  {editingResource ? 'Update reference guide information' : 'Add a new PDF cheat sheet or downloadable reference'}
                </p>
              </CardHeader>
              <CardContent className="p-12">
                <form ref={resourceFormElementRef} className="space-y-8" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const url = formData.get('url') as string;
                  
                  if (!url && !pdfMetadata) {
                    toast.error("Please provide either a URL or upload a PDF file");
                    return;
                  }

                  setLoadingResources(true);
                  try {
                    const resourceData = {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      category: formData.get('category') as string,
                      type: formData.get('type') as string,
                      url: url || undefined,
                      imageUrl: (formData.get('imageUrl') as string) || undefined,
                      pdfUrl: pdfMetadata?.url,
                      pdfPublicId: pdfMetadata?.publicId,
                      pdfFileName: pdfMetadata?.fileName,
                      pdfFileSize: pdfMetadata?.fileSize,
                    };

                    const csrfToken = await getCSRFToken();
                    const apiUrl = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources';
                    const method = editingResource ? 'PATCH' : 'POST';

                    const response = await fetch(apiUrl, {
                      method,
                      headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken,
                      },
                      credentials: 'include',
                      body: JSON.stringify(resourceData),
                    });

                    const data = await response.json();
                    if (data.success) {
                      toast.success(editingResource ? "Reference updated! 🎉" : "Reference created! 🎉");
                      form.reset();
                      setResourceImagePreview(null);
                      setPdfMetadata(undefined);
                      setEditingResource(null);
                      fetchResources();
                    } else {
                      throw new Error(data.error?.message || 'Failed to save resource');
                    }
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Failed to save resource');
                  } finally {
                    setLoadingResources(false);
                  }
                }}>
                  {editingResource && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-bold">Editing: {editingResource.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelResourceEdit}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                    <Input
                      name="title"
                      required
                      placeholder="e.g., Ultimate Git Cheat Sheet"
                      className="h-14 bg-gray-50 border-0 rounded-2xl"
                      defaultValue={editingResource?.title || ''}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full bg-gray-50 border-0 rounded-4xl p-6 outline-none focus:ring-2 focus:ring-[#226CE0] transition-all text-foreground text-sm"
                      placeholder="Describe this cheat sheet..."
                      defaultValue={editingResource?.description || ''}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                      <select
                        name="category"
                        required
                        className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#226CE0] outline-none text-foreground font-medium"
                        defaultValue={editingResource?.category || ''}
                      >
                        <option value="">Select a category</option>
                        <option value="PROGRAMMING">Programming</option>
                        <option value="DESIGN">Design</option>
                        <option value="BUSINESS">Business</option>
                        <option value="DATA_SCIENCE">Data Science</option>
                        <option value="DEVOPS">DevOps</option>
                        <option value="MOBILE">Mobile</option>
                        <option value="WEB">Web</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Type *</label>
                      <select
                        name="type"
                        required
                        className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#226CE0] outline-none text-foreground font-medium"
                        defaultValue={editingResource?.type || ''}
                      >
                        <option value="">Select a type</option>
                        <option value="ARTICLE">Article</option>
                        <option value="VIDEO">Video</option>
                        <option value="COURSE">Course</option>
                        <option value="BOOK">Book</option>
                        <option value="TOOL">Tool</option>
                        <option value="DOCUMENTATION">Documentation</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Resource URL {!pdfMetadata && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      name="url"
                      type="url"
                      required={!pdfMetadata}
                      placeholder="e.g., https://github.com/cheat-sheets"
                      className="h-14 bg-gray-50 border-0 rounded-2xl"
                      defaultValue={editingResource?.url || ''}
                    />
                  </div>

                  <PDFUploadField
                    onUploadComplete={(metadata) => {
                      setPdfMetadata(metadata);
                      toast.success("PDF uploaded successfully!");
                    }}
                    onUploadError={(error) => {
                      toast.error(error);
                    }}
                    existingPDF={pdfMetadata}
                    disabled={loadingResources}
                  />

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thumbnail Image URL</label>
                    <Input
                      name="imageUrl"
                      type="url"
                      placeholder="Paste image URL here..."
                      className="h-14 bg-gray-50 border-0 rounded-2xl"
                      defaultValue={editingResource?.imageUrl || ''}
                      onChange={(e) => setResourceImagePreview(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loadingResources}
                    className="w-full h-16 bg-[#226CE0] hover:bg-[#334DAF] text-white font-black rounded-3xl text-lg shadow-xl shadow-[#226CE0]/20 cursor-pointer"
                  >
                    {loadingResources ? 'Saving...' : editingResource ? 'Update Reference' : 'Create Reference'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // ==========================================
        // LEARNING PATHS MANAGEMENT VIEW
        // ==========================================
        <>
          {activePathForModules ? (
            // MODULES MANAGER
            <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
              <CardHeader className="p-12 border-b border-gray-50">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActivePathForModules(null);
                      setEditingModule(null);
                    }}
                    className="h-10 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Paths
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-[#1A234A] mb-1">
                      Modules: <span className="text-[#226CE0]">{activePathForModules.title}</span>
                    </h3>
                    <p className="text-gray-400">Add, edit, and arrange steps for this learning path.</p>
                  </div>
                  <Badge className="bg-[#226CE0]/10 text-[#226CE0] border-0 font-bold px-3 py-1.5 rounded-full">
                    {modules.length} Modules total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                {/* Modules list table */}
                <div className="bg-gray-50 rounded-3xl p-6">
                  {loadingModules ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#226CE0] mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading modules...</p>
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-center py-8">
                      <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-500 font-bold">No modules in this path yet</p>
                      <p className="text-gray-400 text-xs mt-1">Add a module below to start building the roadmap.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((mod, index) => (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#226CE0]/20 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#226CE0]/10 text-[#226CE0] flex items-center justify-center font-black">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-[#1A234A]">{mod.title}</h4>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{mod.description}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  ⏱️ {mod.duration}
                                </span>
                                <a
                                  href={mod.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-[#226CE0] hover:underline flex items-center gap-1"
                                >
                                  <LinkIcon className="w-3 h-3" /> Target URL
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditModule(mod)}
                              className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(mod.id, mod.title)}
                              disabled={deletingModuleId === mod.id}
                              className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {deletingModuleId === mod.id ? (
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add/Edit Module Form */}
                <div ref={moduleFormRef} className="border-t border-gray-100 pt-8">
                  <h4 className="text-xl font-black text-[#1A234A] mb-6">
                    {editingModule ? "Edit Module Checkpoint" : "Add Module Checkpoint"}
                  </h4>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSavingModule(true);
                      const form = e.currentTarget;
                      const formData = new FormData(form);

                      try {
                        const moduleData = {
                          title: formData.get("modTitle") as string,
                          description: formData.get("modDesc") as string,
                          link: formData.get("modLink") as string,
                          duration: formData.get("modDuration") as string,
                          order: editingModule ? editingModule.order : modules.length + 1,
                        };

                        const csrfToken = await getCSRFToken();
                        const apiUrl = editingModule
                          ? `/api/learning-paths/modules/${editingModule.id}`
                          : `/api/learning-paths/${activePathForModules.id}/modules`;

                        const response = await fetch(apiUrl, {
                          method: editingModule ? "PATCH" : "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-csrf-token": csrfToken,
                          },
                          body: JSON.stringify(moduleData),
                        });

                        const data = await response.json();
                        if (data.success) {
                          toast.success(editingModule ? "Module updated!" : "Module added!");
                          form.reset();
                          setEditingModule(null);
                          fetchPathModules(activePathForModules.id);
                        } else {
                          throw new Error(data.error?.message || "Failed to save module");
                        }
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Error saving module");
                      } finally {
                        setSavingModule(false);
                      }
                    }}
                    className="space-y-6"
                  >
                    {editingModule && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-blue-600 font-bold">Editing module order #{editingModule.order}</span>
                        <button
                          type="button"
                          onClick={() => setEditingModule(null)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                        <Input
                          name="modTitle"
                          required
                          placeholder="e.g. 1. Basic Array Mechanics"
                          defaultValue={editingModule?.title || ""}
                          className="h-12 bg-gray-50 border-0 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Duration *</label>
                        <Input
                          name="modDuration"
                          required
                          placeholder="e.g. 3 hours"
                          defaultValue={editingModule?.duration || ""}
                          className="h-12 bg-gray-50 border-0 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description *</label>
                      <Input
                        name="modDesc"
                        required
                        placeholder="Explain what the student will learn in this module..."
                        defaultValue={editingModule?.description || ""}
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Resource Link (Destination URL) *</label>
                      <Input
                        name="modLink"
                        type="url"
                        required
                        placeholder="e.g. https://leetcode.com/explore/featured/card/fun-with-arrays/"
                        defaultValue={editingModule?.link || ""}
                        className="h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={savingModule}
                      className="h-12 px-6 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl cursor-pointer"
                    >
                      {savingModule ? "Saving..." : editingModule ? "Update Module" : "Add Module to Path"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            // PATHS LISTING
            <>
              <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
                <CardHeader className="p-12 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-[#1A234A] mb-2">Learning Paths</h3>
                      <p className="text-gray-400">Define interactive student roadmaps, badges, and certificates</p>
                    </div>
                    <Button
                      onClick={handleNewPath}
                      className="h-12 px-6 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#226CE0]/20 hover:scale-105 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Path
                    </Button>
                  </div>

                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Search roadmaps by title, description, or badge name..."
                      value={pathSearchQuery}
                      onChange={(e) => setPathSearchQuery(e.target.value)}
                      className="h-12 bg-gray-50 border-0 rounded-xl"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  {loadingPaths ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading learning paths...</p>
                    </div>
                  ) : filteredPaths.length === 0 ? (
                    <div className="text-center py-12">
                      <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg font-bold">No learning paths found</p>
                      <p className="text-gray-400 text-sm mt-2">Create a path to build interactive student guides.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPaths.map((path) => (
                        <div
                          key={path.id}
                          className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#226CE0]/20 hover:-translate-y-1 flex flex-col justify-between"
                        >
                          <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex flex-wrap gap-1.5">
                                <Badge className="bg-[#226CE0]/10 text-[#226CE0] font-black border-0">
                                  {path.level}
                                </Badge>
                                {path.hasCertificate && (
                                  <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold text-xs">
                                    Certified
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs font-bold text-gray-400">⏱️ {path.duration}</span>
                            </div>

                            <div>
                              <h4 className="text-lg font-black text-[#1A234A]">{path.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">{path.description}</p>
                            </div>

                            {/* Badge details */}
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                              {path.badgeImageUrl ? (
                                <Image
                                  src={path.badgeImageUrl}
                                  alt={path.badgeName || "Badge"}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-contain rounded-lg"
                                  unoptimized
                                />
                              ) : (
                                <Award className="w-10 h-10 text-gray-300" />
                              )}
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Completing Badge</span>
                                <h5 className="text-xs font-bold text-[#1A234A] line-clamp-1">{path.badgeName || "None"}</h5>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 pt-0 space-y-2 border-t border-gray-50 mt-4">
                            <Button
                              onClick={() => handleManageModules(path)}
                              className="w-full h-10 bg-[#226CE0]/10 hover:bg-[#226CE0]/20 text-[#226CE0] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                            >
                              <Compass className="w-4 h-4" />
                              Manage Modules Checkpoints
                            </Button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPath(path)}
                                className="flex-1 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit Path
                              </button>
                              <button
                                onClick={() => handleDeletePath(path.id, path.title)}
                                disabled={deletingPathId === path.id}
                                className="flex-1 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {deletingPathId === path.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certificate Test Requests Queue */}
              <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden mt-12">
                <CardHeader className="p-12 border-b border-gray-50">
                  <h3 className="text-3xl font-black text-[#1A234A] mb-2">Certificate Exam Requests</h3>
                  <p className="text-gray-400">Review, schedule, and grade student final exams for certified roadmaps</p>
                </CardHeader>
                <CardContent className="p-12">
                  {loadingSchedules ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading exam requests...</p>
                    </div>
                  ) : testSchedules.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg font-bold">No exam requests yet</p>
                      <p className="text-gray-400 text-sm mt-2">When students finish a certified roadmap, their requested exam date will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="pb-4">Student</th>
                            <th className="pb-4">Roadmap</th>
                            <th className="pb-4">Requested Date</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Grade</th>
                            <th className="pb-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {testSchedules.map((schedule) => (
                            <tr key={schedule.id} className="text-sm">
                              <td className="py-6 flex items-center gap-3">
                                {schedule.user.image ? (
                                  <Image
                                    src={schedule.user.image}
                                    alt={schedule.user.name || "Student"}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                                    {(schedule.user.name || schedule.user.email)[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-[#1A234A]">{schedule.user.name || "No name"}</p>
                                  <p className="text-xs text-gray-400">{schedule.user.email}</p>
                                </div>
                              </td>
                              <td className="py-6">
                                <p className="font-semibold text-[#1A234A]">{schedule.learningPath.title}</p>
                              </td>
                              <td className="py-6 text-gray-500">
                                {new Date(schedule.testDate).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  schedule.status === "PASSED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : schedule.status === "FAILED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}>
                                  {schedule.status}
                                </span>
                              </td>
                              <td className="py-6 text-gray-600 font-bold">
                                {schedule.score !== null ? `${schedule.score}%` : "—"}
                              </td>
                              <td className="py-6 text-right">
                                {schedule.status === "PENDING" || schedule.status === "SCHEDULED" ? (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const scoreStr = prompt("Enter student score (0-100):", "90");
                                        if (scoreStr === null) return;
                                        const score = parseInt(scoreStr, 10);
                                        if (isNaN(score) || score < 0 || score > 100) {
                                          toast.error("Please enter a valid number between 0 and 100");
                                          return;
                                        }
                                        handleUpdateScheduleStatus(schedule.id, "PASSED", score);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                    >
                                      Approve & Pass
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to mark this test as failed/rejected?")) {
                                          handleUpdateScheduleStatus(schedule.id, "FAILED");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                    >
                                      Reject & Fail
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Reviewed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form to create/edit paths */}
              <div ref={pathFormRef}>
                <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
                  <CardHeader className="p-12 border-b border-gray-50">
                    <h3 className="text-3xl font-black text-[#1A234A] mb-2">
                      {editingPath ? "Edit Learning Path" : "Create Learning Path"}
                    </h3>
                    <p className="text-gray-400">
                      {editingPath ? "Update learning path details" : "Design a new step-by-step roadmap with modules and rewards"}
                    </p>
                  </CardHeader>
                  <CardContent className="p-12">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoadingPaths(true);
                        const form = e.currentTarget;
                        const formData = new FormData(form);

                        try {
                          const pathData = {
                            title: formData.get("pathTitle") as string,
                            description: formData.get("pathDesc") as string,
                            level: formData.get("pathLevel") as string,
                            duration: formData.get("pathDuration") as string,
                            badgeName: (formData.get("pathBadgeName") as string) || undefined,
                            badgeImageUrl: (formData.get("pathBadgeUrl") as string) || undefined,
                            hasCertificate: formData.get("hasCertificate") === "on",
                          };

                          const csrfToken = await getCSRFToken();
                          const apiUrl = editingPath ? `/api/learning-paths/${editingPath.id}` : "/api/learning-paths";
                          const method = editingPath ? "PATCH" : "POST";

                          const response = await fetch(apiUrl, {
                            method,
                            headers: {
                              "Content-Type": "application/json",
                              "x-csrf-token": csrfToken,
                            },
                            body: JSON.stringify(pathData),
                          });

                          const data = await response.json();
                          if (data.success) {
                            toast.success(editingPath ? "Learning path updated!" : "Learning path created!");
                            form.reset();
                            setEditingPath(null);
                            fetchLearningPaths();
                          } else {
                            throw new Error(data.error?.message || "Failed to save learning path");
                          }
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Error saving path");
                        } finally {
                          setLoadingPaths(false);
                        }
                      }}
                      className="space-y-8"
                    >
                      {editingPath && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                          <span className="text-blue-600 font-bold">Editing: {editingPath.title}</span>
                          <button
                            type="button"
                            onClick={() => setEditingPath(null)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-sm cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Path Title *</label>
                        <Input
                          name="pathTitle"
                          required
                          placeholder="e.g. Frontend Development Career Track"
                          defaultValue={editingPath?.title || ""}
                          className="h-14 bg-gray-50 border-0 rounded-2xl"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Path Description *</label>
                        <textarea
                          name="pathDesc"
                          required
                          rows={4}
                          placeholder="Provide a description of the career track or roadmap..."
                          defaultValue={editingPath?.description || ""}
                          className="w-full bg-gray-50 border-0 rounded-4xl p-6 outline-none focus:ring-2 focus:ring-[#226CE0] transition-all text-foreground text-sm"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Difficulty Level *</label>
                          <select
                            name="pathLevel"
                            required
                            className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#226CE0] outline-none text-foreground font-medium"
                            defaultValue={editingPath?.level || ""}
                          >
                            <option value="">Select level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Expected Duration *</label>
                          <Input
                            name="pathDuration"
                            required
                            placeholder="e.g. 6 Weeks"
                            defaultValue={editingPath?.duration || ""}
                            className="h-14 bg-gray-50 border-0 rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <input
                          type="checkbox"
                          id="hasCertificate"
                          name="hasCertificate"
                          defaultChecked={editingPath?.hasCertificate || false}
                          className="w-5 h-5 rounded border-gray-300 text-[#226CE0] focus:ring-[#226CE0]"
                        />
                        <div>
                          <label htmlFor="hasCertificate" className="text-sm font-bold text-[#1A234A] cursor-pointer">
                            Requires Certification Exam
                          </label>
                          <p className="text-xs text-gray-400 mt-1">
                            If enabled, students can schedule a final certificate test which the admin reviews and approves offline.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Reward Badge Name (Optional)</label>
                          <Input
                            name="pathBadgeName"
                            placeholder="e.g. React Master Builder"
                            defaultValue={editingPath?.badgeName || ""}
                            className="h-14 bg-gray-50 border-0 rounded-2xl"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Reward Badge Image URL (Optional)</label>
                          <Input
                            name="pathBadgeUrl"
                            placeholder="e.g. https://example.com/badge.png"
                            defaultValue={editingPath?.badgeImageUrl || ""}
                            className="h-14 bg-gray-50 border-0 rounded-2xl"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loadingPaths}
                        className="w-full h-16 bg-[#226CE0] hover:bg-[#334DAF] text-white font-black rounded-3xl text-lg shadow-xl shadow-[#226CE0]/20 cursor-pointer"
                      >
                        {loadingPaths ? "Saving..." : editingPath ? "Update Learning Path" : "Create Learning Path"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
