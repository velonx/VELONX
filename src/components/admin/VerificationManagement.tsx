"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Search, User, QrCode, Plus, X, Trash2, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type VerificationType = "INTERNSHIP" | "EVENT_PROJECT" | "CONTRIBUTION" | "ACHIEVEMENT" | "EXCELLENCE";

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Verification {
  id: string;
  userId: string;
  user: UserRecord;
  type: VerificationType;
  title: string;
  description: string | null;
  issuedAt: string;
  verificationToken: string;
}

export default function VerificationManagement() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [viewingQR, setViewingQR] = useState<Verification | null>(null);

  const [formData, setFormData] = useState({
    type: "INTERNSHIP" as VerificationType,
    title: "",
    description: "",
    issuedAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await secureFetch("/api/admin/verifications");
      const data = await response.json();
      if (data.success) {
        setVerifications(data.data);
      }
    } catch (error) {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const response = await secureFetch(`/api/users?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setSearchingUsers(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) searchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    try {
      const response = await secureFetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: selectedUser.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Verification created successfully!");
        setShowForm(false);
        setSelectedUser(null);
        setFormData({
          type: "INTERNSHIP",
          title: "",
          description: "",
          issuedAt: new Date().toISOString().split("T")[0],
        });
        fetchVerifications();
      } else {
        toast.error(data.error || "Failed to create verification");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getVerificationUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${token}`;
    }
    return `/verify/${token}`;
  };

  return (
    <div className="space-y-8">
      <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
        <CardHeader className="p-12 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black text-[#023047] mb-2 text-wrap">Verification System</h3>
              <p className="text-muted-foreground">Issue and manage verifiable credentials for members</p>
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
                  Issue Verification
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="p-12 border-b border-gray-50 bg-muted/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-foreground">1. Select User *</Label>
                  {selectedUser ? (
                    <div className="flex items-center justify-between p-4 bg-background border border-[#219EBC] rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedUser.image || ""} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{selectedUser.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search user by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-11 h-12 bg-background border-border rounded-xl"
                      />
                      {searchingUsers && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {users.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setUsers([]);
                                setUserSearch("");
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={u.image || ""} />
                                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="text-sm font-bold">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="type" className="text-sm font-bold text-foreground">2. Verification Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VerificationType })}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#219EBC]"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="EVENT_PROJECT">Event Project</option>
                    <option value="CONTRIBUTION">Contribution</option>
                    <option value="ACHIEVEMENT">Achievement</option>
                    <option value="EXCELLENCE">Excellence</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4">
                  <Label htmlFor="title" className="text-sm font-bold text-foreground">3. Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Full Stack Developer Internship"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4">
                  <Label htmlFor="description" className="text-sm font-bold text-foreground">4. Description</Label>
                  <textarea
                    id="description"
                    placeholder="Provide some details about the achievement..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 bg-background border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#219EBC] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="issuedAt" className="text-sm font-bold text-foreground">5. Issue Date</Label>
                  <Input
                    id="issuedAt"
                    type="date"
                    value={formData.issuedAt}
                    onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                    className="h-12 bg-background border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!selectedUser || !formData.title}
                  className="h-12 px-8 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                >
                  Issue Verification
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
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
          ) : verifications.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-bold">No verifications issued yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="bg-muted/30 p-6 rounded-2xl border border-border hover:border-[#219EBC]/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={v.user.image || ""} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-foreground">{v.title}</h4>
                          <Badge variant="outline" className="text-[10px] bg-[#219EBC]/10 text-[#219EBC] border-[#219EBC]/20">
                            {v.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Issued to: <span className="font-medium text-foreground">{v.user.name}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(v.issuedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingQR(v)}
                          className="h-10 px-4 rounded-xl border-[#219EBC] text-[#219EBC] hover:bg-[#219EBC]/10 font-bold"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getVerificationUrl(v.verificationToken), "_blank")}
                          className="h-10 px-4 rounded-xl font-bold"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Page
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingQR} onOpenChange={(open) => !open && setViewingQR(null)}>
        <DialogContent className="sm:max-w-md rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#023047] text-center">Verification QR Code</DialogTitle>
            <DialogDescription className="text-center">
              Scan this QR code to verify the {viewingQR?.type.toLowerCase().replace("_", " ")} for {viewingQR?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-dashed border-[#219EBC]/20">
            {viewingQR && (
              <>
                <QRCodeSVG
                  value={getVerificationUrl(viewingQR.verificationToken)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <div className="mt-6 text-center">
                  <p className="text-xs font-bold text-[#023047] uppercase tracking-widest mb-1">ID: {viewingQR.verificationToken}</p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] break-all">
                    {getVerificationUrl(viewingQR.verificationToken)}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setViewingQR(null)}
              className="w-full h-12 bg-[#023047] text-white font-bold rounded-xl"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
