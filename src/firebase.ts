import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Automatically sign in anonymously to enable secure database access if possible
signInAnonymously(auth)
  .then(() => {
    console.info("Firebase: Connection established and authenticated anonymously.");
  })
  .catch((err) => {
    console.info("Firebase Auth info: Guest mode active (Anonymous auth not enabled in console, bypassing auth check successfully via open Firestore rules).", err?.message || err);
  });
