"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplineScene from "@/components/SplineScene";
import { User, Shield, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Redirect to dashboard if already logged in (but not during login process)
    useEffect(() => {
        console.log("useEffect - status:", status, "isRedirecting:", isRedirecting);
        if (status === "authenticated" && session?.user && !isRedirecting) {
            console.log("useEffect - User is authenticated, redirecting...");
            console.log("useEffect - User role:", session.user.role);
            const dashboardPath = session.user.role === "ADMIN"
                ? "/dashboard/admin"
                : "/dashboard/student";
            console.log("useEffect - Redirecting to:", dashboardPath);
            router.push(dashboardPath);
        }
    }, [status, session, router, isRedirecting]);

    const handleLogin = async (role: "student" | "admin") => {
        console.log("=== LOGIN STARTED ===");
        console.log("Role:", role);
        console.log("Email:", email);
        console.log("Password length:", password.length);
        
        setLoading(true);
        setIsRedirecting(true);

        try {
            console.log("Calling signIn...");
            const result = await signIn("credentials", {
                email,
                password,
                role,
                redirect: false,
            });

            console.log("Login result:", result);

            if (result?.ok) {
                console.log("✅ Login successful!");
                
                // Wait a bit for session to update
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check session
                const response = await fetch('/api/auth/session');
                const sessionData = await response.json();
                console.log("Session after login:", sessionData);
                
                const callbackUrl = role === "admin" ? "/dashboard/admin" : "/dashboard/student";
                console.log("Redirecting to:", callbackUrl);
                
                // Use router.push instead of window.location
                router.push(callbackUrl);
            } else {
                console.error("❌ Login failed:", result?.error);
                setIsRedirecting(false);
                setLoading(false);
            }
        } catch (error) {
            console.error("❌ Login exception:", error);
            setIsRedirecting(false);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard/student" });
        } catch (error) {
            console.error("Google login error:", error);
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        try {
            await signIn("github", { callbackUrl: "/dashboard/student" });
        } catch (error) {
            console.error("GitHub login error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex pt-16 bg-white">
            {/* Left Side - Animated Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Floating Orbs */}
                    <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-[#219EBC]/10 blur-3xl animate-float" />
                    <div className="absolute top-[40%] right-[20%] w-48 h-48 rounded-full bg-[#0f2c59]/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-[20%] left-[30%] w-40 h-40 rounded-full bg-[#219EBC]/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    {/* Interactive Robot */}
                    <div className="relative mb-8 w-full h-[400px]">
                        <SplineScene showPassword={showPassword} loginState="idle" />
                    </div>

                    {/* Text Content */}
                    <div className="text-center mt-8">
                        <h2 className="text-3xl text-[#023047] mb-3" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
                            Welcome to Velonx
                        </h2>
                        <p className="text-gray-600 max-w-sm" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                            Your gateway to building real projects, learning new skills, and connecting with tech enthusiasts.
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-8 mt-10">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]" style={{ fontFamily: "'Montserrat', sans-serif" }}>1000+</div>
                            <div className="text-gray-500 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Members</div>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]" style={{ fontFamily: "'Montserrat', sans-serif" }}>50+</div>
                            <div className="text-gray-500 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Projects</div>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#219EBC]" style={{ fontFamily: "'Montserrat', sans-serif" }}>30+</div>
                            <div className="text-gray-500 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Events</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Interactive Robot */}
                    <div className="lg:hidden flex justify-center mb-6 h-[250px]">
                        <SplineScene showPassword={showPassword} loginState="idle" />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <Sparkles className="w-4 h-4" />
                            Welcome Back
                        </div>
                        <h1 className="text-3xl text-[#023047] mb-2" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>Login</h1>
                        <p className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>Continue your innovation journey</p>
                    </div>

                    {/* Role Tabs */}
                    <Tabs defaultValue="student" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                            <TabsTrigger value="student" className="gap-2 rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f2c59] data-[state=active]:to-[#1e40af] data-[state=active]:text-white font-medium transition-all" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                <User className="w-4 h-4" /> Student
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="gap-2 rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f2c59] data-[state=active]:to-[#1e40af] data-[state=active]:text-white font-medium transition-all" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                <Shield className="w-4 h-4" /> Admin
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="student">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin("student"); }} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="student@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 py-6 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-gray-700 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Password</Label>
                                        <Link href="#" className="text-sm text-[#219EBC] hover:text-[#1a7a94] transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>Forgot Password?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 py-6 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#0f2c59]/30 transition-all"
                                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                                    disabled={loading}
                                >
                                    {loading ? "Signing in..." : "Log In"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="admin">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin("admin"); }} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Admin Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="admin@velonx.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 py-6 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-gray-700 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Password</Label>
                                        <Link href="#" className="text-sm text-[#219EBC] hover:text-[#1a7a94] transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>Forgot Password?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 py-6 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:border-[#219EBC] focus:ring-2 focus:ring-[#219EBC]/20 transition-all"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#0f2c59]/30 transition-all"
                                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                                    disabled={loading}
                                >
                                    {loading ? "Signing in..." : "Sign In as Admin"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>Or</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full py-6 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full py-6 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            onClick={handleGitHubLogin}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-500 mt-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Don&apos;t have an account? <Link href="/auth/signup" className="text-[#219EBC] font-medium hover:text-[#1a7a94] transition-colors underline-offset-4 hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
