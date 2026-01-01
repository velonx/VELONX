"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Sparkles } from "lucide-react";

// Available avatar options
export const AVATAR_OPTIONS = [
    { id: 1, name: "Cool Ape", src: "/avatars/cool-ape.png", rarity: "Epic" },
    { id: 2, name: "Robot Hero", src: "/avatars/robot-hero.png", rarity: "Legendary" },
    { id: 3, name: "Space Cat", src: "/avatars/space-cat.png", rarity: "Rare" },
    { id: 4, name: "Wizard Owl", src: "/avatars/wizard-owl.png", rarity: "Epic" },
    { id: 5, name: "Punk Dog", src: "/avatars/punk-dog.png", rarity: "Rare" },
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
                                        ? `bg-gradient-to-br ${rarityColor}`
                                        : "bg-white/5 hover:bg-white/10"
                                    } transition-colors`}>
                                    <div className="bg-[#0a0a0f] rounded-xl p-2">
                                        {/* Avatar Image */}
                                        <div className="aspect-square rounded-xl overflow-hidden mb-2">
                                            <img
                                                src={avatar.src}
                                                alt={avatar.name}
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
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${rarityColor} flex items-center justify-center animate-scale-in`}>
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
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                            <img
                                src={selectedAvatar}
                                alt="Selected avatar"
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
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold rounded-full px-8"
                    >
                        Confirm Avatar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
