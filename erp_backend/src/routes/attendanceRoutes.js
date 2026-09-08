const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getMyLogs, getAllLogs, getReceptionQR, verifyQRCode } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware'); 

// Custom middleware for Attendance Logs visibility
const canViewLogs = (req, res, next) => {
  const allowedRoles = ['Super Admin', 'Founder and Director', 'Receptionist'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: You are not authorized to view company logs.' });
  }
};

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/my-logs', protect, getMyLogs);

// YAHAN FIX KIYA HAI: adminOnly ki jagah canViewLogs laga diya
router.get('/admin-logs', protect, canViewLogs, getAllLogs);

// Reception QR Routes
router.get('/reception-qr', protect, getReceptionQR);
router.post('/verify-qr', protect, verifyQRCode);

module.exports = router;