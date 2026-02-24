"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Edit, Trash2, Users, MapPin, Clock, Plus, X, Download, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { eventsApi } from "@/lib/api/client";
import type { Event } from "@/lib/api/types";

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'WORKSHOP' as 'WORKSHOP' | 'HACKATHON' | 'WEBINAR',
    maxSeats: '',
    meetingLink: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.list({ pageSize: 100 });
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        location: formData.location || null,
        type: formData.type,
        maxSeats: formData.maxSeats ? parseInt(formData.maxSeats) : 100,
        meetingLink: formData.meetingLink || null,
        imageUrl: formData.imageUrl || null,
      };

      if (editingEvent) {
        await eventsApi.update(editingEvent.id, eventData);
        toast.success("Event updated successfully!");
      } else {
        await eventsApi.create(eventData);
        toast.success("Event created successfully!");
      }

      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Failed to save event");
    }
  };

  const handleEdit = (event: Event) => {
    const eventDate = new Date(event.date);
    setEditingEvent(event);
    setImagePreview(event.imageUrl || null);
    setFormData({
      title: event.title,
      description: event.description,
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().slice(0, 5),
      location: event.location || '',
      type: event.type,
      maxSeats: event.maxSeats?.toString() || '',
      meetingLink: event.meetingLink || '',
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await eventsApi.delete(id);
      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'WORKSHOP',
      maxSeats: '',
      meetingLink: '',
      imageUrl: '',
    });
    setEditingEvent(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      UPCOMING: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
      ONGOING: { label: 'Ongoing', className: 'bg-green-100 text-green-700' },
      COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-700' },
      CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    }[status] || { label: status, className: 'bg-gray-100 text-gray-700' };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Events List */}
      <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
        <CardHeader className="p-12 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black text-[#023047] mb-2">Manage Events</h3>
              <p className="text-muted-foreground">Create, edit, and manage platform events</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="h-14 px-8 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-2xl shadow-lg"
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="p-12 border-b border-gray-50 bg-muted/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="title" className="text-sm font-bold text-foreground">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                    placeholder="e.g., React Workshop: Building Modern UIs"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description" className="text-sm font-bold text-foreground">
                    Description *
                  </Label>
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 bg-background border border-border rounded-xl p-4 mt-2 outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describe the event..."
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-sm font-bold text-foreground">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="text-sm font-bold text-foreground">
                    Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-bold text-foreground">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                    placeholder="e.g., Virtual / Room 101"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-bold text-foreground">
                    Event Type *
                  </Label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 mt-2 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="WEBINAR">Webinar</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="maxSeats" className="text-sm font-bold text-foreground">
                    Max Seats *
                  </Label>
                  <Input
                    id="maxSeats"
                    type="number"
                    required
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                    placeholder="e.g., 100"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="meetingLink" className="text-sm font-bold text-foreground">
                    Meeting Link
                  </Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-sm font-bold text-foreground">Event Image</Label>
                  <div className="bg-muted/30 rounded-2xl p-6 space-y-4 mt-2">
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                        <img 
                          src={imagePreview} 
                          alt="Event preview" 
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview(null);
                            toast.error("Invalid image URL");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, imageUrl: '' });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Input 
                        placeholder="Paste image URL here..." 
                        className="h-12 bg-background border-border rounded-xl"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData({ ...formData, imageUrl: url });
                          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                            setImagePreview(url);
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground ml-1">
                        Get free images from: 
                        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Unsplash</a>,
                        <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Pexels</a>, or
                        <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Pixabay</a>
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="eventImageUpload"
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
                                      folder: 'velonx/events'
                                    }),
                                  });

                                  const data = await response.json();
                                  
                                  if (data.success) {
                                    setImagePreview(data.data.url);
                                    setFormData({ ...formData, imageUrl: data.data.url });
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
                        htmlFor="eventImageUpload"
                        className={`flex items-center justify-center gap-2 h-12 bg-background border-2 border-dashed border-border hover:border-primary rounded-xl cursor-pointer transition-all text-muted-foreground hover:text-primary font-medium ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="h-12 px-8 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="h-12 px-8 font-bold rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent className="p-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-bold">No events yet</p>
              <p className="text-muted-foreground text-sm mt-2">Create your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-muted/30 p-6 rounded-2xl border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-foreground">{event.title}</h4>
                        {getStatusBadge(event.status)}
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                        {event._count && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {event._count.attendees} registered / {event.maxSeats} seats
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(event)}
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id, event.title)}
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
