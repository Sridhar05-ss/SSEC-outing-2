// routes.js
const express = require('express');
const { syncToFirebase } = require('./sync');
const zktecoRoutes = require('./routes/zktecoRoutes');
const easytimeRoutes = require('./routes/easytimeRoutes');

const router = express.Router();

router.get('/sync-attendance', async (req, res) => {
  try {
    await syncToFirebase();
    res.json({ message: 'Attendance synced successfully' });
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    res.status(500).json({ error: 'Failed to sync attendance' });
  }
});

// Add zkteco routes under /zkteco path
router.use('/zkteco', zktecoRoutes);

// Add easytime routes under /easytime path
router.use('/easytime', easytimeRoutes);

// Simple route logging without complex parsing
console.log('Registered routes:');
console.log('  GET /sync-attendance');
console.log('  GET /zkteco/test');
console.log('  GET /zkteco/transactions');
console.log('  DELETE /zkteco/cache');
console.log('  GET /zkteco/cache/stats');
console.log('  POST /easytime/authenticate');
console.log('  GET /easytime/transactions');
console.log('  POST /easytime/add-employee');
console.log('  DELETE /easytime/delete-employee/:id');
console.log('  GET /easytime/get-employee/:empCode');
console.log('  PATCH /easytime/update-employee/:id');
console.log('  GET /easytime/staff');

module.exports = router;
