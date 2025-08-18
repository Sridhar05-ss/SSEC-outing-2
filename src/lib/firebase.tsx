// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAWKmpLqiOApfLb9OGa2WEfs_AmPiItA2g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ssec-outing.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ssec-outing-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ssec-outing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ssec-outing.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "286869609907",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:286869609907:web:91bee1c3ddbdffdaa47fc6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3DPMH890P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
