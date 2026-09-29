import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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
          console.warn('Could not auto-seed sample books:', err);
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
      console.warn('Firestore onSnapshot error, using local books:', error);
      const fallback = getLocalBooks(userId);
      onUpdate(fallback);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, booksPath);
      } catch (err) {
        // Diagnostic handled and logged
      }
    }
  );

  return unsubscribe;
}

export async function saveUserBook(userId: string, book: Book): Promise<void> {
  const path = `users/${userId}/books/${book.id}`;
  // Always update local cache
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

  try {
    const bookDocRef = doc(db, 'users', userId, 'books', book.id);
    await setDoc(bookDocRef, updatedBook, { merge: true });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (err) {
      // Diagnostic handled and logged
    }
  }
}

export async function deleteUserBook(userId: string, bookId: string): Promise<void> {
  const path = `users/${userId}/books/${bookId}`;
  // Always update local cache
  const local = getLocalBooks(userId).filter((b) => b.id !== bookId);
  saveLocalBooks(userId, local);

  try {
    const bookDocRef = doc(db, 'users', userId, 'books', bookId);
    await deleteDoc(bookDocRef);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch (err) {
      // Diagnostic handled and logged
    }
  }
}
