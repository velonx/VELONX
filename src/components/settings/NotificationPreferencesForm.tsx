'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { Check, Loader2, Zap, Clock, CalendarDays, BellOff } from 'lucide-react';
import type { PreferenceRow } from '@/lib/services/email-preference.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Frequency = 'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF';

interface Props {
    initialPreferences: PreferenceRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Frequency options config
// ─────────────────────────────────────────────────────────────────────────────

const FREQUENCY_OPTIONS: Array<{
    value: Frequency;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    activeClass: string;
}> = [
    {
        value: 'INSTANT',
        label: 'Instant',
        sublabel: 'Send immediately',
        icon: <Zap className="w-4 h-4" />,
        activeClass: 'bg-[#226CE0] text-white border-[#226CE0]',
    },
    {
        value: 'DAILY',
        label: 'Daily',
        sublabel: 'Once per day',
        icon: <Clock className="w-4 h-4" />,
        activeClass: 'bg-violet-600 text-white border-violet-600',
    },
    {
        value: 'WEEKLY',
        label: 'Weekly',
        sublabel: 'Once per week',
        icon: <CalendarDays className="w-4 h-4" />,
        activeClass: 'bg-emerald-600 text-white border-emerald-600',
    },
    {
        value: 'OFF',
        label: 'Off',
        sublabel: 'No emails',
        icon: <BellOff className="w-4 h-4" />,
        activeClass: 'bg-muted text-muted-foreground border-border',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationPreferencesForm({ initialPreferences }: Props) {
    const [preferences, setPreferences] = useState<PreferenceRow[]>(initialPreferences);
    const [saving, setSaving] = useState<string | null>(null); // category being saved
    const [isPending, startTransition] = useTransition();

    const updateFrequency = (category: string, frequency: Frequency) => {
        // Optimistically update UI
        setPreferences((prev) =>
            prev.map((p) => (p.category === category ? { ...p, frequency } : p))
        );

        setSaving(category);

        startTransition(async () => {
            try {
                const res = await fetch('/api/user/notification-preferences', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([{ category, frequency }]),
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                toast.success('Preference saved', { duration: 1500, position: 'bottom-right' });
            } catch (err) {
                // Revert optimistic update
                setPreferences(initialPreferences);
                toast.error('Failed to save preference. Please try again.');
                console.error('[NotificationPreferencesForm] save error:', err);
            } finally {
                setSaving(null);
            }
        });
    };

    return (
        <div className="divide-y divide-border">
            {preferences.map((pref) => {
                const isSaving = saving === pref.category;

                return (
                    <div key={pref.category} className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Label + description */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-foreground text-sm">
                                        {pref.label}
                                    </h3>
                                    {isSaving && (
                                        <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {pref.description}
                                </p>
                            </div>

                            {/* Frequency pill selector */}
                            <div className="flex gap-1.5 flex-wrap sm:flex-nowrap shrink-0">
                                {FREQUENCY_OPTIONS.map((opt) => {
                                    const isActive = pref.frequency === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            id={`pref-${pref.category}-${opt.value}`}
                                            onClick={() => {
                                                if (!isSaving && pref.frequency !== opt.value) {
                                                    updateFrequency(pref.category, opt.value);
                                                }
                                            }}
                                            disabled={isSaving}
                                            title={opt.sublabel}
                                            aria-pressed={isActive}
                                            className={`
                                                relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold
                                                transition-all duration-150 cursor-pointer select-none
                                                ${isActive
                                                    ? opt.activeClass + ' shadow-sm'
                                                    : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                                                }
                                                ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {isActive && (
                                                <Check className="w-3 h-3 shrink-0" />
                                            )}
                                            {!isActive && opt.icon}
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
