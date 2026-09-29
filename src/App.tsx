import React, { useState, useEffect } from 'react';
import { Book } from './types/book';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import { BookCard } from './components/BookCard';
import { ReaderView } from './components/ReaderView';
import { BookMockup3D } from './components/BookMockup3D';
import { ExportCenterModal } from './components/ExportCenterModal';
import { PrintPreviewView } from './components/PrintPreviewView';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { BookEditorModal } from './components/BookEditorModal';
import { NewBookModal } from './components/NewBookModal';
import { AuthScreen } from './components/AuthScreen';
import { AdSenseBlock } from './components/AdSenseBlock';
import { useAuth } from './context/AuthContext';
import {
  subscribeUserBooks,
  saveUserBook,
  deleteUserBook,
} from './services/bookService';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Box,
  Layers,
  Sparkles,
  FileText,
  RotateCcw,
  LogOut,
  User as UserIcon,
  Loader2,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  // Books list state managed via Firestore for the authenticated user
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);

  // Subscribe to user's private Firestore books collection once signed in
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setBooksLoading(false);
      return;
    }

    setBooksLoading(true);
    const unsubscribe = subscribeUserBooks(
      user.uid,
      (updatedBooks) => {
        setBooks(updatedBooks);
        setBooksLoading(false);
      },
      (error) => {
        console.error('Failed to subscribe to user books:', error);
        setBooksLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Views & Modals state
  const [activeView, setActiveView] = useState<'library' | 'reader' | 'preview'>('library');
  const [selectedBookForReader, setSelectedBookForReader] = useState<Book | null>(null);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<Book | null>(null);

  // Active Modals
  const [mockupBook, setMockupBook] = useState<Book | null>(null);
  const [exportBook, setExportBook] = useState<Book | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Quick Action Handlers
  const handleOpenReader = (book: Book) => {
    setSelectedBookForReader(book);
    setActiveView('reader');
  };

  const handleOpen3DMockup = (book: Book) => {
    setMockupBook(book);
  };

  const handleOpenExport = (book: Book) => {
    setExportBook(book);
  };

  const handleDeleteRequest = (book: Book) => {
    setDeleteCandidate(book);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate || !user) return;
    try {
      await deleteUserBook(user.uid, deleteCandidate.id);
    } catch (err) {
      console.error('Failed to delete book in firestore:', err);
    }
    setDeleteCandidate(null);
  };

  const handleEditRequest = (book: Book) => {
    setEditBook(book);
  };

  const handleSaveBook = async (updatedBook: Book) => {
    if (!user) return;
    try {
      await saveUserBook(user.uid, updatedBook);
      if (selectedBookForReader?.id === updatedBook.id) {
        setSelectedBookForReader(updatedBook);
      }
    } catch (err) {
      console.error('Failed to save book in firestore:', err);
    }
    setEditBook(null);
  };

  const handleBookCreated = async (newBook: Book) => {
    if (!user) return;
    try {
      await saveUserBook(user.uid, newBook);
    } catch (err) {
      console.error('Failed to create book in firestore:', err);
    }
    setShowNewModal(false);
  };

  const handleOpenPrintPreview = (book: Book) => {
    setSelectedBookForPreview(book);
    setActiveView('preview');
  };

  const handleResetToSamples = async () => {
    if (!user) return;
    for (const sample of SAMPLE_BOOKS) {
      await saveUserBook(user.uid, sample);
    }
  };

  // -------------------------------------------------------------
  // AUTH GUARD:
  // Do not allow user to access any functionality until signed in!
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center text-stone-700">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mb-3" />
        <span className="text-xs font-serif italic text-stone-500 tracking-wider">
          Initializing FolioCraft Security Context...
        </span>
      </div>
    );
  }

  if (!user) {
    // Strict authentication gate: Render ONLY the AuthScreen until authenticated
    return <AuthScreen />;
  }

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === 'all' ||
      b.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  // -------------------------------------------------------------
  // RENDER PRINT PREVIEW VIEW
  // -------------------------------------------------------------
  if (activeView === 'preview' && selectedBookForPreview) {
    return (
      <PrintPreviewView
        book={selectedBookForPreview}
        onExit={() => setActiveView('library')}
      />
    );
  }

  // -------------------------------------------------------------
  // RENDER READER VIEW
  // -------------------------------------------------------------
  if (activeView === 'reader' && selectedBookForReader) {
    return (
      <>
        <ReaderView
          book={selectedBookForReader}
          onExit={() => setActiveView('library')}
          onOpen3DMockup={() => setMockupBook(selectedBookForReader)}
          onOpenExport={() => setExportBook(selectedBookForReader)}
          onOpenPrintPreview={() => handleOpenPrintPreview(selectedBookForReader)}
        />

        {/* 3D Mockup Modal over Reader if requested */}
        {mockupBook && (
          <BookMockup3D
            book={mockupBook}
            onClose={() => setMockupBook(null)}
            onOpenExport={() => {
              setExportBook(mockupBook);
              setMockupBook(null);
            }}
          />
        )}

        {/* Export Center Modal over Reader if requested */}
        {exportBook && (
          <ExportCenterModal
            book={exportBook}
            onClose={() => setExportBook(null)}
            onOpenPrintPreview={() => {
              handleOpenPrintPreview(exportBook);
              setExportBook(null);
            }}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN LIBRARY VIEW (ONLY FOR SIGNED IN USERS)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-stone-800 selection:text-stone-100">
      {/* TOP BAR CONTRACT:
          Zone 1: Single text element wordmark
          Zone 2: 4-6 clean text navigation links / categories
          Zone 3: 1-2 primary actions (Plus Monograph, User Account & Sign Out)
      */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSelectedGenre('all');
            setSearchQuery('');
          }}
          className="text-xl font-bold tracking-tight text-stone-900 font-serif"
        >
          FolioCraft
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`hover:text-stone-900 transition-colors ${
              selectedGenre === 'all' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => setSelectedGenre('Strategy')}
            className={`hover:text-stone-900 transition-colors ${
              selectedGenre === 'Strategy' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            Strategy
          </button>
          <button
            onClick={() => setSelectedGenre('Philosophy')}
            className={`hover:text-stone-900 transition-colors ${
              selectedGenre === 'Philosophy' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            Philosophy
          </button>
          <button
            onClick={() => setSelectedGenre('Art')}
            className={`hover:text-stone-900 transition-colors ${
              selectedGenre === 'Art' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            Art &amp; Archiving
          </button>
        </nav>

        {/* Zone 3: Primary Actions (New Monograph + User Profile / Sign Out) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Monograph</span>
          </button>

          {/* User Profile & Sign Out Control */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-300">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-stone-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold font-serif">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <span className="hidden lg:inline text-xs text-stone-700 font-medium truncate max-w-[140px]">
              {user.displayName || user.email?.split('@')[0]}
            </span>

            <button
              onClick={() => signOut()}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH CURATORIAL RIGOR */}
      <section className="px-6 lg:px-12 pt-10 pb-8 border-b border-stone-200/60 bg-gradient-to-b from-[#faf8f5] to-[#f4f0e8]/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
              Archival Publishing Studio &amp; Vector PDF Engine
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Curated monographs, formatted chapters &amp; client-side vector printing.
            </h1>
            <p className="font-serif italic text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
              Welcome back, <strong className="text-stone-900 font-medium not-italic">{user.displayName || user.email}</strong>. Manage your private cloud monographs, reader settings, 3D mockups, and vector A4 PDF exports.
            </p>
          </div>

          {/* Quick Metrics / Status with Tabular Figures */}
          <div className="flex items-center gap-6 text-xs text-stone-600 border-t md:border-t-0 md:border-l border-stone-300 md:pl-6 pt-4 md:pt-0">
            <div>
              <div className="font-mono text-xl font-bold text-stone-900 tabular-nums">
                {books.length}
              </div>
              <div className="text-[11px] text-stone-500 uppercase tracking-wider">
                Cloud Titles
              </div>
            </div>

            <div>
              <div className="font-mono text-xl font-bold text-stone-900 tabular-nums">
                {books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0)}
              </div>
              <div className="text-[11px] text-stone-500 uppercase tracking-wider">
                Chapters
              </div>
            </div>

            <div>
              <div className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                Synced
              </div>
              <div className="text-[11px] text-stone-500 uppercase tracking-wider">
                Firestore
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH UTILITY RIBBON */}
      <section className="px-6 lg:px-12 py-5 bg-[#fbf9f5] border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by title, author, or discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg self-stretch sm:self-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'Strategy', label: 'Strategy' },
              { id: 'Philosophy', label: 'Philosophy' },
              { id: 'Art', label: 'Archival' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedGenre(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedGenre === cat.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CATALOG GRID */}
      <main className="flex-1 px-6 lg:px-12 py-10 max-w-6xl mx-auto w-full">
        {booksLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-stone-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-serif italic">
              Loading your cloud library from Firestore...
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200 p-8">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-stone-800">
              No matching monographs found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Try adjusting your search criteria or create a new monograph with our AI-assisted studio editor.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('all');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={handleResetToSamples}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Restore Sample Library</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpenReader={handleOpenReader}
                onOpen3DMockup={handleOpen3DMockup}
                onOpenExport={handleOpenExport}
                onDeleteRequest={handleDeleteRequest}
                onEditRequest={handleEditRequest}
              />
            ))}
          </div>
        )}

        {/* Defined Google AdSense Advertisement Block */}
        <AdSenseBlock className="mt-10" />
      </main>

      {/* QUIET CURATORIAL FOOTER */}
      <footer className="mt-auto px-6 lg:px-12 py-6 border-t border-stone-200/80 bg-[#f4f0e8]/40 text-stone-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-stone-700">FolioCraft</span>
          <span>·</span>
          <span>Logged in as {user.email}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={handleResetToSamples}
            className="hover:text-stone-900 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Library</span>
          </button>
          <span>·</span>
          <span>Firebase Cloud Persistence &amp; jsPDF</span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. 3D Mockup Modal */}
      {mockupBook && (
        <BookMockup3D
          book={mockupBook}
          onClose={() => setMockupBook(null)}
          onOpenReader={() => {
            setSelectedBookForReader(mockupBook);
            setActiveView('reader');
            setMockupBook(null);
          }}
          onOpenExport={() => {
            setExportBook(mockupBook);
            setMockupBook(null);
          }}
        />
      )}

      {/* 2. Export Center Modal */}
      {exportBook && (
        <ExportCenterModal
          book={exportBook}
          onClose={() => setExportBook(null)}
          onOpenPrintPreview={() => {
            handleOpenPrintPreview(exportBook);
            setExportBook(null);
          }}
        />
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteCandidate && (
        <DeleteConfirmationModal
          book={deleteCandidate}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteCandidate(null)}
        />
      )}

      {/* 4. Book Studio Editor Modal */}
      {editBook && (
        <BookEditorModal
          book={editBook}
          onSave={handleSaveBook}
          onClose={() => setEditBook(null)}
        />
      )}

      {/* 5. New Book Creation Modal */}
      {showNewModal && (
        <NewBookModal
          onBookCreated={handleBookCreated}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}
