import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types/book';
import { SAMPLE_BOOKS } from '../data/sampleBooks';

const LOCAL_BOOKS_STORAGE = 'foliocraft_local_books_';

function getLocalBooks(userId: string): Book[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKS_STORAGE + userId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return SAMPLE_BOOKS;
}

function saveLocalBooks(userId: string, books: Book[]) {
  try {
    localStorage.setItem(LOCAL_BOOKS_STORAGE + userId, JSON.stringify(books));
  } catch (e) {
    console.error(e);
  }
}

export function subscribeUserBooks(
  userId: string,
  onUpdate: (books: Book[]) => void,
  onError?: (error: Error) => void
): () => void {
  // If guest or unauthenticated, work exclusively in local offline mode
  if (!userId || userId === 'guest_reader' || !auth.currentUser) {
    const local = getLocalBooks(userId || 'guest_reader');
    onUpdate(local);
    return () => {};
  }

  const booksPath = `users/${userId}/books`;
  const booksCol = collection(db, 'users', userId, 'books');

  const unsubscribe = onSnapshot(
    booksCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed curated sample books into user's Firestore collection
        try {
          const seededBooks = SAMPLE_BOOKS.map((b) => ({
            ...b,
            userId,
          }));

          for (const book of seededBooks) {
            await setDoc(doc(db, 'users', userId, 'books', book.id), book);
          }
          saveLocalBooks(userId, seededBooks);
          onUpdate(seededBooks);
        } catch (err) {
          console.warn('Could not auto-seed sample books to Firestore, using local cache:', err);
          const fallback = getLocalBooks(userId);
          onUpdate(fallback);
        }
      } else {
        const loadedBooks: Book[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            title: data.title,
            subtitle: data.subtitle,
            author: data.author,
            edition: data.edition,
            publicationYear: data.publicationYear,
            genre: data.genre,
            themeId: data.themeId,
            demographic: data.demographic,
            chapters: data.chapters,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Book;
        });

        // Sort by updatedAt or createdAt descending
        loadedBooks.sort((a, b) => {
          const tA = new Date(a.updatedAt || a.createdAt).getTime();
          const tB = new Date(b.updatedAt || b.createdAt).getTime();
          return tB - tA;
        });

        saveLocalBooks(userId, loadedBooks);
        onUpdate(loadedBooks);
      }
    },
    (error) => {
      console.warn('Firestore onSnapshot sync notice, falling back to local monographs:', error.message);
      const fallback = getLocalBooks(userId);
      onUpdate(fallback);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

export async function saveUserBook(userId: string, book: Book): Promise<void> {
  const path = `users/${userId}/books/${book.id}`;
  // Always update local cache immediately for instantaneous UI updates
  const local = getLocalBooks(userId);
  const idx = local.findIndex((b) => b.id === book.id);
  const updatedBook = {
    ...book,
    userId,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    local[idx] = updatedBook;
  } else {
    local.unshift(updatedBook);
  }
  saveLocalBooks(userId, local);

  // If guest or unauthenticated, stay in local cache
  if (!userId || userId === 'guest_reader' || !auth.currentUser) {
    return;
  }

  try {
    const bookDocRef = doc(db, 'users', userId, 'books', book.id);
    await setDoc(bookDocRef, updatedBook, { merge: true });
  } catch (error) {
    console.warn('Could not sync book to Firestore, saved to local cache:', error);
  }
}

export async function deleteUserBook(userId: string, bookId: string): Promise<void> {
  const path = `users/${userId}/books/${bookId}`;
  // Always update local cache immediately
  const local = getLocalBooks(userId).filter((b) => b.id !== bookId);
  saveLocalBooks(userId, local);

  // If guest or unauthenticated, stay in local cache
  if (!userId || userId === 'guest_reader' || !auth.currentUser) {
    return;
  }

  try {
    const bookDocRef = doc(db, 'users', userId, 'books', bookId);
    await deleteDoc(bookDocRef);
  } catch (error) {
    console.warn('Could not delete book from Firestore, removed from local cache:', error);
  }
}
