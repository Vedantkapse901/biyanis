import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const MY_OWN_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD3Ghu3il5ogWh3BdHzSdfWMon_NzQWFdc',
  authDomain: 'biyanis-8af2e.firebaseapp.com',
  projectId: 'biyanis-8af2e',
  storageBucket: 'biyanis-8af2e.appspot.com',
  messagingSenderId: '925325361593',
  appId: '1:925325361593:web:b071e56006fd3b99dcb668',
};

export const appId = 'biyani-edtech-app';

export let useFirebase = false;
export let auth = null;
export let db = null;
export let storage = null;

try {
  const firebaseApp = initializeApp(MY_OWN_FIREBASE_CONFIG);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  useFirebase = true;
} catch (e) {
  console.warn('Firebase initialization failed. Falling back to local storage.', e);
  useFirebase = false;
}

/** Turn off cloud sync when auth or Firestore fails at runtime. */
export function disableFirebase() {
  useFirebase = false;
}
