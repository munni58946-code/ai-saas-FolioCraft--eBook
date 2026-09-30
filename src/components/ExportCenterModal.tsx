import React, { useState } from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import { generateBookPDF } from '../utils/pdfGenerator';
import { exportToMarkdown, exportToPlainText, exportToJSON } from '../utils/exportUtils';
import {
  FileText,
  FileCode,
  FileArchive,
  Download,
  Eye,
  Check,
  AlertCircle,
  X,
  BookOpen,
  Sparkles,
  Layers,
  CreditCard,
} from 'lucide-react';

interface ExportCenterModalProps {
  book: Book;
  onClose: () => void;
  onOpenPrintPreview: () => void;
  onOpenCheckout?: (book: Book) => void;
  isPurchased?: boolean;
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  book,
  onClose,
  onOpenPrintPreview,
  onOpenCheckout,
  isPurchased = false,
}) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePDFExport = async () => {
    setIsGeneratingPDF(true);
    setErrorMsg(null);
    try {
      await generateBookPDF(book);
      setDownloadSuccess('Vector PDF generated & downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('PDF export failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleMDExport = () => {
    try {
      exportToMarkdown(book);
      setDownloadSuccess('Markdown (.md) file downloaded!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to export markdown');
    }
  };

  const handleTXTExport = () => {
    try {
      exportToPlainText(book);
      setDownloadSuccess('Plain Text (.txt) file downloaded!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to export plain text');
    }
  };

  const handleJSONExport = () => {
    try {
      exportToJSON(book);
      setDownloadSuccess('Full JSON backup downloaded!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to export JSON backup');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-stone-900">
                Export Center
              </span>
              <span className="text-stone-400 text-xs">·</span>
              <span className="text-xs text-stone-500 font-serif italic truncate max-w-xs">
                {book.title}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {book.currency || '₹'}{book.price ?? 99}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Direct vector PDF generation, paginated print preview, and document backups.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status banner */}
        {downloadSuccess && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* FEATURED: DIRECT FORMATTED PDF (jsPDF) */}
          <div className="rounded-xl border-2 border-stone-900 p-5 bg-stone-50/60 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-sans">
                    Vector Publisher Engine
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-[11px] text-stone-500 font-medium">Bypasses sandbox blocks</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                  Direct Formatted PDF (jsPDF)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-md">
                  Client-side vector PDF generation that bypasses iframe <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">window.print()</code> sandbox restrictions.
                </p>

                {/* Features list */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>Full-color cover in {theme.name.split('&')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>Running headers &amp; page numbers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>Table of Contents &amp; Persona Box</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>4 Formatted Chapters with Pills &amp; Quotes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0 sm:w-48">
                {book.price !== 0 && !isPurchased && onOpenCheckout && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCheckout(book);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-blue-200" />
                    <span>Pay with Razorpay ({book.currency || '₹'}{book.price ?? 99})</span>
                  </button>
                )}

                <button
                  onClick={handlePDFExport}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPrintPreview();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg border border-stone-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>Print Preview View</span>
                </button>
              </div>
            </div>
          </div>

          {/* OTHER EXPORTS SECTION */}
          <div>
            <div className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Other Formats &amp; Data Backups
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Markdown (.md) */}
              <div className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-white transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700 mb-2 group-hover:bg-amber-50 group-hover:text-amber-800 transition-colors">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold text-stone-900">Markdown (.md)</div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Frontmatter, formatted headings, blockquotes, and TOC links.
                  </p>
                </div>
                <button
                  onClick={handleMDExport}
                  className="w-full py-1.5 px-3 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3 h-3 text-stone-500" />
                  <span>Download .md</span>
                </button>
              </div>

              {/* 2. Plain Text (.txt) */}
              <div className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-white transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700 mb-2 group-hover:bg-amber-50 group-hover:text-amber-800 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold text-stone-900">Plain Text (.txt)</div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Clean ASCII publication format with divider rules and numbered sections.
                  </p>
                </div>
                <button
                  onClick={handleTXTExport}
                  className="w-full py-1.5 px-3 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3 h-3 text-stone-500" />
                  <span>Download .txt</span>
                </button>
              </div>

              {/* 3. JSON Data Backup */}
              <div className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-white transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700 mb-2 group-hover:bg-amber-50 group-hover:text-amber-800 transition-colors">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold text-stone-900">JSON Data Backup</div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Full lossless schema backup for importing and archiving.
                  </p>
                </div>
                <button
                  onClick={handleJSONExport}
                  className="w-full py-1.5 px-3 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3 h-3 text-stone-500" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between text-xs text-stone-500">
          <span>All files generated client-side inside your browser sandbox.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
