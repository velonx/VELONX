import { verificationService } from "@/lib/services/verification.service";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Calendar, Globe, ArrowLeft, Award, Briefcase, Star, Zap } from 'lucide-react';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function VerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verification = await verificationService.getVerificationByToken(token);

  if (!verification) {
    notFound();
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INTERNSHIP": return <Briefcase className="w-6 h-6" />;
      case "ACHIEVEMENT": return <Award className="w-6 h-6" />;
      case "EXCELLENCE": return <Star className="w-6 h-6" />;
      case "CONTRIBUTION": return <Zap className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INTERNSHIP": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "ACHIEVEMENT": return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "EXCELLENCE": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "CONTRIBUTION": return "text-green-500 bg-green-500/10 border-green-500/20";
      default: return "text-[#226CE0] bg-[#226CE0]/10 border-[#226CE0]/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#226CE0]/30">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#226CE0] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Velonx
        </Link>

        <Card className="relative overflow-hidden border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] bg-white">
          {/* Header Accent */}
          <div className={`h-3 w-full ${getTypeColor(verification.type).split(' ')[1]}`} />
          
          <CardContent className="p-8 md:p-16">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Trust Badge */}
              <div className="flex flex-col items-center gap-3">
                <div className={`p-5 rounded-3xl ${getTypeColor(verification.type)} border flex items-center justify-center shadow-lg`}>
                  {getTypeIcon(verification.type)}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 text-green-600 font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" /> Verified Credential
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-[#1A234A] leading-tight">
                  {verification.title}
                </h1>
                <p className="text-xl text-slate-500 max-w-md mx-auto">
                  This record officially confirms the {verification.type.toLowerCase().replace('_', ' ')} status for
                </p>
              </div>

              {/* User Identity */}
              <div className="flex flex-col items-center gap-4 bg-slate-50 p-8 rounded-4xl w-full border border-slate-100">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={verification.user.image || ""} />
                  <AvatarFallback className="bg-[#226CE0] text-white text-2xl font-black">
                    {verification.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-black text-[#1A234A]">{verification.user.name}</h3>
                  <p className="text-slate-500 font-medium">{verification.user.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
                <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
                    <p className="font-bold text-[#1A234A]">{new Date(verification.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification ID</p>
                    <p className="font-mono text-sm font-bold text-[#1A234A] truncate max-w-37.5">{verification.verificationToken}</p>
                  </div>
                </div>
              </div>

              {verification.description && (
                <div className="w-full text-left bg-slate-50/50 p-8 rounded-4xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description & Outcomes</p>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{verification.description}"
                  </p>
                </div>
              )}

              {/* Footer Trust Info */}
              <div className="pt-8 border-t border-slate-50 w-full flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1A234A] rounded-lg flex items-center justify-center text-white font-black text-xs">V</div>
                  <span className="font-black text-[#1A234A] tracking-tight text-xl italic">VELONX</span>
                </div>
                <p className="text-xs text-slate-400 text-center max-w-sm leading-loose">
                  This credential was issued by Velonx Platform and is cryptographically unique. 
                  Any alteration of this record will invalidate its verification status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
