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
          onUpdate(seededBooks);
        } catch (err) {
          console.warn('Could not auto-seed sample books:', err);
          onUpdate(SAMPLE_BOOKS);
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

        onUpdate(loadedBooks);
      }
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, booksPath);
    }
  );

  return unsubscribe;
}

export async function saveUserBook(userId: string, book: Book): Promise<void> {
  const path = `users/${userId}/books/${book.id}`;
  try {
    const bookDocRef = doc(db, 'users', userId, 'books', book.id);
    const payload = {
      ...book,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(bookDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserBook(userId: string, bookId: string): Promise<void> {
  const path = `users/${userId}/books/${bookId}`;
  try {
    const bookDocRef = doc(db, 'users', userId, 'books', bookId);
    await deleteDoc(bookDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
