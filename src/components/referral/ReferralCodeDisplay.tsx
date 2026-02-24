/**
 * ReferralCodeDisplay Component
 * Feature: referral-xp-system
 * 
 * Displays the user's referral code and link with copy functionality.
 * Provides visual confirmation and toast notifications on copy.
 * 
 * Requirements:
 * - 2.3: Visual confirmation on copy action
 * - 9.2: Display referral code and link
 * - 9.6: Single-click copy functionality
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface ReferralCodeDisplayProps {
  code: string;
  link: string;
}

/**
 * ReferralCodeDisplay Component
 * 
 * Displays referral code and link with copy buttons.
 * Shows visual feedback when content is copied.
 */
export const ReferralCodeDisplay: React.FC<ReferralCodeDisplayProps> = ({ code, link }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /**
   * Copy text to clipboard and show feedback
   */
  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'code') {
        setCopiedCode(true);
        toast.success('Referral code copied to clipboard!');
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>Your Referral Code</CardTitle>
        </div>
        <CardDescription>
          Share your unique code or link to invite others and earn XP rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <label htmlFor="referral-code" className="text-sm font-medium text-foreground">
            Referral Code
          </label>
          <div className="flex gap-2">
            <Input
              id="referral-code"
              value={code}
              readOnly
              className="font-mono text-lg font-bold tracking-wider"
              aria-label="Your referral code"
            />
            <Button
              onClick={() => copyToClipboard(code, 'code')}
              variant="outline"
              size="icon"
              className={cn(
                'shrink-0 transition-colors',
                copiedCode && 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
              )}
              aria-label={copiedCode ? 'Code copied' : 'Copy referral code'}
            >
              {copiedCode ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label htmlFor="referral-link" className="text-sm font-medium text-foreground">
            Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              id="referral-link"
              value={link}
              readOnly
              className="font-mono text-sm"
              aria-label="Your referral link"
            />
            <Button
              onClick={() => copyToClipboard(link, 'link')}
              variant="outline"
              size="icon"
              className={cn(
                'shrink-0 transition-colors',
                copiedLink && 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
              )}
              aria-label={copiedLink ? 'Link copied' : 'Copy referral link'}
            >
              {copiedLink ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Share your code or link with friends. You&apos;ll earn XP when they sign up and complete milestones!
        </p>
      </CardContent>
    </Card>
  );
};
