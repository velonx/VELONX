'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Check, ChevronRight, ChevronLeft, Award, AwardIcon, Github, Linkedin, MapPin } from 'lucide-react';
import Image from 'next/image';

const AVATARS = [
  { id: 1, name: 'Cool Ape', src: '/avatars/cool-ape.png', rarity: 'Epic', color: 'from-violet-500 to-purple-500' },
  { id: 2, name: 'Robot Hero', src: '/avatars/robot-hero.png', rarity: 'Legendary', color: 'from-yellow-500 to-orange-500' },
  { id: 3, name: 'Space Cat', src: '/avatars/space-cat.png', rarity: 'Rare', color: 'from-cyan-500 to-blue-500' },
  { id: 4, name: 'Wizard Owl', src: '/avatars/wizard-owl.png', rarity: 'Epic', color: 'from-violet-500 to-purple-500' },
  { id: 5, name: 'Punk Dog', src: '/avatars/punk-dog.png', rarity: 'Rare', color: 'from-cyan-500 to-blue-500' },
];

// Simple, lightweight client-side confetti particles
function ConfettiEffect() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316'];
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      y: -20 - Math.random() * 20, // start above viewport
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: `${p.y}vh`, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            x: `${p.x + (Math.random() * 10 - 5)}vw`,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: p.delay,
            ease: 'linear',
            repeat: 0,
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
}

export function ProfileCompletionWizard() {
  const { data: session, update: updateSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [avatar, setAvatar] = useState('/avatars/cool-ape.png');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Show wizard if:
    // 1. User is logged in as student
    // 2. Profile is not complete
    // 3. User hasn't dismissed it in the last 24 hours
    if (session?.user && session.user.role === 'STUDENT' && session.user.profileComplete === false) {
      const dismissedTime = localStorage.getItem('profile_wizard_dismissed');
      const now = new Date().getTime();
      
      if (!dismissedTime || now - Number(dismissedTime) > 24 * 60 * 60 * 1000) {
        setIsOpen(true);
      }
    }
  }, [session]);

  const handleDismiss = () => {
    localStorage.setItem('profile_wizard_dismissed', String(new Date().getTime()));
    setIsOpen(false);
  };

  const validateStep = () => {
    const stepErrors: Record<string, string> = {};
    if (step === 2) {
      if (!bio.trim()) stepErrors.bio = 'A short bio helps people learn about you';
      if (!headline.trim()) stepErrors.headline = 'E.g., Full-Stack Developer | CS student';
      if (!college.trim()) stepErrors.college = 'College name is required';
      if (!graduationYear.trim()) {
        stepErrors.graduationYear = 'Graduation year is required';
      } else if (isNaN(Number(graduationYear))) {
        stepErrors.graduationYear = 'Must be a valid year';
      }
    } else if (step === 3) {
      if (!skills.trim()) stepErrors.skills = 'Add at least one or two skills (comma-separated)';
      if (!location.trim()) stepErrors.location = 'Add your city / location';
      if (linkedinUrl && !linkedinUrl.includes('linkedin.com/')) {
        stepErrors.linkedinUrl = 'Must be a valid LinkedIn link';
      }
      if (githubUrl && !githubUrl.includes('github.com/')) {
        stepErrors.githubUrl = 'Must be a valid GitHub link';
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);

    try {
      const { getCSRFToken } = await import('@/lib/utils/csrf');
      const csrfToken = await getCSRFToken();

      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          avatar,
          bio: bio.trim(),
          headline: headline.trim(),
          college: college.trim(),
          graduationYear: Number(graduationYear),
          skills: skillsArray,
          location: location.trim(),
          linkedinUrl: linkedinUrl.trim() || null,
          githubUrl: githubUrl.trim() || null,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      // Update Session
      if (updateSession) {
        await updateSession({
          name: result.data.name,
          image: result.data.image,
          profileComplete: true,
        });
      }

      setStep(4); // Celebration Step!
    } catch (e) {
      console.error('Wizard submission failed:', e);
      setErrors({ global: 'Failed to update profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const percentComplete = Math.min(100, Math.floor(((step - 1) / 3) * 100));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
        <DialogContent className="max-w-xl bg-slate-950/95 border border-red-500/20 backdrop-blur-xl p-0 overflow-hidden shadow-2xl rounded-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Complete Your Developer Profile</DialogTitle>
            <DialogDescription>Fill out details to earn +100 XP and stand out</DialogDescription>
          </DialogHeader>

          {/* Progress Header */}
          <div className="bg-linear-to-r from-red-500/10 to-amber-500/10 p-6 border-b border-white/5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white tracking-wide">LEVEL UP YOUR PROFILE</h3>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5" /> +100 XP Reward
              </span>
            </div>
            
            {/* Progress Bar */}
            {step < 4 && (
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-red-500 to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-black text-white mb-2">Choose your custom avatar</h4>
                    <p className="text-sm text-slate-400">Select an identity that fits your style. Avatars have rare attributes!</p>
                  </div>

                  <div className="grid grid-cols-5 gap-3 py-2">
                    {AVATARS.map((av) => {
                      const isSelected = avatar === av.src;
                      return (
                        <button
                          key={av.id}
                          onClick={() => setAvatar(av.src)}
                          className={`relative rounded-2xl p-0.5 transition-all duration-300 ${
                            isSelected ? 'bg-linear-to-br from-red-500 to-amber-500 scale-105 shadow-lg' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="bg-slate-900 rounded-xl p-1.5 aspect-square relative overflow-hidden">
                            <Image src={av.src} alt={av.name} fill className="object-cover" />
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border border-slate-950">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
                      <Image src={avatar} alt="Selected Avatar" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Identity</p>
                      <h5 className="text-base font-black text-white">
                        {AVATARS.find((a) => a.src === avatar)?.name}
                      </h5>
                      <span className={`text-xs font-black ${
                        AVATARS.find((a) => a.src === avatar)?.rarity === 'Legendary' ? 'text-yellow-400' : 'text-purple-400'
                      }`}>
                        {AVATARS.find((a) => a.src === avatar)?.rarity} Grade
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleNext} className="bg-red-500 hover:bg-red-600 font-bold rounded-xl px-6 flex items-center gap-1.5 text-white">
                      Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">Tell us about yourself</h4>
                    <p className="text-sm text-slate-400">Complete your developer identity for recruiters and peers.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Headline</label>
                      <Input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Full-Stack Developer | CS student at IIT Delhi"
                        className="bg-white/5 border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.headline && <p className="text-xs text-red-400 mt-1 font-bold">{errors.headline}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Short Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a brief intro about what you love building..."
                        className="bg-white/5 border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-20"
                      />
                      {errors.bio && <p className="text-xs text-red-400 mt-1 font-bold">{errors.bio}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">College/Institution</label>
                        <Input
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="e.g. BITS Pilani"
                          className="bg-white/5 border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        {errors.college && <p className="text-xs text-red-400 mt-1 font-bold">{errors.college}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Grad Year</label>
                        <Input
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          placeholder="2027"
                          className="bg-white/5 border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        {errors.graduationYear && <p className="text-xs text-red-400 mt-1 font-bold">{errors.graduationYear}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button onClick={handleBack} variant="ghost" className="text-slate-400 hover:text-white font-bold rounded-xl flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={handleNext} className="bg-red-500 hover:bg-red-600 font-bold rounded-xl px-6 flex items-center gap-1.5 text-white">
                      Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">Professional presence</h4>
                    <p className="text-sm text-slate-400">Share your skill tags and online portfolios.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Skills (comma-separated)</label>
                      <Input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="React, Next.js, Node.js, TypeScript, Go"
                        className="bg-white/5 border-white/10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.skills && <p className="text-xs text-red-400 mt-1 font-bold">{errors.skills}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, Country"
                          className="bg-white/5 border-white/10 pl-10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                      {errors.location && <p className="text-xs text-red-400 mt-1 font-bold">{errors.location}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">GitHub Profile</label>
                        <div className="relative">
                          <Github className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            className="bg-white/5 border-white/10 pl-10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                        {errors.githubUrl && <p className="text-xs text-red-400 mt-1 font-bold">{errors.githubUrl}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">LinkedIn Profile</label>
                        <div className="relative">
                          <Linkedin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            className="bg-white/5 border-white/10 pl-10 rounded-xl text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                        {errors.linkedinUrl && <p className="text-xs text-red-400 mt-1 font-bold">{errors.linkedinUrl}</p>}
                      </div>
                    </div>
                  </div>

                  {errors.global && (
                    <p className="text-sm text-red-400 text-center font-bold">{errors.global}</p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button onClick={handleBack} variant="ghost" className="text-slate-400 hover:text-white font-bold rounded-xl flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-linear-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 font-bold rounded-xl px-8 text-white shadow-lg"
                    >
                      {submitting ? 'Updating...' : 'Finish & Earn XP! 🚀'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 space-y-6"
                >
                  <ConfettiEffect />
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                      className="w-24 h-24 rounded-full bg-linear-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/20"
                    >
                      <Sparkles className="w-12 h-12 text-slate-950 animate-bounce" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-white">PROFILE COMPLETED!</h4>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                      Your professional developer card is now active. You earned reward points!
                    </p>
                  </div>

                  <div className="bg-white/5 inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-white/5">
                    <AwardIcon className="w-8 h-8 text-amber-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awarded</p>
                      <p className="text-xl font-black text-amber-400">+100 XP points</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl py-3 shadow-lg"
                    >
                      Explore Dashboard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
