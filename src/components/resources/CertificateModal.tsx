'use client';

import React from 'react';
import { X, Printer, Download, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  pathTitle: string;
  certificateId: string;
  earnedDate: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  pathTitle,
  certificateId,
  earnedDate,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-certificate-container');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body {
          background: #FFFFFF !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        #print-wrapper {
          display: block !important;
          width: 100% !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      }
    `;

    document.head.appendChild(style);

    // Create print window or print directly
    window.print();
    
    // Clean up
    document.head.removeChild(style);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print p-4">
      <div 
        className="bg-card w-full max-w-4xl rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#226CE0]" />
            <h2 id="cert-modal-title" className="text-lg font-black text-[#1A234A] dark:text-white">
              Velonx Verified Credential
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            aria-label="Close certificate view"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Viewer */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-zinc-950/5">
          <div 
            id="printable-certificate-container"
            className="w-full max-w-3xl aspect-[1.414/1] bg-white text-zinc-900 border-[16px] border-double border-zinc-300 p-8 flex flex-col justify-between relative shadow-lg rounded-sm"
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(255,251,219,0.1) 0%, rgba(255,255,255,0.9) 100%)',
              fontFamily: 'Georgia, serif' 
            }}
          >
            {/* Watermark Orbits */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
              <Award className="w-80 h-80 text-[#226CE0]" />
            </div>

            {/* Corner Borders */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-zinc-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-zinc-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-zinc-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-zinc-400" />

            {/* Top Branding */}
            <div className="text-center space-y-1 z-10">
              <span className="block text-xs font-bold tracking-[0.2em] text-[#226CE0] uppercase font-sans">
                VELONX ACADEMY
              </span>
              <h3 className="text-xl font-bold tracking-wider text-[#1A234A] font-sans">
                CERTIFICATE OF COMPLETION
              </h3>
            </div>

            {/* Core Message */}
            <div className="text-center space-y-4 z-10">
              <p className="text-sm italic text-zinc-500">
                This is to officially certify that
              </p>
              <h4 className="text-3xl font-black tracking-tight text-[#1A234A] py-1 border-b border-zinc-100 max-w-md mx-auto font-sans leading-none">
                {studentName}
              </h4>
              <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
                has successfully completed all module checkpoints, submitted all required deliverables, and passed the proficiency exam for the learning path
              </p>
              <h5 className="text-lg font-bold text-[#226CE0] tracking-wide font-sans">
                {pathTitle}
              </h5>
              <p className="text-xs italic text-zinc-400">
                awarding them the corresponding skill badge and credential.
              </p>
            </div>

            {/* Signatures and Credential Metadata */}
            <div className="flex justify-between items-end border-t border-zinc-100 pt-6 z-10 font-sans">
              <div className="text-left space-y-1">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Credential ID
                </span>
                <span className="block text-xs font-mono font-bold text-zinc-700">
                  {certificateId}
                </span>
                <span className="block text-[10px] text-zinc-400">
                  Issued on: {earnedDate}
                </span>
              </div>

              {/* Gold seal */}
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border-4 border-amber-400/40 flex items-center justify-center text-amber-500 relative shadow-inner">
                <Award className="w-8 h-8 rotate-12" />
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-400 animate-spin duration-1000" style={{ animationDuration: '20s' }} />
              </div>

              <div className="text-right space-y-1">
                <div className="border-b border-zinc-300 pb-1 px-4 text-center">
                  <span className="font-great-vibes text-[#1A234A] text-xl font-bold italic block tracking-wide">
                    Rishi Pandey
                  </span>
                </div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                  Academy Director
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-border text-foreground hover:bg-muted font-bold text-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            className="h-11 px-6 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
