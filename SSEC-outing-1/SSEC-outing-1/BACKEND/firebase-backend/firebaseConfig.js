// Firebase configuration with Realtime Database
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const { getAuth } = require('firebase/auth');
const { getStorage } = require('firebase/storage');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWKmpLqiOApfLb9OGa2WEfs_AmPiItA2g",
  authDomain: "ssec-outing.firebaseapp.com",
  databaseURL: "https://ssec-outing-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ssec-outing",
  storageBucket: "ssec-outing.firebasestorage.app",
  messagingSenderId: "286869609907",
  appId: "1:286869609907:web:91bee1c3ddbdffdaa47fc6",
  measurementId: "G-3DPMH890P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

module.exports = {
  app,
  database,
  auth,
  storage,
  firebaseConfig
};
