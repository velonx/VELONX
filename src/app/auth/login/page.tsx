"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, ArrowRight, Mail, Lock, Eye, EyeOff, Github } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
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
        <div className="min-h-screen flex items-center justify-center relative p-4 font-outfit overflow-hidden">
            
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                    src="/ocean-bg.jpg"
                    alt="Login Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 z-[1]" />
            </div>

            {/* Login Form Container — Navy Blue box with wide white border */}
            <div className="w-full max-w-md bg-[#0B1526] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] z-10 border-[10px] border-white flex flex-col justify-center p-6 md:p-8 text-gray-200">
                
                <h1 className="text-2xl text-white font-bold mb-6 text-center">Login</h1>

                <Tabs defaultValue="student" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1A2438] p-1 rounded-xl border border-[#2A3648]/40 text-gray-400">
                        <TabsTrigger value="student" className="rounded-lg py-1.5 data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium transition-all gap-2 text-sm">
                            <User className="w-3.5 h-3.5" /> Student
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-lg py-1.5 data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium transition-all gap-2 text-sm">
                            <Shield className="w-3.5 h-3.5" /> Admin
                        </TabsTrigger>
                    </TabsList>

                    {/* Shared Input Cls */}
                    {["student", "admin"].map((role) => (
                        <TabsContent key={role} value={role}>
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin(role as "student" | "admin"); }} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-gray-400 text-[10px] uppercase tracking-widest ml-1">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            placeholder={role === "student" ? "student@example.com" : "admin@velonx.com"}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 py-5 rounded-xl bg-[#1A2438] border-[#2A3648] text-white placeholder:text-gray-500 focus:border-[#219EBC] focus:ring-1 focus:ring-[#219EBC] transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-400 text-[10px] uppercase tracking-widest ml-1">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10 py-5 rounded-xl bg-[#1A2438] border-[#2A3648] text-white placeholder:text-gray-500 focus:border-[#219EBC] focus:ring-1 focus:ring-[#219EBC] transition-all text-sm"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`keep-signed-${role}`} className="w-3.5 h-3.5 border-gray-500 data-[state=checked]:bg-[#219EBC] data-[state=checked]:border-[#219EBC]" />
                                        <label htmlFor={`keep-signed-${role}`} className="text-[11px] text-gray-400 font-medium cursor-pointer">
                                            Keep me signed in
                                        </label>
                                    </div>
                                    <Link href="#" className="text-[11px] text-[#219EBC] hover:underline transition-colors">Forgot Password?</Link>
                                </div>

                                <div className="flex justify-center pt-2">
                                    <Button type="submit" className="bg-[#219EBC] hover:bg-[#1a859e] text-white font-bold rounded-xl py-5 shadow-lg shadow-[#219EBC]/20 transition-all uppercase tracking-widest text-xs px-12" disabled={loading}>
                                        {loading ? "Signing in..." : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="mt-6 pt-5 border-t border-[#2A3648]/40">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>Or login with</span>
                            <div className="flex items-center gap-2">
                                <button onClick={handleGitHubLogin} className="w-7 h-7 rounded-full bg-[#1A2438] border border-[#2A3648] flex items-center justify-center hover:bg-[#2A3648] hover:text-white transition-colors text-gray-400">
                                    <Github className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={handleGoogleLogin} className="w-7 h-7 rounded-full bg-[#1A2438] border border-[#2A3648] flex items-center justify-center hover:bg-[#2A3648] hover:text-white transition-colors text-gray-400">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 pt-2">
                            <span className="text-[11px] text-gray-500">Don't have an account?</span>
                            <Link href="/auth/signup">
                                <Button variant="link" className="text-[#219EBC] hover:text-[#1a859e] font-bold p-0 h-auto text-[11px] uppercase tracking-widest">
                                    Join Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
