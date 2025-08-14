// sync.js
const { getAttendanceLogs } = require('./zkteco');
const { database } = require('./firebase-backend/firebaseConfig');
const { ref, push } = require('firebase/database');
require('dotenv').config();

async function syncToFirebase() {
  try {
    const logs = await getAttendanceLogs();
    for (const log of logs) {
      await push(ref(database, 'attendance'), log);
    }
    console.log('✅ Attendance logs synced to Firebase.');
  } catch (err) {
    console.error('❌ Error syncing to Firebase:', err.message);
  }
}

module.exports = { syncToFirebase };
