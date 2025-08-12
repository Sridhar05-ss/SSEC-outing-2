// sync.js
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const { getAttendanceLogs } = require('./zkteco');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = firebase.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

async function syncToFirebase() {
  try {
    const logs = await getAttendanceLogs();
    for (const log of logs) {
      await firestore.addDoc(firestore.collection(db, 'attendance'), log);
    }
    console.log('✅ Attendance logs synced to Firebase.');
  } catch (err) {
    console.error('❌ Error syncing to Firebase:', err.message);
  }
}

module.exports = { syncToFirebase };
