import React from 'react';
import { Book } from '../types/book';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  book: Book;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  book,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-stone-900">
              Delete Book from Library?
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-stone-400 hover:text-stone-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="font-serif font-bold text-stone-900 text-sm">
              {book.title}
            </div>
            <div className="text-xs text-stone-500 font-serif italic mt-0.5">
              by {book.author}
            </div>
            <div className="text-[11px] text-stone-400 mt-2 font-mono">
              {book.chapters.length} Chapters · {book.genre} · Edition: {book.edition}
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Are you sure you want to permanently remove this title, its 4 structured chapters, and persona briefs from your library?
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 rounded-md border border-stone-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};
