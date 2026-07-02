"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";

// Available avatar options
export const AVATAR_OPTIONS = [
    { id: 1, name: "Tech Explorer", src: "/avatars/1.jpeg", rarity: "Common" },
    { id: 2, name: "Cyber Nomad", src: "/avatars/2.jpeg", rarity: "Common" },
    { id: 3, name: "Data Wizard", src: "/avatars/3.jpeg", rarity: "Common" },
    { id: 4, name: "Cloud Voyager", src: "/avatars/4.jpeg", rarity: "Common" },
    { id: 5, name: "Neural Hacker", src: "/avatars/5.jpeg", rarity: "Rare" },
    { id: 6, name: "Logic Catalyst", src: "/avatars/6.jpeg", rarity: "Rare" },
    { id: 7, name: "Pixel Architect", src: "/avatars/7.jpeg", rarity: "Rare" },
    { id: 8, name: "Quantum Ranger", src: "/avatars/8.jpeg", rarity: "Rare" },
    { id: 9, name: "Velo Maverick", src: "/avatars/9.jpeg", rarity: "Epic" },
    { id: 10, name: "Shadow Scribe", src: "/avatars/10.jpeg", rarity: "Epic" },
    { id: 11, name: "Apex Sentinel", src: "/avatars/11.jpeg", rarity: "Epic" },
    { id: 12, name: "Nova Wanderer", src: "/avatars/12.jpeg", rarity: "Epic" },
    { id: 13, name: "Cosmic Overlord", src: "/avatars/13.jpeg", rarity: "Legendary" },
    { id: 14, name: "Synth Oracle", src: "/avatars/14.jpeg", rarity: "Legendary" },
    { id: 15, name: "Genesis Prime", src: "/avatars/15.jpeg", rarity: "Legendary" },
];

const RARITY_COLORS: Record<string, string> = {
    Common: "from-gray-500 to-gray-600",
    Rare: "from-cyan-500 to-blue-500",
    Epic: "from-violet-500 to-purple-500",
    Legendary: "from-yellow-500 to-orange-500",
};

const RARITY_TEXT_COLORS: Record<string, string> = {
    Common: "text-gray-400",
    Rare: "text-cyan-400",
    Epic: "text-violet-400",
    Legendary: "text-yellow-400",
};

interface AvatarSelectorProps {
    currentAvatar?: string;
    onSelectAvatar: (avatarSrc: string) => void;
    trigger?: React.ReactNode;
}

export default function AvatarSelector({ currentAvatar, onSelectAvatar, trigger }: AvatarSelectorProps) {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATAR_OPTIONS[0].src);
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        onSelectAvatar(selectedAvatar);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="rounded-full border-white/20 text-gray-300 hover:bg-white/5">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Choose Avatar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#0a0a0f] border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        Choose Your Avatar
                    </DialogTitle>
                    <DialogDescription className="sr-only">Select your profile avatar</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 py-6">
                    {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.src;
                        const rarityColor = RARITY_COLORS[avatar.rarity];
                        const rarityTextColor = RARITY_TEXT_COLORS[avatar.rarity];

                        return (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.src)}
                                className={`relative group transition-all duration-300 ${isSelected ? "scale-105" : "hover:scale-105"
                                    }`}
                            >
                                {/* Card Background */}
                                <div className={`rounded-2xl p-1 ${isSelected
                                    ? `bg-linear-to-br ${rarityColor}`
                                    : "bg-white/5 hover:bg-white/10"
                                    } transition-colors`}>
                                    <div className="bg-[#0a0a0f] rounded-xl p-2">
                                        {/* Avatar Image */}
                                        <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                                            <Image
                                                src={avatar.src}
                                                alt={avatar.name}
                                                fill
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Avatar Info */}
                                        <div className="text-center">
                                            <p className="text-white text-sm font-medium truncate">{avatar.name}</p>
                                            <p className={`text-xs ${rarityTextColor}`}>{avatar.rarity}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-linear-to-br ${rarityColor} flex items-center justify-center animate-scale-in`}>
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Preview & Confirm */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 relative">
                            <Image
                                src={selectedAvatar}
                                alt="Selected avatar"
                                fill
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Selected</p>
                            <p className="text-white font-medium">
                                {AVATAR_OPTIONS.find(a => a.src === selectedAvatar)?.name}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleConfirm}
                        className="bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold rounded-full px-8"
                    >
                        Confirm Avatar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
