"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Edit, Trash2, Users, MapPin, Clock, Plus, X, Download, XCircle, Trophy, User } from "lucide-react";
import toast from "react-hot-toast";
import { eventsApi } from "@/lib/api/client";
import type { Event } from "@/lib/api/types";
import { secureFetch } from "@/lib/utils/csrf";
import EventRewardManager from "@/components/admin/EventRewardManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedRewardEventId, setExpandedRewardEventId] = useState<string | null>(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'WORKSHOP' as 'WORKSHOP' | 'HACKATHON' | 'WEBINAR',
    maxSeats: '',
    whoCanParticipate: '',
    howItWorks: '',
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
      // The API returns { success, data: { events, pagination, filters } }
      // But the type says data: T[], so we need to handle both cases
      const eventsData = (response.data as any).events || response.data;
      if (response.success && Array.isArray(eventsData)) {
        setEvents(eventsData);
      } else {
        setEvents([]);
      }
    } catch (error) {
      toast.error("Failed to load events");
      setEvents([]);
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
        maxSeats: formData.maxSeats ? parseInt(formData.maxSeats) : null,
        whoCanParticipate: formData.whoCanParticipate || null,
        howItWorks: formData.howItWorks || null,
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
      // Show field-level validation errors if available
      if (error.details?.errors && Array.isArray(error.details.errors) && error.details.errors.length > 0) {
        const fieldErrors = error.details.errors
          .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
          .join('\n');
        toast.error(fieldErrors);
      } else {
        toast.error(error.message || 'Failed to save event');
      }
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
      whoCanParticipate: event.whoCanParticipate || '',
      howItWorks: event.howItWorks || '',
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

  const handleViewAttendees = async (event: Event) => {
    setViewingAttendeesEvent(event);
    setLoadingAttendees(true);
    setAttendees([]);
    try {
      const response = await eventsApi.getAttendees(event.id);
      if (response.success) {
        setAttendees(response.data.attendees);
      }
    } catch (error) {
      toast.error("Failed to load attendees");
    } finally {
      setLoadingAttendees(false);
    }
  };

  const exportAttendeesCSV = (event: Event, attendeeList: any[]) => {
    const headers = ["Name", "Email", "Registration Date", "Status"];
    const rows = attendeeList.map((a) => [
      a.user.name || "Anonymous",
      a.user.email,
      new Date(a.createdAt).toLocaleDateString(),
      a.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '-').toLowerCase()}-attendees.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      whoCanParticipate: '',
      howItWorks: '',
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
                    Max Seats
                  </Label>
                  <Input
                    id="maxSeats"
                    type="number"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl mt-2"
                    placeholder="Unlimited if empty"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="whoCanParticipate" className="text-sm font-bold text-foreground">
                    Who Can Participate
                  </Label>
                  <textarea
                    id="whoCanParticipate"
                    value={formData.whoCanParticipate}
                    onChange={(e) => setFormData({ ...formData, whoCanParticipate: e.target.value })}
                    className="w-full h-24 bg-background border border-border rounded-xl p-4 mt-2 outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describe eligibility..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="howItWorks" className="text-sm font-bold text-foreground">
                    How It Works
                  </Label>
                  <textarea
                    id="howItWorks"
                    value={formData.howItWorks}
                    onChange={(e) => setFormData({ ...formData, howItWorks: e.target.value })}
                    className="w-full h-24 bg-background border border-border rounded-xl p-4 mt-2 outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Step by step process..."
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

                                  const response = await secureFetch('/api/upload', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      image: base64Image,
                                      folder: 'velonx/events'
                                    }),
                                  });

                                  const data = await response.json();

                                  if (data.success) {
                                    const uploadedUrl = data.data?.url || data.url;
                                    setImagePreview(uploadedUrl);
                                    setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
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
              {Array.isArray(events) && events.map((event) => (
                <div
                  key={event.id}
                  className="bg-muted/30 p-6 rounded-2xl border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {event.imageUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                        />
                      </>
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
                            {event._count.attendees} registered {event.maxSeats ? `/ ${event.maxSeats} seats` : '(Unlimited)'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewAttendees(event)}
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-xl border-[#219EBC] text-[#219EBC] hover:bg-[#219EBC]/10"
                        title="View Attendees"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
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
                  {/* Rewards Manager - collapsible per event */}
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setExpandedRewardEventId(
                        expandedRewardEventId === event.id ? null : event.id
                      )}
                      className="flex items-center gap-2 text-sm font-semibold text-[#219EBC] hover:text-[#1a7a94] transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      {expandedRewardEventId === event.id ? 'Hide Rewards' : 'Manage Rewards'}
                    </button>
                    {expandedRewardEventId === event.id && (
                      <div className="mt-4">
                        <EventRewardManager eventId={event.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Attendees Dialog */}
      <Dialog open={!!viewingAttendeesEvent} onOpenChange={(open) => !open && setViewingAttendeesEvent(null)}>
        <DialogContent className="max-w-2xl bg-background border-border rounded-3xl overflow-hidden p-0 gap-0">
          <DialogHeader className="p-8 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-black text-[#023047]">Registered Attendees</DialogTitle>
                <DialogDescription className="mt-1">
                  {viewingAttendeesEvent?.title} · {attendees.length} people
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewingAttendeesEvent && exportAttendeesCSV(viewingAttendeesEvent, attendees)}
                disabled={attendees.length === 0}
                className="h-10 px-4 border-[#219EBC] text-[#219EBC] font-bold rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-8">
              {loadingAttendees ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-4 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground font-medium">Loading attendee list...</p>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">No one has registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/10"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-[#219EBC]/20">
                          <AvatarImage src={attendee.user.image} alt={attendee.user.name} />
                          <AvatarFallback className="bg-[#219EBC] text-white font-bold">
                            {attendee.user.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">{attendee.user.name || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground">{attendee.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Registered On</p>
                        <p className="text-sm font-medium">
                          {new Date(attendee.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end">
            <Button
              onClick={() => setViewingAttendeesEvent(null)}
              className="h-11 px-8 bg-[#023047] text-white font-bold rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
