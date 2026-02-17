"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus, Filter } from "lucide-react";
import RoomList from "@/components/community/RoomList";
import CreateRoomDialog from "@/components/community/CreateRoomDialog";
import { useDiscussionRooms } from "@/lib/hooks/useDiscussionRooms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RoomsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState<"all" | "public" | "private">("all");
  
  // Fetch rooms with filters
  const { rooms, isLoading, createRoom } = useDiscussionRooms();

  // Filter rooms based on search and privacy
  const filteredRooms = rooms?.filter((room) => {
    const matchesSearch = !searchQuery.trim() || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrivacy = privacyFilter === "all" ||
      (privacyFilter === "public" && !room.isPrivate) ||
      (privacyFilter === "private" && room.isPrivate);
    
    return matchesSearch && matchesPrivacy;
  }) || [];

  const handleCreateRoom = async (data: any) => {
    const newRoom = await createRoom(data);
    if (newRoom) {
      setShowCreateDialog(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Discussion Rooms</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 
              className="text-4xl md:text-6xl text-foreground"
              style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}
            >
              Discussion Rooms
            </h1>
            <p 
              className="text-muted-foreground text-xl max-w-2xl mx-auto"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Join real-time conversations on topics you care about. Connect with fellow learners and share knowledge.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-md mx-auto pt-2 md:pt-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search rooms by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 md:py-4 rounded-full bg-card border-2 border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                  aria-label="Search rooms"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Filters and Actions */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={privacyFilter} onValueChange={(value: any) => setPrivacyFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                  <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchQuery || privacyFilter !== "all") && (
                <Badge variant="secondary" className="gap-2">
                  {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'}
                </Badge>
              )}
            </div>

            {/* Create Room Button */}
            {session && (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Rooms List */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <RoomList 
            rooms={filteredRooms}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}
