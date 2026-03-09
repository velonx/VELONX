"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Sparkles, Rocket, Users, Trophy, Code, Mail, Lock, User, Eye, EyeOff, Gift } from "lucide-react";
import { authApi } from "@/lib/api/client";

export default function SignupPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Rocket className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
                    <p className="text-lg text-muted-foreground">Loading signup...</p>
                </div>
            </div>
        }>
            <SignupPage />
        </Suspense>
    );
}

function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [referralCodeError, setReferralCodeError] = useState<string | null>(null);
    const [referralCodeValidating, setReferralCodeValidating] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReferralCode(refParam);
            validateReferralCodeAsync(refParam);
        }
    }, [searchParams]);

    const handleFieldChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (error) setError(null);
    };

    const validateReferralCodeAsync = async (code: string) => {
        if (!code || code.trim() === "") { setReferralCodeError(null); return; }
        setReferralCodeValidating(true);
        setReferralCodeError(null);
        try {
            const response = await fetch('/api/referral/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });
            const result = await response.json();
            if (!(result.success && result.data.valid)) {
                setReferralCodeError("Invalid referral code. You can still register without one.");
            }
        } catch (err) {
            console.error("Referral code validation error:", err);
            setReferralCodeError("Unable to validate referral code. You can still register.");
        } finally {
            setReferralCodeValidating(false);
        }
    };

    const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReferralCode(e.target.value);
        if (error) setError(null);
        setReferralCodeError(null);
    };

    const handleReferralCodeBlur = () => {
        if (referralCode.trim()) validateReferralCodeAsync(referralCode.trim());
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

        setLoading(true);
        try {
            const fullName = `${firstName} ${lastName}`.trim();
            const signupData: { name: string; email: string; password: string; role: "STUDENT" | "ADMIN"; referralCode?: string } = { name: fullName, email, password, role: "STUDENT" };
            if (referralCode.trim()) signupData.referralCode = referralCode.trim();

            await authApi.signup(signupData);

            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                setError("Account created but login failed. Please try logging in manually.");
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push("/dashboard/student");
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === "USER_EXISTS") setError("An account with this email already exists");
            else if (err.message) setError(err.message);
            else setError("Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try { await signIn("google", { callbackUrl: "/dashboard/student" }); }
        catch (error) { console.error("Google signup error:", error); setLoading(false); }
    };

    const handleGitHubSignup = async () => {
        setLoading(true);
        try { await signIn("github", { callbackUrl: "/dashboard/student" }); }
        catch (error) { console.error("GitHub signup error:", error); setLoading(false); }
    };

    const stats = [
        { icon: Rocket, value: "50+", label: "Projects Built" },
        { icon: Users, value: "1000+", label: "Members" },
        { icon: Trophy, value: "30+", label: "Events Hosted" },
        { icon: Code, value: "Free", label: "Forever" },
    ];

    return (
        <div className="min-h-screen flex pt-16 bg-background">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted/20 border-r border-border">
                <div className="absolute inset-0">
                    <div className="absolute top-[15%] right-[15%] w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-float" />
                    <div className="absolute top-[50%] left-[10%] w-48 h-48 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute bottom-[15%] right-[25%] w-36 h-36 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    {/* Brand icon */}
                    <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
                        <Rocket className="w-12 h-12 text-primary" />
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-foreground mb-3 font-bold">Start Building Your Future</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Join thousands of students who are already building real projects and launching their tech careers.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        {stats.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="bg-card rounded-2xl p-4 border border-border text-center hover:shadow-lg hover:border-primary/30 transition-all">
                                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                                <div className="text-xl font-bold text-foreground">{value}</div>
                                <div className="text-muted-foreground text-xs">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-hidden">
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-4">
                            <Sparkles className="w-4 h-4" />
                            Join 1000+ Students
                        </div>
                        <h1 className="text-3xl text-foreground mb-2 font-bold">Create Account</h1>
                        <p className="text-muted-foreground">Start your innovation journey today</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="John"
                                        value={firstName}
                                        onChange={handleFieldChange(setFirstName)}
                                        className="pl-10 py-5 rounded-xl bg-muted border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={handleFieldChange(setLastName)}
                                        className="pl-10 py-5 rounded-xl bg-muted border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground text-sm">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={handleFieldChange(setEmail)}
                                    className="pl-12 py-5 rounded-xl bg-muted border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground text-sm">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={handleFieldChange(setPassword)}
                                    className="pl-12 pr-12 py-5 rounded-xl bg-muted border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground text-sm">
                                Referral Code <span className="text-muted-foreground font-normal">(Optional)</span>
                            </Label>
                            <div className="relative">
                                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Enter referral code"
                                    value={referralCode}
                                    onChange={handleReferralCodeChange}
                                    onBlur={handleReferralCodeBlur}
                                    className={`pl-12 py-5 rounded-xl bg-muted border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all ${referralCodeError ? 'border-yellow-500' : ''}`}
                                />
                                {referralCodeValidating && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            {referralCodeError && <p className="text-xs text-yellow-600 mt-1">{referralCodeError}</p>}
                            {referralCode && !referralCodeError && !referralCodeValidating && (
                                <p className="text-xs text-emerald-600 mt-1">✓ Valid referral code</p>
                            )}
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                                I agree to the{" "}
                                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-6 shadow-lg shadow-primary/20 transition-all"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground">Or sign up with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="py-5 rounded-xl border-border bg-background text-foreground hover:bg-muted transition-all"
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
                            className="py-5 rounded-xl border-border bg-background text-foreground hover:bg-muted transition-all"
                            onClick={handleGitHubSignup}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
