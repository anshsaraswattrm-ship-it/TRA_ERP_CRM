const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken'); // JWT add kiya for dynamic expiration

// Helper to get current formatted date (e.g., "24 Aug 2026")
const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to get current time (e.g., "09:30 AM")
const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// @desc    Mark Clock-In Attendance
// @route   POST /api/attendance/clock-in
const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const employeeId = req.user.employeeId;
    const currentDate = getFormattedDate();

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({ employee: userId, date: currentDate });
    if (existingAttendance && existingAttendance.clockInTime !== '--:--') {
      return res.status(400).json({ message: 'You have already clocked in for today!' });
    }

    const currentTime = getCurrentTime();
    // Logic: If past 10:00 AM, mark as 'Late', else 'Present'
    const now = new Date();
    const status = (now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 0)) ? 'Late' : 'Present';

    let attendance = existingAttendance;
    if (attendance) {
      attendance.clockInTime = currentTime;
      attendance.status = status;
      attendance.faceVerified = true;
      attendance.qrVerified = true;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: userId,
        employeeId,
        date: currentDate,
        clockInTime: currentTime,
        status,
        faceVerified: true,
        qrVerified: true,
      });
    }

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark Clock-Out Attendance
// @route   POST /api/attendance/clock-out
const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = getFormattedDate();

    const attendance = await Attendance.findOne({ employee: userId, date: currentDate });
    if (!attendance || attendance.clockInTime === '--:--') {
      return res.status(400).json({ message: 'You have not clocked in today yet!' });
    }

    attendance.clockOutTime = getCurrentTime();
    await attendance.save();

    res.json({ message: 'Clocked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get My Attendance Logs
// @route   GET /api/attendance/my-logs
const getMyLogs = async (req, res) => {
  try {
    const logs = await Attendance.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get All Employees Attendance Logs (Admin Only)
// @route   GET /api/attendance/admin-logs
const getAllLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date || getFormattedDate();
    
    const logs = await Attendance.find({ date: queryDate }).populate('employee', 'name role email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Reception QR Payload for Kiosk TV Display
// @route   GET /api/attendance/reception-qr
const getReceptionQR = async (req, res) => {
  try {
    // Generate a 30-second expiring JWT token
    const token = jwt.sign(
      { type: 'RAPTOR_OFFICE_QR', timestamp: Date.now() },
      process.env.JWT_SECRET || 'raptor_secret_key', // Fallback incase .env is missing
      { expiresIn: '30s' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify Scanned QR Code for Attendance
// @route   POST /api/attendance/verify-qr
const verifyQRCode = async (req, res) => {
  try {
    const { qrToken } = req.body;
    
    if (!qrToken) {
      return res.status(400).json({ message: 'No QR code provided!' });
    }

    // Verify token & check expiry
    const decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'raptor_secret_key');
    
    if (decoded.type !== 'RAPTOR_OFFICE_QR') {
      return res.status(400).json({ message: 'Invalid QR format!' });
    }

    res.json({ message: 'Office QR Verified Successfully!' });
  } catch (error) {
    // If token is expired or invalid
    return res.status(400).json({ message: 'QR Code Expired! Please scan the latest one on TV.' });
  }
};

module.exports = { clockIn, clockOut, getMyLogs, getAllLogs, getReceptionQR, verifyQRCode };