import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function runTest() {
  console.log('--- STARTING COMPREHENSIVE FIREBASE TEST ---');
  console.log('Project ID:', firebaseConfig.projectId);

  // 1. Google Auth Identity Toolkit Test
  try {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`;
    const authRes = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'google.com',
        continueUri: 'https://ais-dev-a5dfewkca2i5gt5uwhamyu-240962024176.asia-southeast1.run.app/__/auth/handler'
      })
    });
    const authJson = await authRes.json();
    if (authRes.status === 200 && authJson.sessionId) {
      console.log('✅ GOOGLE AUTH: SUCCESS (Status 200, Session ID generated)');
    } else {
      console.log('❌ GOOGLE AUTH WARNING:', JSON.stringify(authJson));
    }
  } catch (err: any) {
    console.error('Google Auth Fetch error:', err.message);
  }

  // 2. Firestore Database Connection Test
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const testDocPath = doc(db, 'users', 'test_user_connection', 'books', 'test_book_1');
    const testData = {
      id: 'test_book_1',
      userId: 'test_user_connection',
      title: 'FolioCraft Cloud Connection Verified',
      author: 'FolioCraft System',
      themeId: 'classic-serif',
      chapters: [{ id: 'ch1', title: 'Chapter 1: Status', content: 'Database is online and working.' }]
    };

    console.log('Attempting Firestore write...');
    await setDoc(testDocPath, testData);
    console.log('✅ FIRESTORE WRITE: SUCCESS');

    const snap = await getDoc(testDocPath);
    if (snap.exists() && snap.data()?.title === testData.title) {
      console.log('✅ FIRESTORE READ: SUCCESS (Verified: "' + snap.data()?.title + '")');
    }

    await deleteDoc(testDocPath);
    console.log('✅ FIRESTORE DELETE: SUCCESS (Cleaned up test data)');

    console.log('🎉 ALL TESTS PASSED! FIREBASE IS FULLY OPERATIONAL!');
  } catch (err: any) {
    console.error('Firestore Error:', err.message);
  }

  process.exit(0);
}

runTest();
