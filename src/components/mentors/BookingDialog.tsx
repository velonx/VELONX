"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: {
    id: string;
    name: string;
    company: string;
    expertise: string[];
    imageUrl?: string;
  };
  onSuccess?: () => void;
}

export default function BookingDialog({ open, onOpenChange, mentor, onSuccess }: BookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      // Validate date is in future
      if (dateTime <= new Date()) {
        toast.error("Please select a future date and time");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/mentor-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          title: formData.title,
          description: formData.description,
          date: dateTime.toISOString(),
          duration: formData.duration,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error?.message || "Failed to book session");
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Failed to book session");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
    });
    onOpenChange(false);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card rounded-[32px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground">
                Book a Session
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Schedule a mentorship session with {mentor.name}
              </DialogDescription>
            </DialogHeader>

            {/* Mentor Info */}
            <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{mentor.name}</h4>
                <p className="text-sm text-muted-foreground">{mentor.company}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mentor.expertise.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-xs bg-card px-2 py-0.5 rounded-lg text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-foreground">
                  Session Title *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Career Guidance in Frontend Development"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 bg-muted/50 border-0 rounded-xl"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 bg-muted/50 border-0 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-12 bg-muted/50 border-0 rounded-xl"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">Duration *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 60, 90].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration })}
                      className={`h-12 rounded-xl font-bold transition-all ${formData.duration === duration
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                        }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-foreground">
                  What would you like to discuss? (Optional)
                </Label>
                <textarea
                  id="description"
                  placeholder="Share what you'd like to learn or discuss in this session..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 bg-muted/50 border-0 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">
              Session Booked Successfully!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your session with {mentor.name} has been scheduled. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-muted/50 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(`${formData.date}T${formData.time}`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formData.time} • {formData.duration} minutes</span>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
