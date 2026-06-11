'use client';

import React, { useState } from 'react';
import { ArrowLeft, Compass, CheckCircle2, Circle, ExternalLink, Calendar, Timer, Award, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { getCSRFToken } from '@/lib/utils/csrf';
import { CertificateModal } from './CertificateModal';
import Image from 'next/image';

interface Module {
  id: string;
  title: string;
  description: string;
  link: string;
  duration: string;
  order: number;
  completed: boolean;
}

interface PathDetailHubProps {
  path: {
    id: string;
    title: string;
    description: string;
    level: string;
    duration: string;
    badgeName: string;
    badgeImageUrl: string;
    progress: number;
    completedModules: number;
    modules: Module[];
    isStarted: boolean;
    isCompleted: boolean;
    certificateEarned: boolean;
    certificateUrl?: string;
    testStatus?: {
      id: string;
      testDate: string;
      status: string;
      score: number | null;
    } | null;
  };
  onBack: () => void;
  onRefresh: () => void;
  studentName?: string;
}

export const PathDetailHub: React.FC<PathDetailHubProps> = ({
  path,
  onBack,
  onRefresh,
  studentName = "A Velonx Student",
}) => {
  const [scheduling, setScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  
  // Mock Test Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testPassed, setTestPassed] = useState(false);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);
  const [completingModuleId, setCompletingModuleId] = useState<string | null>(null);

  const handleModuleClick = async (mod: Module) => {
    // Open the URL in a new window/tab
    window.open(mod.link, '_blank', 'noopener,noreferrer');

    // Automatically trigger module completion in the background
    setCompletingModuleId(mod.id);
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/learning-paths/modules/${mod.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        const isNowCompleted = data.data.completed;
        if (isNowCompleted) {
          toast.success(`Checkpoint completed! +50 XP Earned 🎉`);
        } else {
          toast.success("Checkpoint progress reset");
        }
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update module completion:", error);
    } finally {
      setCompletingModuleId(null);
    }
  };

  const handleScheduleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please pick a test date");
      return;
    }

    setScheduling(true);
    try {
      const csrfToken = await getCSRFToken();
      const testDate = new Date(`${selectedDate}T${selectedTime}:00`);

      const response = await fetch(`/api/learning-paths/${path.id}/schedule-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ testDate }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Exam successfully scheduled! Prepare well! 📅");
        onRefresh();
      } else {
        throw new Error(data.error?.message || "Failed to schedule test");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule test");
    } finally {
      setScheduling(false);
    }
  };

  const handleStartExam = () => {
    setTestAnswers({});
    setTestPassed(false);
    setShowTestModal(true);
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = async () => {
    // Check if all questions are answered
    if (Object.keys(testAnswers).length < 3) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    // Determine correct answers (Question 1: reduced, Question 2: hash, Question 3: useMemo)
    const q1Correct = testAnswers[1] === 'reduced';
    const q2Correct = testAnswers[2] === 'hash';
    const q3Correct = testAnswers[3] === 'usememo';

    const score = ((q1Correct ? 1 : 0) + (q2Correct ? 1 : 0) + (q3Correct ? 1 : 0)) * (100 / 3);

    if (score < 66) {
      toast.error(`Score: ${Math.round(score)}%. You need at least 66% (2 correct answers) to pass. Please try again!`);
      return;
    }

    setSubmittingTest(true);
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/learning-paths/${path.id}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ score: Math.round(score) }),
      });

      const data = await response.json();
      if (data.success) {
        setTestPassed(true);
        toast.success("Congratulations! You passed the Exam! 🎉");
        onRefresh();
        setTimeout(() => {
          setShowTestModal(false);
          setShowCertModal(true);
        }, 1500);
      } else {
        throw new Error(data.error?.message || "Failed to submit exam results");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit exam results");
    } finally {
      setSubmittingTest(false);
    }
  };

  // Date limit helpers (must be today or in the future)
  const getMinDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
      {/* Back Button and Path title info */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 px-4 rounded-xl border border-border text-[#1A234A] hover:bg-muted font-bold text-sm cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roadmaps
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8">
        
        {/* LEFT COLUMN: Modules Timeline */}
        <div className="space-y-6">
          <div className="card-glass-redesign bg-card border border-border rounded-3xl p-8 space-y-6">
            <div>
              <Badge className="bg-[#226CE0]/10 text-[#226CE0] font-black border-0 rounded-full mb-3 px-3 py-1">
                {path.level} Roadmap
              </Badge>
              <h2 className="text-2xl font-black text-[#1A234A] dark:text-white leading-tight">
                {path.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {path.description}
              </p>
            </div>

            <div className="h-px bg-border/50" />

            {/* Checkpoints Checklist */}
            <div className="space-y-6">
              <h3 className="text-base font-black text-[#1A234A] dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#226CE0]" />
                Roadmap Checkpoints Timeline
              </h3>

              <div className="relative pl-6 space-y-8 border-l border-zinc-200 dark:border-zinc-800 ml-4">
                {path.modules.map((mod, index) => (
                  <div key={mod.id} className="relative group/mod">
                    {/* Circle bullet indicator */}
                    <div className="absolute -left-10 top-0.5 z-10 flex items-center justify-center bg-background rounded-full p-1">
                      {mod.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50/80" />
                      ) : (
                        <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-700 bg-background" />
                      )}
                    </div>

                    <div className="bg-muted/30 hover:bg-muted/50 rounded-2xl p-5 border border-border/40 hover:border-[#226CE0]/20 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#1A234A] dark:text-white flex items-center gap-2">
                            <span>{index + 1}. {mod.title}</span>
                            {mod.completed && (
                              <span className="text-[10px] text-green-600 font-extrabold uppercase bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full shrink-0">
                                Completed
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {mod.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 pt-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Duration: {mod.duration}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleModuleClick(mod)}
                          disabled={completingModuleId === mod.id}
                          className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-none cursor-pointer ${
                            mod.completed
                              ? 'bg-muted hover:bg-muted/80 text-[#1A234A] border border-border'
                              : 'bg-[#226CE0] hover:bg-[#334DAF] text-white'
                          }`}
                        >
                          {completingModuleId === mod.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>{mod.completed ? "Review Checkpoint" : "Start Checkpoint"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Path Stats / Badge / Exams Console */}
        <div className="space-y-6">
          
          {/* Progress Overview Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md relative overflow-hidden">
            <h3 className="text-sm font-bold text-[#1A234A] dark:text-white mb-4">Roadmap Progress</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-2xl font-black text-[#1A234A] dark:text-white">{path.progress}%</span>
                  <span className="text-xs text-muted-foreground">completed checkpoints</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{path.completedModules} of {path.modules.length} Checkpoints</span>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#226CE0] to-[#8B5CF6] rounded-full transition-all duration-500"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skill Badge Reward Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md text-center space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
            <h3 className="text-sm font-bold text-[#1A234A] dark:text-white">Completion Skill Badge</h3>
            
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="relative w-24 h-24 bg-linear-to-br from-[#226CE0]/5 to-[#8B5CF6]/5 rounded-3xl flex items-center justify-center border border-border shadow-inner group">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-tr from-[#226CE0]/10 to-[#8B5CF6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                {path.badgeImageUrl ? (
                  <Image
                    src={path.badgeImageUrl}
                    alt={path.badgeName}
                    width={80}
                    height={80}
                    className="object-contain transition-transform duration-300 group-hover:scale-110 z-10"
                    unoptimized
                  />
                ) : (
                  <Award className="w-16 h-16 text-orange-500 z-10" />
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#1A234A] dark:text-white">{path.badgeName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Awarded after passing the proficiency exam</p>
              </div>
            </div>
            
            <div className="h-px bg-border/50" />
            
            <div className="text-xs font-bold text-[#F0771A] flex items-center justify-center gap-1">
              <span>💎 Value: 500 XP Award</span>
            </div>
          </div>

          {/* Certification / Exam Panel */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-[#1A234A] dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#226CE0]" />
              Certificate Verification Console
            </h3>

            {path.certificateEarned ? (
              // CASE 4: CERTIFICATE EARNED
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/50 rounded-2xl p-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mx-auto text-xl">
                  🎓
                </div>
                <div>
                  <h4 className="text-sm font-black text-green-800 dark:text-green-400">Roadmap Certified!</h4>
                  <p className="text-xs text-green-700 dark:text-green-500 mt-1 leading-relaxed">
                    You passed the proficiency exam. Your Certificate of Excellence is unlocked!
                  </p>
                </div>
                <Button
                  onClick={() => setShowCertModal(true)}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-green-500/10"
                >
                  🏆 View Verified Certificate
                </Button>
              </div>
            ) : path.testStatus?.status === 'SCHEDULED' ? (
              // CASE 3: EXAM SCHEDULED
              <div className="bg-[#226CE0]/5 border border-[#226CE0]/20 rounded-2xl p-5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#226CE0]/10 text-[#226CE0] flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#1A234A]">Exam Scheduled!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your exam is scheduled for: <span className="font-bold text-[#226CE0]">{new Date(path.testStatus.testDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <Button
                  onClick={handleStartExam}
                  className="w-full h-11 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-[#226CE0]/15"
                >
                  📝 Start Certification Exam
                </Button>
              </div>
            ) : path.isCompleted ? (
              // CASE 2: ROADMAP COMPLETED, ELIGIBLE TO SCHEDULE
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 rounded-2xl p-5 space-y-4">
                <div className="text-center space-y-2">
                  <span className="text-2xl">⚡</span>
                  <h4 className="text-sm font-black text-[#1A234A]">Schedule Proficiency Exam</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All checkpoints completed. Select a date to schedule your exam and unlock your certificate.
                  </p>
                </div>

                <form onSubmit={handleScheduleTest} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Exam Date</label>
                    <input
                      type="date"
                      required
                      min={getMinDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Exam Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0]"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={scheduling}
                    className="w-full h-11 bg-[#F0771A] hover:bg-[#D96510] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    {scheduling ? "Scheduling..." : "Schedule Certification Exam"}
                  </Button>
                </form>
              </div>
            ) : (
              // CASE 1: ROADMAP INCOMPLETE
              <div className="bg-gray-50 dark:bg-zinc-900/40 rounded-2xl p-5 text-center space-y-2.5">
                <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto" />
                <h4 className="text-xs font-bold text-gray-500">Exam Locked</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                  Complete all modules to unlock exam scheduling. Every accessed module checkpoint records progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOCK TEST DIALOG MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="text-3xl">📝</span>
              <h3 className="text-xl font-black text-[#1A234A] dark:text-white">
                Proficiency Exam: {path.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Answer the questions below to demonstrate path proficiency and earn your certificate.
              </p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {/* Question 1 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1A234A] dark:text-white flex items-start gap-2">
                  <span className="bg-[#226CE0]/10 text-[#226CE0] px-1.5 py-0.5 rounded text-xs">Q1</span>
                  <span>What is the primary benefit of React Server Components (RSC)?</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 pl-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="style"
                      checked={testAnswers[1] === 'style'}
                      onChange={() => handleAnswerSelect(1, 'style')}
                      className="text-[#226CE0]"
                    />
                    <span>Automatic CSS styling integration</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="reduced"
                      checked={testAnswers[1] === 'reduced'}
                      onChange={() => handleAnswerSelect(1, 'reduced')}
                      className="text-[#226CE0]"
                    />
                    <span>Reduced javascript bundle size sent to the client</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="state"
                      checked={testAnswers[1] === 'state'}
                      onChange={() => handleAnswerSelect(1, 'state')}
                      className="text-[#226CE0]"
                    />
                    <span>Allows using useState directly in the client</span>
                  </label>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1A234A] dark:text-white flex items-start gap-2">
                  <span className="bg-[#226CE0]/10 text-[#226CE0] px-1.5 py-0.5 rounded text-xs">Q2</span>
                  <span>Which data structure offers O(1) average lookup complexity?</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 pl-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      value="list"
                      checked={testAnswers[2] === 'list'}
                      onChange={() => handleAnswerSelect(2, 'list')}
                      className="text-[#226CE0]"
                    />
                    <span>Doubly Linked List</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      value="hash"
                      checked={testAnswers[2] === 'hash'}
                      onChange={() => handleAnswerSelect(2, 'hash')}
                      className="text-[#226CE0]"
                    />
                    <span>Hash Table (Dictionary)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      value="tree"
                      checked={testAnswers[2] === 'tree'}
                      onChange={() => handleAnswerSelect(2, 'tree')}
                      className="text-[#226CE0]"
                    />
                    <span>Binary Search Tree</span>
                  </label>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1A234A] dark:text-white flex items-start gap-2">
                  <span className="bg-[#226CE0]/10 text-[#226CE0] px-1.5 py-0.5 rounded text-xs">Q3</span>
                  <span>Which hook is used to cache computationally expensive values?</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 pl-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q3"
                      value="usememo"
                      checked={testAnswers[3] === 'usememo'}
                      onChange={() => handleAnswerSelect(3, 'usememo')}
                      className="text-[#226CE0]"
                    />
                    <span>useMemo</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q3"
                      value="usecallback"
                      checked={testAnswers[3] === 'usecallback'}
                      onChange={() => handleAnswerSelect(3, 'usecallback')}
                      className="text-[#226CE0]"
                    />
                    <span>useCallback</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name="q3"
                      value="useeffect"
                      checked={testAnswers[3] === 'useeffect'}
                      onChange={() => handleAnswerSelect(3, 'useeffect')}
                      className="text-[#226CE0]"
                    />
                    <span>useEffect</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTestModal(false)}
                className="h-11 px-5 rounded-xl border border-border cursor-pointer font-bold text-xs"
              >
                Close
              </Button>
              <Button
                onClick={handleSubmitExam}
                disabled={submittingTest || Object.keys(testAnswers).length < 3}
                className="h-11 px-6 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-[#226CE0]/15"
              >
                {submittingTest ? "Submitting..." : "Submit Answers"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE LIGHTBOX MODAL */}
      {showCertModal && (
        <CertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          studentName={studentName}
          pathTitle={path.title}
          certificateId={
            path.certificateUrl
              ? path.certificateUrl.split('/').pop() || 'VAL-CERT-0001'
              : 'VAL-CERT-0001'
          }
          earnedDate={
            path.testStatus?.testDate
              ? new Date(path.testStatus.testDate).toLocaleDateString()
              : new Date().toLocaleDateString()
          }
        />
      )}
    </div>
  );
};
