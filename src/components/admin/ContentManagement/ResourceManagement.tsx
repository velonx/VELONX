"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit, Trash2, XCircle, Download, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  imageUrl?: string;
  accessCount: number;
}

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceImagePreview, setResourceImagePreview] = useState<string | null>(null);
  const [uploadingResourceImage, setUploadingResourceImage] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const resourceFormRef = useRef<HTMLDivElement>(null);
  const resourceFormElementRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchResources();
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
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
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
    setTimeout(() => {
      resourceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelResourceEdit = () => {
    setEditingResource(null);
    setResourceImagePreview(null);
    if (resourceFormElementRef.current) {
      resourceFormElementRef.current.reset();
    }
  };

  const handleNewResource = () => {
    setEditingResource(null);
    setResourceImagePreview(null);
    if (resourceFormElementRef.current) {
      resourceFormElementRef.current.reset();
    }
    setTimeout(() => {
      resourceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-12">
      {/* Manage Resources Section */}
      <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
        <CardHeader className="p-12 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black text-[#023047] mb-2">Manage Resources</h3>
              <p className="text-gray-400">View, edit, and delete learning resources</p>
            </div>
            <Button 
              onClick={handleNewResource}
              className="h-12 px-6 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#219EBC]/20 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          {loadingResources ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-bold">No resources yet</p>
              <p className="text-gray-400 text-sm mt-2">Add your first learning resource to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#219EBC]/20 hover:-translate-y-1"
                >
                  {/* Resource Thumbnail */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
                    {resource.imageUrl ? (
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#219EBC]/10 to-[#023047]/10 transition-all duration-300 group-hover:from-[#219EBC]/20 group-hover:to-[#023047]/20">
                        <BookOpen className="w-16 h-16 text-gray-300 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    )}
                  </div>
                  
                  {/* Resource Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-bold text-[#023047] line-clamp-2 flex-1">
                        {resource.title}
                      </h4>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-50 text-blue-600 border-0 font-bold text-xs transition-all hover:bg-blue-100">
                        {resource.type}
                      </Badge>
                      <Badge className="bg-purple-50 text-purple-600 border-0 font-bold text-xs transition-all hover:bg-purple-100">
                        {resource.category}
                      </Badge>
                    </div>
                    
                    {/* Access Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Eye className="w-4 h-4" />
                      <span>{resource.accessCount} views</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditResource(resource)}
                        disabled={deletingResourceId === resource.id}
                        className="flex-1 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.id, resource.title)}
                        disabled={deletingResourceId === resource.id}
                        className="flex-1 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105"
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

      {/* Add/Edit Resource Form */}
      <div ref={resourceFormRef}>
        <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
          <CardHeader className="p-12 border-b border-gray-50">
            <h3 className="text-3xl font-black text-[#023047] mb-2">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h3>
            <p className="text-gray-400">
              {editingResource ? 'Update resource information' : 'Add a new learning resource to the platform'}
            </p>
          </CardHeader>
          <CardContent className="p-12">
            <form ref={resourceFormElementRef} className="space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              
              setLoadingResources(true);
              
              try {
                const resourceData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as string,
                  type: formData.get('type') as string,
                  url: formData.get('url') as string,
                  imageUrl: (formData.get('imageUrl') as string) || undefined,
                };

                const apiUrl = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources';
                const method = editingResource ? 'PATCH' : 'POST';

                const response = await fetch(apiUrl, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(resourceData),
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                  toast.success(editingResource ? "Resource updated successfully! 🎉" : "Resource created successfully! 🎉");
                  if (form && typeof form.reset === 'function') {
                    form.reset();
                  }
                  setResourceImagePreview(null);
                  setEditingResource(null);
                  fetchResources();
                } else {
                  throw new Error(data.error?.message || `Failed to ${editingResource ? 'update' : 'create'} resource`);
                }
              } catch (error) {
                console.error('Resource save error:', error);
                const errorMessage = error instanceof Error ? error.message : `Failed to ${editingResource ? 'update' : 'create'} resource`;
                toast.error(errorMessage);
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
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
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
                  placeholder="e.g., Complete React Tutorial" 
                  className="h-14 bg-gray-50 border-0 rounded-2xl"
                  defaultValue={editingResource?.title || ''}
                  minLength={3}
                  maxLength={200}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description *</label>
                <textarea 
                  name="description"
                  required
                  rows={4}
                  className="w-full bg-gray-50 border-0 rounded-[32px] p-6 outline-none focus:ring-2 focus:ring-[#219EBC] transition-all" 
                  placeholder="Describe the resource and what learners will gain from it..."
                  defaultValue={editingResource?.description || ''}
                  minLength={10}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                  <select 
                    name="category" 
                    required 
                    className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#219EBC] outline-none"
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
                    className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#219EBC] outline-none"
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Resource URL *</label>
                <Input 
                  name="url" 
                  type="url"
                  required 
                  placeholder="e.g., https://example.com/resource" 
                  className="h-14 bg-gray-50 border-0 rounded-2xl"
                  defaultValue={editingResource?.url || ''}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Resource Image</label>
                <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
                  {resourceImagePreview && (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-200">
                      <img 
                        src={resourceImagePreview} 
                        alt="Resource preview" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          setResourceImagePreview(null);
                          toast.error("Invalid image URL");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setResourceImagePreview(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Input 
                      name="imageUrl" 
                      type="url"
                      placeholder="Paste image URL here..." 
                      className="h-12 bg-white border border-gray-200 rounded-xl"
                      defaultValue={editingResource?.imageUrl || ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                          setResourceImagePreview(url);
                        }
                      }}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="resourceImageUpload"
                      disabled={uploadingResourceImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setUploadingResourceImage(true);
                        try {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            try {
                              const base64Image = reader.result as string;
                              
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  image: base64Image,
                                  folder: 'velonx/resources'
                                }),
                              });

                              if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                              }

                              const data = await response.json();
                              
                              if (data.success) {
                                setResourceImagePreview(data.data.url);
                                const imageUrlInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                                if (imageUrlInput) {
                                  imageUrlInput.value = data.data.url;
                                }
                                toast.success("Image uploaded successfully!");
                              } else {
                                throw new Error(data.error?.message || 'Failed to upload image');
                              }
                            } catch (error) {
                              console.error('Image upload error:', error);
                              const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
                              toast.error(errorMessage);
                            } finally {
                              setUploadingResourceImage(false);
                            }
                          };
                          
                          reader.onerror = () => {
                            toast.error('Failed to read image file');
                            setUploadingResourceImage(false);
                          };
                          
                          reader.readAsDataURL(file);
                        } catch (error) {
                          console.error('File processing error:', error);
                          toast.error("Failed to process image file");
                          setUploadingResourceImage(false);
                        }
                      }}
                    />
                    <label
                      htmlFor="resourceImageUpload"
                      className={`flex items-center justify-center gap-2 h-12 bg-white border-2 border-dashed border-gray-300 hover:border-[#219EBC] rounded-xl cursor-pointer transition-all text-gray-600 hover:text-[#219EBC] font-medium ${uploadingResourceImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingResourceImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Or upload from computer
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loadingResources}
                className="w-full h-16 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-[24px] text-lg shadow-xl shadow-[#219EBC]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResources ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {editingResource ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingResource ? 'Update Resource' : 'Create Resource'} <BookOpen className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
