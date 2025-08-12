// routes/zktecoRoutes.js
const express = require('express');
const router = express.Router();
const zktecoController = require('../controllers/zktecoController');

// Define routes for ZKTeco device operations
router.get('/status', (req, res) => zktecoController.getDeviceStatus(req, res));
router.post('/sync', (req, res) => zktecoController.syncDevice(req, res));
router.get('/attendance', (req, res) => zktecoController.getAttendanceData(req, res));
router.get('/users', (req, res) => zktecoController.getDeviceUsers(req, res));
router.post('/users', (req, res) => zktecoController.addUserToDevice(req, res));
router.delete('/users/:userId', (req, res) => zktecoController.deleteUserFromDevice(req, res));
router.get('/logs', (req, res) => zktecoController.getDeviceLogs(req, res));
router.post('/authenticate', (req, res) => zktecoController.authenticate(req, res));

module.exports = router;
