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

// Debug: Log all registered routes
console.log('Registered routes:');
router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(middleware.route.path);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(handler.route.path);
      }
    });
  }
});

module.exports = router;
