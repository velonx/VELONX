/**
 * EditProjectModal Component
 * Allows the project owner to edit their project's details.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Github, ExternalLink, Image as ImageIcon, X, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExtendedProject } from '@/lib/types/project-page.types';
import { cn } from '@/lib/utils';

export interface EditProjectModalProps {
    project: ExtendedProject;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (updated: ExtendedProject) => void;
}

type Category = 'WEB_DEV' | 'MOBILE' | 'AI_ML' | 'DATA_SCIENCE' | 'DEVOPS' | 'DESIGN' | 'OTHER';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
    { value: 'WEB_DEV', label: 'Web Dev', icon: '💻' },
    { value: 'MOBILE', label: 'Mobile', icon: '📱' },
    { value: 'AI_ML', label: 'AI / ML', icon: '🤖' },
    { value: 'DATA_SCIENCE', label: 'Data Science', icon: '📊' },
    { value: 'DEVOPS', label: 'DevOps', icon: '⚙️' },
    { value: 'DESIGN', label: 'Design', icon: '🎨' },
    { value: 'OTHER', label: 'Other', icon: '📦' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
    { value: 'BEGINNER', label: 'Beginner', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
    { value: 'ADVANCED', label: 'Advanced', color: 'text-rose-500 bg-rose-500/10 border-rose-500/25' },
];

export function EditProjectModal({ project, isOpen, onClose, onSaved }: EditProjectModalProps) {
    const [saving, setSaving] = useState(false);
    const [techInput, setTechInput] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        techStack: [] as string[],
        category: 'OTHER' as Category,
        difficulty: 'BEGINNER' as Difficulty,
        githubUrl: '',
        liveUrl: '',
        imageUrl: '',
    });

    // Sync form whenever the project changes (or modal opens)
    useEffect(() => {
        if (project) {
            setForm({
                title: project.title || '',
                description: project.description || '',
                techStack: project.techStack ? [...project.techStack] : [],
                category: (project.category as Category) || 'OTHER',
                difficulty: (project.difficulty as Difficulty) || 'BEGINNER',
                githubUrl: project.githubUrl || '',
                liveUrl: project.liveUrl || '',
                imageUrl: project.imageUrl || '',
            });
        }
    }, [project, isOpen]);

    const handleAddTech = () => {
        const trimmed = techInput.trim();
        if (trimmed && !form.techStack.includes(trimmed) && form.techStack.length < 20) {
            setForm(prev => ({ ...prev, techStack: [...prev.techStack, trimmed] }));
            setTechInput('');
        }
    };

    const handleRemoveTech = (index: number) => {
        setForm(prev => ({
            ...prev,
            techStack: prev.techStack.filter((_, i) => i !== index),
        }));
    };

    const isValidUrl = (val: string) => {
        if (!val) return true; // optional
        try { new URL(val); return true; } catch { return false; }
    };

    const validate = () => {
        if (!form.title.trim() || form.title.trim().length < 3) {
            toast.error('Title must be at least 3 characters');
            return false;
        }
        if (!form.description.trim() || form.description.trim().length < 10) {
            toast.error('Description must be at least 10 characters');
            return false;
        }
        if (form.techStack.length === 0) {
            toast.error('Please add at least one technology');
            return false;
        }
        if (form.githubUrl && !isValidUrl(form.githubUrl)) {
            toast.error('Please enter a valid GitHub URL');
            return false;
        }
        if (form.liveUrl && !isValidUrl(form.liveUrl)) {
            toast.error('Please enter a valid Live Demo URL');
            return false;
        }
        if (form.imageUrl && !isValidUrl(form.imageUrl)) {
            toast.error('Please enter a valid Image URL');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const { getCSRFToken } = await import('@/lib/utils/csrf');
            const csrfToken = await getCSRFToken();

            const body: Record<string, unknown> = {
                title: form.title.trim(),
                description: form.description.trim(),
                techStack: form.techStack,
                category: form.category,
                difficulty: form.difficulty,
            };

            if (form.githubUrl.trim()) body.githubUrl = form.githubUrl.trim();
            if (form.liveUrl.trim()) body.liveUrl = form.liveUrl.trim();
            if (form.imageUrl.trim()) body.imageUrl = form.imageUrl.trim();

            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Project updated successfully!');
                onSaved({ ...project, ...data.data });
                onClose();
            } else {
                toast.error(data.error?.message || 'Failed to update project');
            }
        } catch (err) {
            console.error('Edit project error:', err);
            toast.error('Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-600 rounded-t-lg" aria-hidden="true" />

                <DialogHeader className="pt-2">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Pencil className="h-5 w-5 text-primary" aria-hidden="true" />
                        Edit Project
                    </DialogTitle>
                    <DialogDescription>
                        Update your project details. Changes are saved immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="ep-title" className="text-sm font-bold text-foreground">
                            Project Title *
                        </Label>
                        <Input
                            id="ep-title"
                            required
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="My Awesome Project"
                            className="h-11 bg-muted/40 border-border rounded-xl"
                            maxLength={200}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="ep-desc" className="text-sm font-bold text-foreground">
                            Description *
                        </Label>
                        <textarea
                            id="ep-desc"
                            required
                            value={form.description}
                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what your project does, the problem it solves, and its key features..."
                            maxLength={1000}
                            rows={4}
                            className="w-full bg-muted/40 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">
                            Tech Stack * <span className="font-normal text-muted-foreground text-xs">(max 20)</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={techInput}
                                onChange={e => setTechInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); }
                                }}
                                placeholder="e.g. React, Python, PostgreSQL"
                                className="h-10 bg-muted/40 border-border rounded-xl text-sm"
                            />
                            <Button
                                type="button"
                                onClick={handleAddTech}
                                disabled={!techInput.trim() || form.techStack.length >= 20}
                                size="sm"
                                className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                            >
                                Add
                            </Button>
                        </div>
                        {form.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {form.techStack.map((tech, i) => (
                                    <Badge
                                        key={`${tech}-${i}`}
                                        className="bg-primary/10 text-primary border border-primary/20 font-semibold px-2.5 py-1 text-xs hover:bg-primary/20 cursor-pointer gap-1"
                                        onClick={() => handleRemoveTech(i)}
                                    >
                                        {tech}
                                        <X className="h-3 w-3 opacity-60" aria-hidden="true" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">{form.techStack.length}/20 — click a tag to remove</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">Category</Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                                        form.category === cat.value
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                            : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                    )}
                                    aria-pressed={form.category === cat.value}
                                >
                                    <span aria-hidden="true">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">Difficulty</Label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, difficulty: diff.value }))}
                                    className={cn(
                                        'flex-1 py-2 rounded-xl text-xs font-semibold border transition-all',
                                        form.difficulty === diff.value
                                            ? diff.color + ' shadow-sm'
                                            : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                    )}
                                    aria-pressed={form.difficulty === diff.value}
                                >
                                    {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links section */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                        <p className="text-sm font-bold text-foreground">Project Links</p>

                        {/* GitHub URL */}
                        <div className="space-y-1.5">
                            <Label htmlFor="ep-github" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                                GitHub Repository URL
                            </Label>
                            <Input
                                id="ep-github"
                                type="url"
                                value={form.githubUrl}
                                onChange={e => setForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                placeholder="https://github.com/username/repo"
                                className="h-10 bg-background border-border rounded-xl text-sm"
                            />
                        </div>

                        {/* Live URL */}
                        <div className="space-y-1.5">
                            <Label htmlFor="ep-live" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                Live Demo URL
                            </Label>
                            <Input
                                id="ep-live"
                                type="url"
                                value={form.liveUrl}
                                onChange={e => setForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                                placeholder="https://my-project.vercel.app"
                                className="h-10 bg-background border-border rounded-xl text-sm"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-1.5">
                            <Label htmlFor="ep-image" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                Cover Image URL
                            </Label>
                            <Input
                                id="ep-image"
                                type="url"
                                value={form.imageUrl}
                                onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="https://example.com/project-screenshot.png"
                                className="h-10 bg-background border-border rounded-xl text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

EditProjectModal.displayName = 'EditProjectModal';
