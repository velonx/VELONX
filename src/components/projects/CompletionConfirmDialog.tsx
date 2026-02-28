"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Sparkles } from "lucide-react";

interface CompletionConfirmDialogProps {
  isOpen: boolean;
  projectTitle: string;
  memberCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CompletionConfirmDialog({
  isOpen,
  projectTitle,
  memberCount = 0,
  onConfirm,
  onCancel,
  isLoading = false,
}: CompletionConfirmDialogProps) {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isLoading) {
        event.preventDefault();
        onConfirm();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onConfirm, onCancel]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-[500px]"
        aria-describedby="completion-dialog-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl">Complete Project?</DialogTitle>
          </div>
          <DialogDescription id="completion-dialog-description" className="text-base">
            Are you sure you want to mark{" "}
            <span className="font-semibold text-foreground">
              {projectTitle}
            </span>{" "}
            as completed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* XP Rewards Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                  XP Rewards
                </h4>
                <ul className="space-y-2 text-sm" aria-label="XP reward breakdown">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      You (Project Owner)
                    </span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      +100 XP
                    </span>
                  </li>
                  {memberCount > 0 && (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        Each Team Member ({memberCount})
                      </span>
                      <span className="font-semibold text-purple-700 dark:text-purple-300">
                        +75 XP
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>This action will:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Award XP to all team members</li>
              <li>Send notifications to your team</li>
              <li>Add your project to the Hall of Fame</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel project completion"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            aria-label="Confirm project completion"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2" aria-hidden="true">⏳</span>
                Completing...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" aria-hidden="true" />
                Complete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
