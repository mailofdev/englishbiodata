// Firebase config — maza-biodata project. Firestore persistence for performance/offline.
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, persistentLocalCache } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAlaBKV0sZyTxvP9tDy7NcoREhz7rvoWU8",
  authDomain: "maza-biodata.firebaseapp.com",
  projectId: "maza-biodata",
  storageBucket: "maza-biodata.firebasestorage.app",
  messagingSenderId: "512571695596",
  appId: "1:512571695596:web:3a8763ef5841157a7ba0c9",
  measurementId: "G-5PS4BXZZM7",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use FirestoreSettings.cache (persistentLocalCache) instead of deprecated enableIndexedDbPersistence
export const db =
  typeof window !== "undefined"
    ? (() => {
        try {
          return initializeFirestore(app, {
            localCache: persistentLocalCache(),
          });
        } catch (err) {
          if (err.code === "failed-precondition" || err.code === "unimplemented") {
            return getFirestore(app);
          }
          throw err;
        }
      })()
    : getFirestore(app);

export const analytics =
  typeof window !== "undefined"
    ? (() => {
        try {
          return getAnalytics(app);
        } catch {
          return null;
        }
      })()
    : null;
