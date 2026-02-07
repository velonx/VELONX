"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PenTool, Edit, Trash2, XCircle, Download, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const response = await fetch('/api/blog?pageSize=50');
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else {
        const error = await response.json();
        toast.error(error.error?.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogImagePreview(blog.imageUrl || null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setBlogImagePreview(null);
  };

  const handleNewPost = () => {
    setEditingBlog(null);
    setBlogImagePreview(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Blog Management List */}
      <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
        <CardHeader className="p-12 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black text-[#023047] mb-2">Manage Blog Posts</h3>
              <p className="text-gray-400">View, edit, and delete existing blog posts</p>
            </div>
            <Button 
              onClick={handleNewPost}
              className="h-12 px-6 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
            >
              <PenTool className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          {loadingBlogs ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-bold">No blog posts yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first blog post to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-start gap-6">
                    {blog.imageUrl && (
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-[#023047] mb-1">{blog.title}</h4>
                          <p className="text-sm text-gray-500">
                            {blog.excerpt || blog.content?.substring(0, 100) + '...'}
                          </p>
                        </div>
                        <Badge className={`${blog.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} border-0 font-bold`}>
                          {blog.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-xs text-gray-400">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex gap-2">
                            {blog.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span key={idx} className="text-xs bg-white px-2 py-1 rounded-lg text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Blog Form */}
      <div ref={formRef}>
        <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
          <CardHeader className="p-12 border-b border-gray-50">
            <h3 className="text-3xl font-black text-[#023047] mb-2">
              {editingBlog ? 'Edit Article' : 'Publish New Article'}
            </h3>
            <p className="text-gray-400">
              {editingBlog ? 'Update your blog post' : 'Content reaches over 5,000 community members.'}
            </p>
          </CardHeader>
          <CardContent className="p-12">
            <form className="space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              
              try {
                const tags = (formData.get('tags') as string)
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);

                const content = formData.get('content') as string;
                const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');

                const blogData = {
                  title: formData.get('title') as string,
                  content: content,
                  excerpt: excerpt,
                  imageUrl: formData.get('imageUrl') as string || null,
                  tags: tags,
                  status: formData.get('status') as 'DRAFT' | 'PUBLISHED',
                };

                const url = editingBlog ? `/api/blog/${editingBlog.id}` : '/api/blog';
                const method = editingBlog ? 'PATCH' : 'POST';

                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(blogData),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  toast.success(editingBlog ? "Blog updated successfully! 🚀" : "Blog published successfully! 🚀");
                  if (form && typeof form.reset === 'function') {
                    form.reset();
                  }
                  setBlogImagePreview(null);
                  setEditingBlog(null);
                  fetchBlogs();
                } else {
                  toast.error(data.error?.message || `Failed to ${editingBlog ? 'update' : 'publish'} blog`);
                }
              } catch (error) {
                console.error('Blog publish error:', error);
                toast.error(`Failed to ${editingBlog ? 'update' : 'publish'} blog`);
              }
            }}>
              {editingBlog && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 font-bold">Editing: {editingBlog.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                  <Input 
                    name="title" 
                    required 
                    placeholder="Enter title..." 
                    className="h-14 bg-gray-50 border-0 rounded-2xl"
                    defaultValue={editingBlog?.title || ''}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tags</label>
                  <Input 
                    name="tags" 
                    placeholder="e.g., Technology, AI, Development" 
                    className="h-14 bg-gray-50 border-0 rounded-2xl"
                    defaultValue={editingBlog?.tags?.join(', ') || ''}
                  />
                  <p className="text-xs text-gray-400 ml-1">Separate tags with commas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  name="status" 
                  required 
                  className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#219EBC] outline-none"
                  defaultValue={editingBlog?.status || 'PUBLISHED'}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cover Image</label>
                <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
                  {blogImagePreview && (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-200">
                      <img 
                        src={blogImagePreview} 
                        alt="Blog cover preview" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          setBlogImagePreview(null);
                          toast.error("Invalid image URL");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setBlogImagePreview(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Input 
                      name="imageUrl" 
                      placeholder="Paste image URL here..." 
                      className="h-12 bg-white border border-gray-200 rounded-xl"
                      defaultValue={editingBlog?.imageUrl || ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                          setBlogImagePreview(url);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-400 ml-1">
                      Get free images from: 
                      <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-[#219EBC] hover:underline ml-1">Unsplash</a>,
                      <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="text-[#219EBC] hover:underline ml-1">Pexels</a>, or
                      <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="text-[#219EBC] hover:underline ml-1">Pixabay</a>
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="blogImageUpload"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
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
                                    folder: 'velonx/blog'
                                  }),
                                });

                                const data = await response.json();
                                
                                if (data.success) {
                                  setBlogImagePreview(data.data.url);
                                  const imageUrlInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                                  if (imageUrlInput) {
                                    imageUrlInput.value = data.data.url;
                                  }
                                  toast.success("Image uploaded successfully!");
                                } else {
                                  toast.error(data.error?.message || "Failed to upload image");
                                }
                              } catch (error) {
                                toast.error("Failed to upload image");
                              } finally {
                                setUploadingImage(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            toast.error("Failed to process image");
                            setUploadingImage(false);
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="blogImageUpload"
                      className={`flex items-center justify-center gap-2 h-12 bg-white border-2 border-dashed border-gray-300 hover:border-[#219EBC] rounded-xl cursor-pointer transition-all text-gray-600 hover:text-[#219EBC] font-medium ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingImage ? (
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

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Article Content</label>
                <textarea 
                  name="content"
                  required
                  className="w-full bg-gray-50 border-0 rounded-[32px] p-8 min-h-[300px] outline-none focus:ring-2 focus:ring-[#219EBC] transition-all" 
                  placeholder="Write something inspiring..."
                  defaultValue={editingBlog?.content || ''}
                ></textarea>
              </div>
              <Button type="submit" className="w-full h-16 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-[24px] text-lg shadow-xl shadow-[#219EBC]/20">
                {editingBlog ? 'Update Article' : 'Publish Live'} <Send className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
