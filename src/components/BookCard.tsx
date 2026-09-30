import React from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import {
  BookOpen,
  Box,
  Download,
  Trash2,
  Edit3,
  Users,
  Layers,
  Sparkles,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

interface BookCardProps {
  book: Book;
  onOpenReader: (book: Book) => void;
  onOpen3DMockup: (book: Book) => void;
  onOpenExport: (book: Book) => void;
  onDeleteRequest: (book: Book) => void;
  onEditRequest: (book: Book) => void;
  onBuyRequest?: (book: Book) => void;
  isPurchased?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpenReader,
  onOpen3DMockup,
  onOpenExport,
  onDeleteRequest,
  onEditRequest,
  onBuyRequest,
  isPurchased = false,
}) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Cover Thumbnail & Details */}
      <div className="p-5 flex flex-col sm:flex-row gap-5">
        {/* Book Cover Visual Miniature */}
        <div
          onClick={() => onOpen3DMockup(book)}
          className="w-full sm:w-36 h-48 sm:h-52 rounded-md shadow-md p-3 flex flex-col justify-between shrink-0 relative overflow-hidden cursor-pointer transform group-hover:-translate-y-0.5 transition-transform"
          style={{ backgroundColor: theme.primary }}
          title="Click to view 3D Mockup"
        >
          {/* Subtle gradient sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />

          {/* Border Frame */}
          <div
            className="absolute inset-1.5 border pointer-events-none opacity-80"
            style={{ borderColor: theme.accent }}
          />

          {/* Spine crease shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          {/* Price Seal on Cover */}
          <div className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[9.5px] font-sans font-semibold px-1.5 py-0.5 rounded border border-white/20 shadow-xs">
            {book.currency || '₹'}{book.price ?? 99}
          </div>

          {/* Mini Header */}
          <div className="relative z-10 text-center">
            <span
              className="text-[7.5px] uppercase tracking-widest font-sans font-bold"
              style={{ color: theme.accent }}
            >
              FolioCraft
            </span>
          </div>

          {/* Mini Title */}
          <div className="relative z-10 text-center px-1 my-auto">
            <h4 className="font-serif font-bold text-white text-xs sm:text-[13px] leading-tight line-clamp-3">
              {book.title}
            </h4>
            <div
              className="w-4 h-0.5 mx-auto mt-1.5"
              style={{ backgroundColor: theme.accent }}
            />
          </div>

          {/* Mini Author */}
          <div className="relative z-10 text-center">
            <span className="text-[8.5px] text-stone-200 font-serif italic line-clamp-1">
              {book.author}
            </span>
          </div>

          {/* 3D Hint Badge */}
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white rounded px-1.5 py-0.5 text-[8.5px] flex items-center gap-1">
            <Box className="w-2.5 h-2.5" />
            <span>3D</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Genre & Edition info & Retail Price */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>{book.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{book.publicationYear}</span>
              <span aria-hidden="true">·</span>
              <span>{book.edition}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80 text-[11px] shadow-2xs">
                Retail: {book.currency || '₹'}{book.price ?? 99}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug tracking-tight">
              {book.title}
            </h3>
            <p className="font-serif italic text-stone-600 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
              {book.subtitle}
            </p>

            {/* Author */}
            <div className="text-xs text-stone-700 mt-2 font-medium">
              By <span className="font-semibold text-stone-900">{book.author}</span>
            </div>

            {/* Chapters snippet */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
              <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>4 Formatted Chapters:</span>
              <span className="text-stone-700 truncate font-serif italic text-[11px]">
                {book.chapters.map((c) => c.title).join(' · ')}
              </span>
            </div>

            {/* Demographic Persona Summary */}
            <div className="mt-2 flex items-start gap-1.5 text-xs text-stone-500">
              <Users className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                <strong className="text-stone-700 font-medium">Target:</strong> {book.demographic.targetAudience} ({book.demographic.ageRange})
              </span>
            </div>
          </div>

          {/* Quick Edit shortcut */}
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={() => onEditRequest(book)}
              className="text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Details &amp; Chapters</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS PER CARD:
          “Open in Reader”, “3D Mockup”, “Export”, and “Delete” (with confirmation modal)
      */}
      <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Razorpay Direct Buy / Unlocked status */}
          {isPurchased ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100/90 rounded-md border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unlocked</span>
            </span>
          ) : onBuyRequest ? (
            <button
              onClick={() => onBuyRequest(book)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors"
              title="Pay with Razorpay (UPI, GPay, Cards)"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-200" />
              <span>Buy ({book.currency || '₹'}{book.price ?? 99})</span>
            </button>
          ) : null}

          {/* 1. Open in Reader */}
          <button
            onClick={() => onOpenReader(book)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-md shadow-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open in Reader</span>
          </button>

          {/* 2. 3D Mockup */}
          <button
            onClick={() => onOpen3DMockup(book)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 rounded-md border border-stone-300 transition-colors"
          >
            <Box className="w-3.5 h-3.5 text-amber-600" />
            <span>3D Mockup</span>
          </button>

          {/* 3. Export */}
          <button
            onClick={() => onOpenExport(book)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 rounded-md border border-stone-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export</span>
          </button>
        </div>

        {/* 4. Delete (with confirmation modal) */}
        <button
          onClick={() => onDeleteRequest(book)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          title="Delete book"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};
