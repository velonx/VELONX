"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";
import { User, Shield, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user && !isRedirecting) {
            const dashboardPath = session.user.role === "ADMIN"
                ? "/dashboard/admin"
                : "/dashboard/student";
            router.push(dashboardPath);
        }
    }, [status, session, router, isRedirecting]);

    const handleLogin = async (role: "student" | "admin") => {
        setLoading(true);
        setIsRedirecting(true);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                role,
                redirect: false,
            });
            if (result?.ok) {
                await new Promise(resolve => setTimeout(resolve, 800));
                const callbackUrl = role === "admin" ? "/dashboard/admin" : "/dashboard/student";
                router.push(callbackUrl);
            } else {
                setIsRedirecting(false);
                setLoading(false);
            }
        } catch {
            setIsRedirecting(false);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard/student" });
        } catch {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        try {
            await signIn("github", { callbackUrl: "/dashboard/student" });
        } catch {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex pt-16 bg-background">
            {/* Left Side — Theme-aware background image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background images — crossfade on theme change */}
                <img
                    src="/login-light.jpeg"
                    alt=""
                    aria-hidden="true"
                    className="login-bg-image"
                    style={{ opacity: theme === "light" ? 1 : 0 }}
                />
                <img
                    src="/login-dark.jpeg"
                    alt=""
                    aria-hidden="true"
                    className="login-bg-image"
                    style={{ opacity: theme === "dark" ? 1 : 0 }}
                />

                {/* Gradient overlay so text stays readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-[1]" />

                {/* Content sits above the image */}
                <div className="relative z-10 flex flex-col items-center justify-end w-full p-12 pb-16">
                    <div className="text-center">
                        <h2 className="text-3xl text-foreground mb-3" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
                            Welcome to Velonx
                        </h2>
                        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                            Your gateway to building real projects, learning new skills, and connecting with tech enthusiasts.
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]">1000+</div>
                            <div className="text-muted-foreground text-sm">Members</div>
                        </div>
                        <div className="w-px bg-border" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]">50+</div>
                            <div className="text-muted-foreground text-sm">Projects</div>
                        </div>
                        <div className="w-px bg-border" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]">30+</div>
                            <div className="text-muted-foreground text-sm">Events</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-hidden">
                <div className="w-full max-w-md relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-4">
                            <Sparkles className="w-4 h-4" />
                            Welcome Back
                        </div>
                        <h1 className="text-3xl text-foreground mb-2" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>Login</h1>
                        <p className="text-muted-foreground text-sm">Continue your innovation journey</p>
                    </div>

                    {/* Role Tabs */}
                    <Tabs defaultValue="student" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1.5 rounded-2xl border border-border">
                            <TabsTrigger value="student" className="gap-2 rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f2c59] data-[state=active]:to-[#1e40af] data-[state=active]:text-white font-medium transition-all">
                                <User className="w-4 h-4" /> Student
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="gap-2 rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f2c59] data-[state=active]:to-[#1e40af] data-[state=active]:text-white font-medium transition-all">
                                <Shield className="w-4 h-4" /> Admin
                            </TabsTrigger>
                        </TabsList>

                        {/* Student Tab */}
                        <TabsContent value="student">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin("student"); }} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-sm">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="student@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 py-6 rounded-xl bg-muted border-border text-foreground focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-foreground text-sm">Password</Label>
                                        <Link href="#" className="text-sm text-[#219EBC] hover:text-[#1a7a94] transition-colors">Forgot Password?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 py-6 rounded-xl bg-muted border-border text-foreground focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#0f2c59]/30 transition-all" disabled={loading}>
                                    {loading ? "Signing in..." : "Log In"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Admin Tab */}
                        <TabsContent value="admin">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin("admin"); }} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-sm">Admin Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="admin@velonx.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 py-6 rounded-xl bg-muted border-border text-foreground focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-foreground text-sm">Password</Label>
                                        <Link href="#" className="text-sm text-[#219EBC] hover:text-[#1a7a94] transition-colors">Forgot Password?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 py-6 rounded-xl bg-muted border-border text-foreground focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#0f2c59]/30 transition-all" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign In as Admin"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground">Or</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full py-6 rounded-xl border-border bg-background text-foreground hover:bg-muted transition-all" onClick={handleGoogleLogin} disabled={loading}>
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                        <Button variant="outline" className="w-full py-6 rounded-xl border-border bg-background text-foreground hover:bg-muted transition-all" onClick={handleGitHubLogin} disabled={loading}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Don&apos;t have an account? <Link href="/auth/signup" className="text-[#219EBC] font-medium hover:text-[#1a7a94] transition-colors underline-offset-4 hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
