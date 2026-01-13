"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface AddEventFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEventAdded?: () => void;
}

export default function AddEventForm({
    open,
    onOpenChange,
    onEventAdded,
}: AddEventFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        timezone: "UTC",
        meetingLink: "",
        platform: "google-meet",
        type: "workshop",
        maxAttendees: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In production, this would:
        // 1. Validate form data
        // 2. Send to API endpoint
        // 3. Update database
        // 4. Refresh meeting list

        console.log("New Event Data:", {
            ...formData,
            maxAttendees: parseInt(formData.maxAttendees),
            currentAttendees: 0,
            status: "upcoming",
            createdBy: "admin@velonx.com",
        });

        // Reset form
        setFormData({
            title: "",
            description: "",
            date: "",
            time: "",
            timezone: "UTC",
            meetingLink: "",
            platform: "google-meet",
            type: "workshop",
            maxAttendees: "",
        });

        setLoading(false);
        onOpenChange(false);
        onEventAdded?.();

        // Show success message
        alert("Event created successfully! (This is a demo - would normally save to database)");
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#0a0a0f] border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-cyan-400" />
                        Schedule New Event
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Create a new event and generate a meeting link for attendees.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                            Event Title <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="e.g., Web Development Workshop"
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                            Description <span className="text-red-400">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Brief description of the event..."
                            className="bg-white/5 border-white/10 text-white resize-none"
                            rows={3}
                            required
                        />
                    </div>

                    {/* Date and Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-white">
                                Date <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-white">
                                Time <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="time"
                                value={formData.time}
                                onChange={(e) => handleChange("time", e.target.value)}
                                placeholder="e.g., 9:00 - 11:00 AM"
                                className="bg-white/5 border-white/10 text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Platform and Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="platform" className="text-white">
                                Meeting Platform <span className="text-red-400">*</span>
                            </Label>
                            <Select
                                value={formData.platform}
                                onValueChange={(value) => handleChange("platform", value)}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0f] border-white/10">
                                    <SelectItem value="google-meet">Google Meet</SelectItem>
                                    <SelectItem value="zoom">Zoom</SelectItem>
                                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                                    <SelectItem value="discord">Discord</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-white">
                                Event Type <span className="text-red-400">*</span>
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0f] border-white/10">
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                    <SelectItem value="hackathon">Hackathon</SelectItem>
                                    <SelectItem value="networking">Networking</SelectItem>
                                    <SelectItem value="webinar">Webinar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    <div className="space-y-2">
                        <Label htmlFor="meetingLink" className="text-white">
                            Meeting Link <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="meetingLink"
                            type="url"
                            value={formData.meetingLink}
                            onChange={(e) => handleChange("meetingLink", e.target.value)}
                            placeholder="https://meet.google.com/abc-defg-hij"
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>

                    {/* Max Attendees */}
                    <div className="space-y-2">
                        <Label htmlFor="maxAttendees" className="text-white">
                            Maximum Attendees <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="maxAttendees"
                            type="number"
                            min="1"
                            value={formData.maxAttendees}
                            onChange={(e) => handleChange("maxAttendees", e.target.value)}
                            placeholder="e.g., 50"
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/20 text-gray-300 hover:bg-white/5"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="glow-button text-black font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
