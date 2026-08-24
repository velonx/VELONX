'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  BellOff,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  compact?: boolean;
  className?: string;
}

export function PushNotificationToggle({ compact = false, className = '' }: PushNotificationToggleProps) {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const [testing, setTesting] = React.useState(false);

  const handleTest = async () => {
    setTesting(true);
    await sendTestNotification();
    setTesting(false);
  };

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-md ${className}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm">
            Push notifications are not supported in your current browser environment.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isSubscribed ? 'bg-[#F0771A]/10 text-[#F0771A]' : 'bg-muted text-muted-foreground'}`}>
            {isSubscribed ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Desktop & Mobile Notifications</h4>
            <p className="text-xs text-muted-foreground">
              {isSubscribed ? 'Receiving real-time browser alerts' : 'Receive alerts even when tab is closed'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || loading}
                className="text-xs border-[#F0771A]/30 hover:bg-[#F0771A]/10 text-[#F0771A]"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={unsubscribe}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Disable
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={subscribe}
              disabled={loading}
              className="bg-[#F0771A] hover:bg-[#F0771A]/90 text-white text-xs shadow-md shadow-[#F0771A]/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Bell className="w-3.5 h-3.5 mr-1" />}
              Enable
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-card/90 via-card/50 to-[#F0771A]/5 p-5 md:p-6 shadow-sm backdrop-blur-xl ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F0771A]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSubscribed ? 'bg-emerald-400' : 'bg-[#F0771A]'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSubscribed ? 'bg-emerald-500' : 'bg-[#F0771A]'}`} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isSubscribed ? 'Browser Notifications Active' : 'Stay Connected'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#F0771A]" />
            Desktop & Mobile Browser Notifications
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Get instant alerts directly on your computer desktop or mobile phone screen for events, mentor sessions, project updates, and community mentions even when VELONX is not open.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-background/60 border border-border/40 px-2.5 py-1 rounded-md">
              <Laptop className="w-3.5 h-3.5 text-[#F0771A]" />
              <span>Desktop (Chrome, Safari, Firefox, Edge)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/60 border border-border/40 px-2.5 py-1 rounded-md">
              <Smartphone className="w-3.5 h-3.5 text-[#F0771A]" />
              <span>Mobile (Android & iOS Safari)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {permission === 'denied' ? (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Notifications blocked in browser. Click site lock icon to allow.</span>
            </div>
          ) : isSubscribed ? (
            <>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing || loading}
                className="border-[#F0771A]/40 bg-[#F0771A]/10 hover:bg-[#F0771A]/20 text-[#F0771A] font-medium transition-all"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={unsubscribe}
                disabled={loading}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Turn Off'}
              </Button>
            </>
          ) : (
            <Button
              onClick={subscribe}
              disabled={loading}
              className="bg-[#F0771A] hover:bg-[#F0771A]/90 text-white font-medium shadow-lg shadow-[#F0771A]/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Browser Notifications
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
