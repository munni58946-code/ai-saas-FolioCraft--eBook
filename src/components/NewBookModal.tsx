import React, { useState, useRef } from 'react';
import { Book, ThemePaletteId } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import { generateBookWithAI, generateCuratedBookTemplate } from '../utils/aiGenerator';
import { Sparkles, FileText, Upload, X, Check, Loader2 } from 'lucide-react';

interface NewBookModalProps {
  onBookCreated: (book: Book) => void;
  onClose: () => void;
}

export const NewBookModal: React.FC<NewBookModalProps> = ({
  onBookCreated,
  onClose,
}) => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Strategy & Systems');
  const [themeId, setThemeId] = useState<ThemePaletteId>('deep-indigo');
  const [price, setPrice] = useState<number>(499);
  const [currency, setCurrency] = useState<string>('₹');
  const [isFree, setIsFree] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (useAI: boolean) => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGenerationStep(useAI ? 'Synthesizing chapter architecture with Gemini...' : 'Assembling curated monograph...');

    const finalPrice = isFree ? 0 : Number(price) || 0;

    try {
      let book: Book;
      if (useAI) {
        book = await generateBookWithAI(topic, genre, themeId, finalPrice, currency);
      } else {
        book = generateCuratedBookTemplate(topic, genre, themeId, finalPrice, currency);
      }
      onBookCreated(book);
    } catch (err: any) {
      console.error(err);
      // Fallback to deterministic template
      const fallbackBook = generateCuratedBookTemplate(topic, genre, themeId, finalPrice, currency);
      onBookCreated(fallbackBook);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.title || !parsed.chapters || parsed.chapters.length < 4) {
          throw new Error('Invalid FolioCraft book schema: missing 4 chapters');
        }
        parsed.id = `book-imported-${Date.now()}`;
        onBookCreated(parsed);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Create New Monograph
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Draft a 4-chapter eBook with demographic briefs, quotes, and vector PDF formatting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {importError}
            </div>
          )}

          {/* Topic input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Monograph Subject or Working Title
            </label>
            <input
              type="text"
              placeholder="e.g. Decentralized Governance, Architectural Acoustics, Stoic Flow"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <span className="text-[11px] text-stone-400">Quick suggestions:</span>
              {[
                'The Geometry of Calm',
                'Asymmetric Capital',
                'Designing for 100 Years',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-[11px] text-stone-600 hover:text-stone-900 underline"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Genre & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Discipline / Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none bg-white"
              >
                <option value="Strategy & Leadership">Strategy &amp; Leadership</option>
                <option value="Philosophy & Mindset">Philosophy &amp; Mindset</option>
                <option value="Art & Cultural Archiving">Art &amp; Cultural Archiving</option>
                <option value="Architecture & Design">Architecture &amp; Design</option>
                <option value="Technology & Infrastructure">Technology &amp; Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Theme Palette
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value as ThemePaletteId)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-none bg-white"
              >
                {Object.values(THEME_PALETTES).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monograph Pricing Architecture */}
          <div className="p-3.5 bg-stone-50/80 border border-stone-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <span>Monograph Retail Price &amp; Currency</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-600 hover:text-stone-900 select-none">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 h-3.5 w-3.5"
                />
                <span className="font-medium">Free / Open Access Monograph</span>
              </label>
            </div>

            {!isFree ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-stone-500 mb-1">Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                  >
                    <option value="₹">₹ INR (Indian Rupee)</option>
                    <option value="$">$ USD (US Dollar)</option>
                    <option value="€">€ EUR (Euro)</option>
                    <option value="£">£ GBP (British Pound)</option>
                  </select>
                </div>
                <div>
                  <span className="block text-[11px] text-stone-500 mb-1">Price Amount</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step={currency === '₹' ? '1' : '0.01'}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder={currency === '₹' ? '499' : '19.99'}
                      className="w-full text-xs pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-1 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Marked as Open Access Monograph (Free to Read and Download)</span>
              </div>
            )}
          </div>

          {/* Generation progress */}
          {isGenerating && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
              <div className="text-xs text-stone-700 font-medium">
                {generationStep}
              </div>
            </div>
          )}

          {/* Import JSON button */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">Have an exported FolioCraft book?</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Import JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !topic.trim()}
              className="px-3.5 py-2 text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 rounded-lg border border-stone-300 transition-colors disabled:opacity-50"
            >
              Fast Template
            </button>

            <button
              onClick={() => handleGenerate(true)}
              disabled={isGenerating || !topic.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate Monograph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
