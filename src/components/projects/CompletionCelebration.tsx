"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, ExternalLink, X } from "lucide-react";
import Link from "next/link";

interface CompletionCelebrationProps {
  isOpen: boolean;
  projectTitle: string;
  xpAwarded: number;
  hallOfFameUrl: string;
  onClose: () => void;
}

/**
 * CompletionCelebration Component
 * 
 * Displays a celebration modal after project completion with:
 * - Confetti/success animation effects
 * - XP awarded display
 * - Link to Hall of Fame
 * - Auto-dismiss after 5 seconds
 * - Manual dismiss on click outside or close button
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function CompletionCelebration({
  isOpen,
  projectTitle,
  xpAwarded,
  hallOfFameUrl,
  onClose,
}: CompletionCelebrationProps) {
  const [countdown, setCountdown] = useState(5);

  // Auto-dismiss after 5 seconds (Requirement 9.4)
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    color: [
      "bg-yellow-400",
      "bg-purple-400",
      "bg-blue-400",
      "bg-pink-400",
      "bg-green-400",
      "bg-red-400",
    ][Math.floor(Math.random() * 6)],
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[550px] overflow-hidden relative"
        aria-describedby="celebration-description"
      >
        {/* Confetti Animation (Requirement 9.2) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <AnimatePresence>
            {isOpen &&
              confettiParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className={`absolute w-2 h-2 ${particle.color} rounded-sm`}
                  initial={{
                    x: `${particle.x}%`,
                    y: -20,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    y: "120vh",
                    rotate: particle.rotation,
                    opacity: 0,
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeIn",
                  }}
                  style={{
                    left: `${particle.x}%`,
                  }}
                />
              ))}
          </AnimatePresence>
        </div>

        {/* Close Button (Requirement 9.5) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
          aria-label="Close celebration modal"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                <Trophy className="h-16 w-16 text-white" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DialogTitle className="text-2xl text-center font-bold">
              🎉 Project Completed! 🎉
            </DialogTitle>
          </motion.div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 py-6 relative z-10"
          id="celebration-description"
        >
          {/* Project Title */}
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Congratulations on completing</p>
            <h3 className="text-xl font-semibold text-foreground">
              {projectTitle}
            </h3>
          </div>

          {/* XP Award Display (Requirement 9.3) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                XP Earned
              </h4>
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
              >
                +{xpAwarded}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-2">
                Experience Points
              </p>
            </div>
          </motion.div>

          {/* Hall of Fame Link (Requirement 9.3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              Your project is now featured in the Hall of Fame!
            </p>
            <Link href={hallOfFameUrl} onClick={onClose}>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                aria-label="View project in Hall of Fame"
              >
                <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
                View in Hall of Fame
                <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </motion.div>

          {/* Auto-dismiss countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-muted-foreground"
          >
            <p>Closing in {countdown} seconds...</p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
