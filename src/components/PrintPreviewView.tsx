import React, { useState } from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import { generateBookPDF } from '../utils/pdfGenerator';
import { Download, Printer, ArrowLeft, Check, AlertCircle, Layers } from 'lucide-react';

interface PrintPreviewViewProps {
  book: Book;
  onExit: () => void;
}

export const PrintPreviewView: React.FC<PrintPreviewViewProps> = ({ book, onExit }) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printWarning, setPrintWarning] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPrintWarning(null);
    try {
      await generateBookPDF(book);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setPrintWarning('Failed to generate PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintDialog = () => {
    try {
      // In embedded iframe sandboxes, window.print() might be blocked or throw
      window.print();
    } catch (e: any) {
      console.warn('Iframe print blocked:', e);
      setPrintWarning(
        'Direct window.print() is restricted by your iframe sandbox. Use the "Download PDF File" button to get the complete vector PDF document instantly!'
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-900 flex flex-col items-center">
      {/* FLOATING TOP BAR */}
      <header className="sticky top-0 z-40 w-full bg-stone-950/90 border-b border-stone-800 backdrop-blur-md px-6 py-3.5 flex items-center justify-between text-stone-100 shadow-lg">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Preview</span>
          </button>
          <span className="hidden sm:inline text-stone-600 text-xs">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-stone-200">Print Preview</span>
            <span className="text-stone-500 text-xs">·</span>
            <span className="text-xs text-stone-400 font-serif italic truncate max-w-sm">
              {book.title} (A4 Paginated)
            </span>
          </div>
        </div>

        {/* Center / Right: 3 Required Actions */}
        <div className="flex items-center gap-2.5">
          {/* 1. Download PDF File */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF File'}</span>
              </>
            )}
          </button>

          {/* 2. Print Dialog */}
          <button
            onClick={handlePrintDialog}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors border border-stone-700"
          >
            <Printer className="w-3.5 h-3.5 text-stone-300" />
            <span>Print Dialog</span>
          </button>

          {/* 3. Exit */}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Notice Banner if iframe print blocked or info */}
      {printWarning && (
        <div className="w-full max-w-4xl mx-auto mt-4 px-4">
          <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-200 text-xs rounded-lg flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{printWarning}</span>
            </div>
            <button
              onClick={() => setPrintWarning(null)}
              className="text-amber-400 hover:text-amber-200 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* PAGINATED A4 BOOK DOCUMENT CONTAINER */}
      <div className="w-full max-w-4xl py-10 px-4 flex flex-col items-center gap-12">
        {/* ------------------------------------------------------------- */}
        {/* PAGE 1: FULL COLOR COVER PAGE */}
        {/* ------------------------------------------------------------- */}
        <div
          className="w-full max-w-[210mm] aspect-[210/297] rounded-sm shadow-2xl relative p-12 flex flex-col justify-between overflow-hidden select-none border border-stone-700"
          style={{ backgroundColor: theme.primary }}
        >
          {/* Outer Border */}
          <div
            className="absolute inset-4 border pointer-events-none"
            style={{ borderColor: theme.accent, borderWidth: '2px' }}
          >
            <div className="absolute inset-1 border border-white/20 pointer-events-none" />
          </div>

          {/* Top Label */}
          <div className="relative z-10 text-center pt-6">
            <div
              className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase"
              style={{ color: theme.accent }}
            >
              F O L I O C R A F T · A R C H I V A L · E D I T I O N
            </div>
            <div className="text-[10px] text-stone-300 font-sans tracking-widest uppercase mt-1">
              {book.genre} · {book.publicationYear}
            </div>
          </div>

          {/* Center Titles */}
          <div className="relative z-10 text-center px-6 my-auto">
            <div
              className="w-12 h-1 mx-auto mb-6"
              style={{ backgroundColor: theme.accent }}
            />
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="font-serif italic text-stone-200 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              {book.subtitle}
            </p>
          </div>

          {/* Bottom Author & Credits */}
          <div className="relative z-10 text-center pb-8 border-t border-white/10 pt-6">
            <div
              className="text-[10px] font-sans font-semibold uppercase tracking-widest"
              style={{ color: theme.accent }}
            >
              Authored by
            </div>
            <div className="font-serif font-bold text-lg sm:text-xl text-white mt-1">
              {book.author}
            </div>
            <div className="text-[11px] text-stone-300 font-mono mt-1">
              {book.edition} · All Rights Reserved
            </div>
            <div className="mt-2 inline-block px-3 py-1 rounded text-[11px] font-sans font-bold tracking-wider uppercase border border-white/25 bg-black/40 text-amber-300">
              {book.price === 0 ? 'Open Access Monograph (Free)' : `Monograph Retail: ${book.currency || '₹'}${book.price ?? 499}`}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PAGE 2: TABLE OF CONTENTS & DEMOGRAPHIC PERSONA SUMMARY BOX */}
        {/* ------------------------------------------------------------- */}
        <div
          className="w-full max-w-[210mm] min-h-[297mm] rounded-sm shadow-2xl p-12 flex flex-col justify-between select-text"
          style={{ backgroundColor: theme.paper, color: theme.textPrimary }}
        >
          {/* Running Header */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-stone-500 font-sans pb-2 border-b border-stone-300">
              <span className="uppercase tracking-wider">{book.title}</span>
              <span className="uppercase tracking-wider">Preliminary Brief & Contents</span>
            </div>

            {/* Title */}
            <div className="mt-8 mb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                Table of Contents
              </h2>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mt-1 font-sans">
                Structural Chapter Breakdown & Core Thesis
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-3 mb-8">
              {book.chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-baseline justify-between p-2.5 rounded border border-stone-200/80 bg-white/70"
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: theme.accent }}
                    >
                      CH 0{ch.number}
                    </span>
                    <div>
                      <div className="font-serif font-bold text-stone-900 text-sm">
                        {ch.title}
                      </div>
                      <div className="text-[11px] font-serif italic text-stone-500">
                        {ch.subheading}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-sans">
                    {ch.pill}
                  </span>
                </div>
              ))}
            </div>

            {/* Demographic Persona Summary Box */}
            <div
              className="rounded-lg overflow-hidden border shadow-sm"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              }}
            >
              {/* Header Ribbon */}
              <div
                className="px-4 py-2 text-white font-sans text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: theme.primary }}
              >
                Target Demographic Persona & Strategic Brief
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                <div>
                  <div
                    className="text-[10px] font-sans font-bold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    Target Audience & Age Range
                  </div>
                  <div className="font-serif text-stone-900 mt-0.5">
                    {book.demographic.targetAudience} · Typical Age: {book.demographic.ageRange}
                  </div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-sans font-bold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    Core Friction & Pain Point
                  </div>
                  <div className="font-serif text-stone-800 mt-0.5 leading-relaxed">
                    {book.demographic.corePainPoint}
                  </div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-sans font-bold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    Desired Transformation & Mastery
                  </div>
                  <div className="font-serif text-stone-800 mt-0.5 leading-relaxed">
                    {book.demographic.desiredTransformation}
                  </div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-sans font-bold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    Optimal Reading Context
                  </div>
                  <div className="font-serif text-stone-700 italic mt-0.5">
                    {book.demographic.readingContext}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 font-sans pt-4 border-t border-stone-300 mt-10">
            <span>{book.edition} · {book.author}</span>
            <span>Page 2</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PAGES 3 to 6: 4 FORMATTED CHAPTERS */}
        {/* ------------------------------------------------------------- */}
        {book.chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="w-full max-w-[210mm] min-h-[297mm] rounded-sm shadow-2xl p-12 flex flex-col justify-between select-text"
            style={{ backgroundColor: theme.paper, color: theme.textPrimary }}
          >
            {/* Running Header */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-stone-500 font-sans pb-2 border-b border-stone-300">
                <span className="uppercase tracking-wider">{book.title}</span>
                <span className="uppercase tracking-wider">
                  Chapter 0{chapter.number} · {chapter.pill}
                </span>
              </div>

              {/* Chapter Pill Badge */}
              <div className="mt-8 mb-2">
                <span
                  className="inline-block px-2.5 py-1 text-[10px] font-sans font-bold tracking-widest uppercase rounded border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.border,
                    color: theme.accent,
                  }}
                >
                  Chapter 0{chapter.number} · {chapter.pill}
                </span>
              </div>

              {/* Title & Subheading */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-2">
                {chapter.title}
              </h2>
              <div className="font-serif italic text-sm text-stone-600 mt-1">
                {chapter.subheading}
              </div>

              {/* Chapter Summary Box */}
              <div
                className="my-5 p-4 rounded-md border-l-4 shadow-xs"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.accent,
                }}
              >
                <div
                  className="text-[10px] font-sans font-bold uppercase tracking-wider mb-1"
                  style={{ color: theme.accent }}
                >
                  Chapter Thesis Summary
                </div>
                <p className="font-serif text-xs text-stone-800 leading-relaxed">
                  {chapter.summary}
                </p>
              </div>

              {/* Body Prose Paragraphs */}
              <div className="space-y-3.5 my-6 text-sm font-serif leading-relaxed text-stone-800">
                {chapter.content.map((para, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:leading-none'
                        : ''
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Pull Quote */}
              <div
                className="my-6 pl-4 border-l-2 py-1.5"
                style={{ borderColor: theme.accent }}
              >
                <blockquote className="font-serif italic text-stone-800 text-sm sm:text-base leading-snug">
                  “{chapter.quote.text}”
                </blockquote>
                <div className="text-[11px] font-sans text-stone-500 mt-1">
                  — {chapter.quote.author}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="mt-6 pt-4 border-t border-stone-200">
                <div
                  className="text-[11px] font-sans font-bold uppercase tracking-wider mb-2"
                  style={{ color: theme.accent }}
                >
                  Key Strategic Invariants & Takeaways
                </div>
                <ul className="space-y-1.5 text-xs font-serif text-stone-700">
                  {chapter.bulletPoints.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Running Footer */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-sans pt-4 border-t border-stone-300 mt-8">
              <span>{book.edition} · {book.author}</span>
              <span>Page {chapter.number + 2}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
