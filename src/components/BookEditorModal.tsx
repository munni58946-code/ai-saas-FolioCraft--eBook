import React, { useState } from 'react';
import { Book, ThemePaletteId } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import { X, Check, Save, Layers, UserCheck, BookOpen } from 'lucide-react';

interface BookEditorModalProps {
  book: Book;
  onSave: (updatedBook: Book) => void;
  onClose: () => void;
}

export const BookEditorModal: React.FC<BookEditorModalProps> = ({
  book,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'persona' | 'chapters'>('metadata');
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);

  // Editable form state
  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle);
  const [author, setAuthor] = useState(book.author);
  const [edition, setEdition] = useState(book.edition);
  const [publicationYear, setPublicationYear] = useState(book.publicationYear);
  const [genre, setGenre] = useState(book.genre);
  const [themeId, setThemeId] = useState<ThemePaletteId>(book.themeId);
  const [price, setPrice] = useState<number>(book.price ?? 99);
  const [currency, setCurrency] = useState<string>(book.currency || '₹');

  // Demographic
  const [demographic, setDemographic] = useState({ ...book.demographic });

  // 4 Chapters
  const [chapters, setChapters] = useState([...book.chapters] as [any, any, any, any]);

  const handleSave = () => {
    const updated: Book = {
      ...book,
      title,
      subtitle,
      author,
      edition,
      publicationYear,
      genre,
      themeId,
      demographic,
      chapters,
      price: Number(price) > 0 ? Number(price) : 99,
      currency,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
  };

  const updateChapterField = (field: string, val: any) => {
    const newChapters = [...chapters] as [any, any, any, any];
    newChapters[selectedChapterIdx] = {
      ...newChapters[selectedChapterIdx],
      [field]: val,
    };
    setChapters(newChapters);
  };

  const currentCh = chapters[selectedChapterIdx];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Book Studio Editor
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Refine publication metadata, demographic brief, and all 4 formatted chapters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Interactive Filter Controls per guidelines) */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200 bg-stone-50/30">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'metadata'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Metadata &amp; Theme
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'persona'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Demographic Persona
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'chapters'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            4 Formatted Chapters
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: METADATA & THEME */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Author(s)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Genre / Discipline
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Edition Series
                  </label>
                  <input
                    type="text"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Publication Year
                  </label>
                  <input
                    type="text"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Retail Pricing Configuration */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-900">
                    Monograph Retail Price &amp; Currency
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">Standard ₹99</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-stone-500 mb-1">Currency Symbol</span>
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
                    <span className="block text-[11px] text-stone-500 mb-1">Retail Price</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="1"
                        step={currency === '₹' ? '1' : '0.01'}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full text-xs pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Palette Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Theme Palette (Governs Cover, Print Preview, and Vector PDF)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(THEME_PALETTES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                        themeId === t.id
                          ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-md shrink-0 border border-black/10 flex items-center justify-center text-white"
                        style={{ backgroundColor: t.primary }}
                      >
                        {themeId === t.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: t.accent }}
                          />
                          <span>Accent</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEMOGRAPHIC PERSONA */}
          {activeTab === 'persona' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={demographic.targetAudience}
                    onChange={(e) =>
                      setDemographic({ ...demographic, targetAudience: e.target.value })
                    }
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Age Demographic Range
                  </label>
                  <input
                    type="text"
                    value={demographic.ageRange}
                    onChange={(e) =>
                      setDemographic({ ...demographic, ageRange: e.target.value })
                    }
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Core Friction / Pain Point
                </label>
                <textarea
                  rows={2}
                  value={demographic.corePainPoint}
                  onChange={(e) =>
                    setDemographic({ ...demographic, corePainPoint: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Desired Transformation
                </label>
                <textarea
                  rows={2}
                  value={demographic.desiredTransformation}
                  onChange={(e) =>
                    setDemographic({ ...demographic, desiredTransformation: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recommended Reading Context
                </label>
                <input
                  type="text"
                  value={demographic.readingContext}
                  onChange={(e) =>
                    setDemographic({ ...demographic, readingContext: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 4 FORMATTED CHAPTERS */}
          {activeTab === 'chapters' && (
            <div className="space-y-4">
              {/* Chapter selector tabs */}
              <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-lg">
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapterIdx(idx)}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
                      selectedChapterIdx === idx
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    CH 0{ch.number}
                  </button>
                ))}
              </div>

              {/* Selected Chapter Details */}
              <div className="p-4 border border-stone-200 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      value={currentCh.title}
                      onChange={(e) => updateChapterField('title', e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category Pill
                    </label>
                    <input
                      type="text"
                      value={currentCh.pill}
                      onChange={(e) => updateChapterField('pill', e.target.value.toUpperCase())}
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Section Subheading
                  </label>
                  <input
                    type="text"
                    value={currentCh.subheading}
                    onChange={(e) => updateChapterField('subheading', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Chapter Thesis Summary
                  </label>
                  <textarea
                    rows={2}
                    value={currentCh.summary}
                    onChange={(e) => updateChapterField('summary', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Highlight Quote Text
                    </label>
                    <input
                      type="text"
                      value={currentCh.quote.text}
                      onChange={(e) =>
                        updateChapterField('quote', {
                          ...currentCh.quote,
                          text: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none italic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Quote Author / Source
                    </label>
                    <input
                      type="text"
                      value={currentCh.quote.author}
                      onChange={(e) =>
                        updateChapterField('quote', {
                          ...currentCh.quote,
                          author: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Key takeaways bullets */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Key Actionable Takeaways (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={currentCh.bulletPoints.join('\n')}
                    onChange={(e) =>
                      updateChapterField(
                        'bulletPoints',
                        e.target.value
                          .split('\n')
                          .filter((line) => line.trim().length > 0)
                      )
                    }
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
