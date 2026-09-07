const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getMyLogs, getAllLogs, getReceptionQR, verifyQRCode } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/my-logs', protect, getMyLogs);
router.get('/admin-logs', protect, adminOnly, getAllLogs);

// Reception QR Routes
router.get('/reception-qr', protect, getReceptionQR);
router.post('/verify-qr', protect, verifyQRCode);

module.exports = router;