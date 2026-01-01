"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import InteractiveRobot from "@/components/interactive-robot";
import { ArrowRight, Sparkles, Rocket, Users, Trophy, Code, Mail, Lock, User, Eye, EyeOff, Zap, Target } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupState, setSignupState] = useState<"idle" | "success" | "error">("idle");

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setSignupState("success");
            setTimeout(() => {
                setLoading(false);
                router.push("/dashboard/student");
            }, 1000);
        }, 800);
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard/student" });
        } catch (error) {
            console.error("Google signup error:", error);
            setSignupState("error");
            setTimeout(() => setSignupState("idle"), 2000);
            setLoading(false);
        }
    };

    const handleGitHubSignup = async () => {
        setLoading(true);
        try {
            await signIn("github", { callbackUrl: "/dashboard/student" });
        } catch (error) {
            console.error("GitHub signup error:", error);
            setSignupState("error");
            setTimeout(() => setSignupState("idle"), 2000);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex pt-16">
            {/* Left Side - Animated Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a0f2e] via-[#0d1f3c] to-[#0a0a0f]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Floating Orbs */}
                    <div className="absolute top-[15%] right-[15%] w-40 h-40 rounded-full bg-yellow-500/20 blur-3xl animate-float" />
                    <div className="absolute top-[50%] left-[10%] w-48 h-48 rounded-full bg-violet-500/20 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute bottom-[15%] right-[25%] w-36 h-36 rounded-full bg-cyan-500/15 blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    {/* Logo */}
                    <Link href="/" className="absolute top-8 left-8">
                        <img src="/logo.png" alt="Velonx" className="h-10 w-auto" />
                    </Link>

                    {/* Interactive Robot Mascot */}
                    <div className="relative mb-8">
                        <InteractiveRobot
                            showPassword={showPassword}
                            loginState={signupState}
                            size="lg"
                        />

                        {/* Floating Icons */}
                        <div className="absolute -top-8 left-0 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm border border-yellow-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                        <div className="absolute top-8 -right-16 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Code className="w-7 h-7 text-cyan-400" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 -left-12 animate-bounce-in" style={{ animationDelay: '0.6s' }}>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 backdrop-blur-sm border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                        </div>
                        <div className="absolute -bottom-4 right-4 animate-bounce-in" style={{ animationDelay: '0.8s' }}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Zap className="w-5 h-5 text-green-400" />
                            </div>
                        </div>

                        {/* Star particles */}
                        <div className="absolute -top-4 right-8 w-2 h-2 bg-white rounded-full animate-twinkle" />
                        <div className="absolute top-12 -left-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-8 right-16 w-1 h-1 bg-cyan-300 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Text Content */}
                    <div className="text-center mt-12">
                        <h2 className="text-3xl font-black text-white mb-3">
                            <span className="text-white">Start Building</span> <span className="gradient-text-yellow">Your Future</span>
                        </h2>
                        <p className="text-gray-400 max-w-sm">
                            Join thousands of students who are already building real projects and launching their tech careers.
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <div className="glass rounded-2xl p-4 border border-white/10 text-center animate-fade-in-up stagger-1 hover-lift">
                            <Rocket className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                            <div className="text-xl font-bold text-white">50+</div>
                            <div className="text-gray-500 text-xs">Projects Built</div>
                        </div>
                        <div className="glass rounded-2xl p-4 border border-white/10 text-center animate-fade-in-up stagger-2 hover-lift">
                            <Users className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                            <div className="text-xl font-bold text-white">1000+</div>
                            <div className="text-gray-500 text-xs">Members</div>
                        </div>
                        <div className="glass rounded-2xl p-4 border border-white/10 text-center animate-fade-in-up stagger-3 hover-lift">
                            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-xl font-bold text-white">30+</div>
                            <div className="text-gray-500 text-xs">Events Hosted</div>
                        </div>
                        <div className="glass rounded-2xl p-4 border border-white/10 text-center animate-fade-in-up stagger-4 hover-lift">
                            <Code className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-xl font-bold text-white">Free</div>
                            <div className="text-gray-500 text-xs">Forever</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0a0f] relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6">
                        <Link href="/">
                            <img src="/logo.png" alt="Velonx" className="h-12 w-auto mx-auto mb-4" />
                        </Link>
                        {/* Mobile Robot */}
                        <div className="flex justify-center mb-4">
                            <InteractiveRobot
                                showPassword={showPassword}
                                loginState={signupState}
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 text-sm font-medium text-yellow-300 mb-4">
                            <Sparkles className="w-4 h-4" />
                            Join 1000+ Students
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Start your innovation journey today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-sm">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input placeholder="John" className="pl-10 py-5 rounded-xl bg-white/5 border-white/10 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-sm">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input placeholder="Doe" className="pl-10 py-5 rounded-xl bg-white/5 border-white/10 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all" required />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-sm">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input type="email" placeholder="john@example.com" className="pl-12 py-5 rounded-xl bg-white/5 border-white/10 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-sm">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    className="pl-12 pr-12 py-5 rounded-xl bg-white/5 border-white/10 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="terms" className="border-white/20 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 mt-0.5" />
                            <label htmlFor="terms" className="text-sm text-gray-400 leading-tight">
                                I agree to the <Link href="#" className="text-yellow-400 hover:underline">Terms of Service</Link> and <Link href="#" className="text-yellow-400 hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold rounded-xl py-6 shadow-lg shadow-yellow-500/25 transition-all hover:shadow-yellow-500/40 btn-magnetic"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#0a0a0f] text-gray-500">Or sign up with</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="py-5 rounded-xl border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
                            onClick={handleGoogleSignup}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            className="py-5 rounded-xl border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
                            onClick={handleGitHubSignup}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </Button>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link href="/auth/login" className="text-yellow-400 font-medium hover:text-yellow-300 transition-colors underline-offset-4 hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
