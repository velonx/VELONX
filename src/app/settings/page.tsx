import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import { SettingsErrorBoundary } from "@/components/error-boundary";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Unable to Load Settings</h1>
            <p className="text-muted-foreground mb-6">
              We encountered an error while loading your account settings. Please try again later.
            </p>
            <a
              href="/dashboard/student"
              className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-semibold"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground">Account Settings</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-card border border-border rounded-3xl shadow-lg">
          <div className="p-8 md:p-12">
            <SettingsErrorBoundary>
              <ProfileSettingsForm initialData={user} />
            </SettingsErrorBoundary>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground font-bold mb-2">Privacy &amp; Security</h3>
            <p className="text-muted-foreground text-sm">
              Your data is encrypted and secure. We never share your information with third parties.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground text-sm">
              Contact our support team if you have any questions about your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
