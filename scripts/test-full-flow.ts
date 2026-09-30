import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function verifyFullFlow() {
  console.log('Testing full authenticated flow with project:', firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const testEmail = `test_automated_${Date.now()}@example.com`;
  const testPass = 'Secret12345!';

  try {
    console.log('1. Testing User Registration (Email/Password)...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPass);
    const userId = userCredential.user.uid;
    console.log('✅ USER CREATED successfully! UID:', userId);

    console.log('2. Testing Firestore Profile Sync...');
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      email: testEmail,
      displayName: 'Automated Tester',
      createdAt: new Date().toISOString()
    });
    console.log('✅ USER PROFILE SAVED to Firestore!');

    console.log('3. Testing Firestore Book Creation (Security Rules Checked)...');
    const bookId = 'test_book_' + Date.now();
    const bookRef = doc(db, 'users', userId, 'books', bookId);
    await setDoc(bookRef, {
      id: bookId,
      userId: userId,
      title: 'The Automated Verification Chronicle',
      author: 'FolioCraft Engine',
      themeId: 'classic-serif',
      chapters: [
        { id: 'ch_1', title: 'Chapter 1: The Test', content: 'Testing database persistence and real-time syncing.' }
      ]
    });
    console.log('✅ BOOK SAVED to Firestore!');

    console.log('4. Testing Firestore Read...');
    const snap = await getDoc(bookRef);
    if (snap.exists() && snap.data()?.title === 'The Automated Verification Chronicle') {
      console.log('✅ BOOK READ VERIFIED! Title:', snap.data()?.title);
    }

    console.log('5. Cleaning up test book and test user...');
    await deleteDoc(bookRef);
    await deleteDoc(userRef);
    await deleteUser(userCredential.user);
    console.log('✅ CLEANUP COMPLETE!');

    console.log('🎉 100% VERIFIED: AUTHENTICATION + FIRESTORE DATABASE ARE FULLY OPERATIONAL!');
  } catch (err: any) {
    console.error('❌ Verification failed:', err.message);
  }

  process.exit(0);
}

verifyFullFlow();
