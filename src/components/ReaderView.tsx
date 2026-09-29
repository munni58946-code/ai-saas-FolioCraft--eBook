import React, { useState } from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  Download,
  Box,
  Printer,
  Sparkles,
  Info,
  Check,
  X,
  Menu,
} from 'lucide-react';

interface ReaderViewProps {
  book: Book;
  onExit: () => void;
  onOpen3DMockup: () => void;
  onOpenExport: () => void;
  onOpenPrintPreview: () => void;
}

type PaperTheme = 'alabaster' | 'linen' | 'parchment' | 'midnight';
type FontOption = 'serif' | 'sans' | 'mono';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  onExit,
  onOpen3DMockup,
  onOpenExport,
  onOpenPrintPreview,
}) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showPersonaBrief, setShowPersonaBrief] = useState(false);

  // Reading Preferences
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('alabaster');
  const [fontOption, setFontOption] = useState<FontOption>('serif');
  const [fontSize, setFontSize] = useState<FontSize>('md');

  const currentChapter = book.chapters[currentChapterIndex] || book.chapters[0];

  // Paper Theme styling
  const paperStyles: Record<
    PaperTheme,
    { bg: string; text: string; muted: string; border: string; boxBg: string }
  > = {
    alabaster: {
      bg: '#fbf9f5',
      text: '#1c1917',
      muted: '#78716c',
      border: '#e7e5e4',
      boxBg: '#f5f3ee',
    },
    linen: {
      bg: '#ffffff',
      text: '#09090b',
      muted: '#71717a',
      border: '#e4e4e7',
      boxBg: '#f4f4f5',
    },
    parchment: {
      bg: '#fbf6ea',
      text: '#292524',
      muted: '#854d0e',
      border: '#fde047',
      boxBg: '#fefce8',
    },
    midnight: {
      bg: '#18181b',
      text: '#f4f4f5',
      muted: '#a1a1aa',
      border: '#27272a',
      boxBg: '#27272a',
    },
  };

  const currentPaper = paperStyles[paperTheme];

  // Font Family styling
  const fontClass =
    fontOption === 'serif'
      ? 'font-serif'
      : fontOption === 'sans'
      ? 'font-sans'
      : 'font-mono';

  // Font Size styling
  const textSizeClass =
    fontSize === 'sm'
      ? 'text-sm leading-relaxed'
      : fontSize === 'md'
      ? 'text-base leading-relaxed'
      : fontSize === 'lg'
      ? 'text-lg leading-loose'
      : 'text-xl leading-loose';

  const progressPercent = Math.round(
    ((currentChapterIndex + 1) / book.chapters.length) * 100
  );

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: currentPaper.bg,
        color: currentPaper.text,
      }}
    >
      {/* READER TOP BAR */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-md transition-colors"
        style={{
          borderColor: currentPaper.border,
          backgroundColor: `${currentPaper.bg}EE`,
        }}
      >
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: currentPaper.muted }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <span style={{ color: currentPaper.border }}>|</span>

          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Contents</span>
          </button>

          <span className="hidden md:inline text-xs font-serif italic truncate max-w-sm" style={{ color: currentPaper.muted }}>
            {book.title}
          </span>
        </div>

        {/* Center / Right: Tools */}
        <div className="flex items-center gap-2">
          {/* Persona Brief button */}
          <button
            onClick={() => setShowPersonaBrief(!showPersonaBrief)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Audience & Persona Brief"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Persona Brief</span>
          </button>

          {/* 3D Mockup */}
          <button
            onClick={onOpen3DMockup}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Mockup</span>
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Appearance Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* READING PROGRESS BAR */}
      <div className="w-full h-1 bg-stone-200/50 dark:bg-stone-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: theme.accent,
          }}
        />
      </div>

      {/* SETTINGS DRAWER / POPOVER */}
      {showSettings && (
        <div
          className="w-full max-w-xl mx-auto mt-2 p-4 rounded-xl border shadow-xl transition-all"
          style={{
            backgroundColor: currentPaper.bg,
            borderColor: currentPaper.border,
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">
              Reading Appearance
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
            {/* Paper Theme */}
            <div>
              <div className="font-semibold mb-1.5" style={{ color: currentPaper.muted }}>
                Paper Atmosphere
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    ['alabaster', 'Alabaster'],
                    ['linen', 'Crisp Linen'],
                    ['parchment', 'Parchment'],
                    ['midnight', 'Midnight'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPaperTheme(key)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                      paperTheme === key
                        ? 'border-amber-600 font-bold bg-amber-500/10'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="font-semibold mb-1.5" style={{ color: currentPaper.muted }}>
                Typeface
              </div>
              <div className="flex flex-col gap-1">
                {(
                  [
                    ['serif', 'Editorial Serif'],
                    ['sans', 'Modern Sans'],
                    ['mono', 'Monospace'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFontOption(key)}
                    className={`px-2 py-1 rounded text-left text-[11px] font-medium transition-colors border ${
                      fontOption === key
                        ? 'border-amber-600 font-bold bg-amber-500/10'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="font-semibold mb-1.5" style={{ color: currentPaper.muted }}>
                Font Size
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-2 py-1 rounded text-center text-[11px] font-medium uppercase border ${
                      fontSize === sz
                        ? 'border-amber-600 font-bold bg-amber-500/10'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE OF CONTENTS MODAL / DRAWER */}
      {showToc && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-2xl border"
            style={{
              backgroundColor: currentPaper.bg,
              borderColor: currentPaper.border,
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-serif font-bold text-lg">Table of Contents</h3>
                <p className="text-xs" style={{ color: currentPaper.muted }}>
                  {book.title}
                </p>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {book.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setShowToc(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    currentChapterIndex === idx
                      ? 'border-amber-600 bg-amber-500/10 shadow-xs'
                      : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                    <span style={{ color: theme.accent }}>
                      Chapter 0{ch.number}
                    </span>
                    <span style={{ color: currentPaper.muted }}>
                      {ch.pill}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-sm">
                    {ch.title}
                  </div>
                  <div className="text-xs font-serif italic truncate mt-0.5" style={{ color: currentPaper.muted }}>
                    {ch.subheading}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEMOGRAPHIC PERSONA BRIEF DRAWER */}
      {showPersonaBrief && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-xl p-6 shadow-2xl border"
            style={{
              backgroundColor: currentPaper.bg,
              borderColor: currentPaper.border,
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider">
                  Target Demographic Persona Brief
                </h3>
              </div>
              <button
                onClick={() => setShowPersonaBrief(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs font-serif leading-relaxed">
              <div>
                <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                  Target Audience &amp; Age Profile
                </span>
                <p className="font-medium">
                  {book.demographic.targetAudience} (Age: {book.demographic.ageRange})
                </p>
              </div>

              <div>
                <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                  Core Pain Point &amp; Cognitive Friction
                </span>
                <p>{book.demographic.corePainPoint}</p>
              </div>

              <div>
                <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                  Desired Transformation
                </span>
                <p>{book.demographic.desiredTransformation}</p>
              </div>

              <div>
                <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                  Recommended Reading Context
                </span>
                <p className="italic">{book.demographic.readingContext}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setShowPersonaBrief(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN READING CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-12 py-12 flex flex-col justify-between">
        <article className="space-y-8">
          {/* Chapter Metadata & Pill */}
          <div className="space-y-3 border-b pb-6" style={{ borderColor: currentPaper.border }}>
            <div className="flex items-center justify-between text-xs">
              <span
                className="px-2.5 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                Chapter 0{currentChapter.number} · {currentChapter.pill}
              </span>
              <span className="text-xs font-mono" style={{ color: currentPaper.muted }}>
                Part {currentChapter.number} of {book.chapters.length}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {currentChapter.title}
            </h1>

            <div
              className="text-base font-serif italic"
              style={{ color: currentPaper.muted }}
            >
              {currentChapter.subheading}
            </div>
          </div>

          {/* Chapter Thesis Summary Box */}
          <div
            className="p-5 rounded-lg border-l-4 shadow-xs"
            style={{
              backgroundColor: currentPaper.boxBg,
              borderColor: theme.accent,
            }}
          >
            <div
              className="text-[10px] font-sans font-bold uppercase tracking-wider mb-1"
              style={{ color: theme.accent }}
            >
              Chapter Thesis Summary
            </div>
            <p className="font-serif text-sm leading-relaxed">
              {currentChapter.summary}
            </p>
          </div>

          {/* Main Body Prose with Drop Cap */}
          <div className={`${fontClass} ${textSizeClass} space-y-5 select-text`}>
            {currentChapter.content.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className={
                  pIdx === 0
                    ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none'
                    : ''
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Pull Quote */}
          <div
            className="my-8 pl-5 border-l-2 py-2"
            style={{ borderColor: theme.accent }}
          >
            <blockquote className="font-serif italic text-lg sm:text-xl leading-snug">
              “{currentChapter.quote.text}”
            </blockquote>
            <div
              className="text-xs font-sans mt-2"
              style={{ color: currentPaper.muted }}
            >
              — {currentChapter.quote.author}
            </div>
          </div>

          {/* Key Strategic Invariants & Takeaways */}
          <div
            className="mt-10 p-5 rounded-lg border"
            style={{
              backgroundColor: currentPaper.boxBg,
              borderColor: currentPaper.border,
            }}
          >
            <div
              className="text-xs font-sans font-bold uppercase tracking-wider mb-3"
              style={{ color: theme.accent }}
            >
              Key Strategic Takeaways
            </div>
            <ul className="space-y-2 text-sm font-serif">
              {currentChapter.bulletPoints.map((point, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* BOTTOM PAGINATION CONTROLS */}
        <div
          className="mt-14 pt-6 border-t flex items-center justify-between"
          style={{ borderColor: currentPaper.border }}
        >
          <button
            onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentChapterIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition-colors disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>

          <span
            className="text-xs font-mono font-medium"
            style={{ color: currentPaper.muted }}
          >
            {currentChapterIndex + 1} / {book.chapters.length}
          </span>

          <button
            onClick={() =>
              setCurrentChapterIndex((prev) =>
                Math.min(book.chapters.length - 1, prev + 1)
              )
            }
            disabled={currentChapterIndex === book.chapters.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition-colors disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
