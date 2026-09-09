const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Helper to get current formatted date strictly in IST
const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-GB', { 
    timeZone: 'Asia/Kolkata',
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Helper to get current time strictly in IST
const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Kolkata',
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

// Helper to calculate monthly stats for Quota Limits
const getMonthlyStats = async (userId, monthStr, yearStr) => {
  const logs = await Attendance.find({ employee: userId });
  const monthLogs = logs.filter(log => log.date.includes(monthStr) && log.date.includes(yearStr));

  let lateCount = 0;
  let shortLeaveCount = 0;
  let paidHalfDayCount = 0;

  monthLogs.forEach(log => {
    if (log.status === 'Late') lateCount++;
    if (log.status === 'Paid Short Leave') shortLeaveCount++;
    if (log.status === 'Paid Half Day') paidHalfDayCount++;
  });

  return { lateCount, shortLeaveCount, paidHalfDayCount };
};

// @desc    Mark Clock-In Attendance
// @route   POST /api/attendance/clock-in
const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const employeeId = req.user.employeeId;
    
    const currentDate = getFormattedDate(); // Format: "09 Sept 2026"
    const [, currentMonth, currentYear] = currentDate.split(' ');

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({ employee: userId, date: currentDate });
    if (existingAttendance && existingAttendance.clockInTime !== '--:--') {
      return res.status(400).json({ message: 'You have already clocked in for today!' });
    }

    const currentTime = getCurrentTime();
    
    // IST Time breakdown for Logic
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = nowIST.getHours();
    const currentMinute = nowIST.getMinutes();
    const timeInMins = (currentHour * 60) + currentMinute; // Convert to total minutes from midnight

    // Fetch User's monthly quotas
    const counts = await getMonthlyStats(userId, currentMonth, currentYear);
    
    let status = 'Present';

    // 🟢 Up to 10:00 AM -> Present
    if (timeInMins <= 600) { 
      status = 'Present';
    } 
    // 🟠 10:01 AM to 10:15 AM -> Late (Max 3 per month, then Half Day)
    else if (timeInMins <= 615) { 
      if (counts.lateCount < 3) {
        status = 'Late';
      } else {
        status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
      }
    } 
    // 🟣 10:16 AM to 11:30 AM -> Short Leave (Max 1 per month, then Half Day)
    else if (timeInMins <= 690) { 
      if (counts.shortLeaveCount < 1) {
        status = 'Paid Short Leave';
      } else {
        status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
      }
    } 
    // 🔴 After 11:30 AM -> Direct Half Day
    else { 
      status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
    }

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

// @desc    Mark Clock-Out Attendance & Apply Early Exit Penalty
// @route   POST /api/attendance/clock-out
const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = getFormattedDate();
    const [, currentMonth, currentYear] = currentDate.split(' ');

    const attendance = await Attendance.findOne({ employee: userId, date: currentDate });
    if (!attendance || attendance.clockInTime === '--:--') {
      return res.status(400).json({ message: 'You have not clocked in today yet!' });
    }

    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = nowIST.getHours();
    const currentMinute = nowIST.getMinutes();
    const timeInMins = (currentHour * 60) + currentMinute;

    const counts = await getMonthlyStats(userId, currentMonth, currentYear);

    // ✅ EARLY CLOCK OUT LOGIC (Before 6:00 PM)
    if (timeInMins < 1080) { 
      
      // 🟣 4:30 PM to 5:59 PM (Eligible for Short Leave if available)
      if (timeInMins >= 990) { 
        if (attendance.status === 'Present' || attendance.status === 'Late') {
          if (counts.shortLeaveCount < 1) {
            attendance.status = 'Paid Short Leave';
          } else {
            attendance.status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
          }
        } else if (attendance.status === 'Paid Short Leave') {
          // Used short leave in morning AND leaving early = Half Day penalty
          attendance.status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
        }
      } 
      // 🔴 Before 4:30 PM (Automatic Half Day Penalty)
      else {
        if (attendance.status !== 'Paid Half Day' && attendance.status !== 'Unpaid Half Day') {
          attendance.status = counts.paidHalfDayCount < 2 ? 'Paid Half Day' : 'Unpaid Half Day';
        }
      }
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

// @desc    Get Monthly Attendance Report for a Specific Employee
// @route   GET /api/attendance/monthly-report/:employeeId
const getMonthlyReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let { month, year } = req.query;

    const User = require('../models/User');
    const employee = await User.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found!' });
    }

    let targetMonth = month || 'Sept';
    if (targetMonth.toLowerCase() === 'sep') {
      targetMonth = 'Sept';
    }
    const targetYear = year || '2026';

    const logs = await Attendance.find({ employee: employee._id });
    const monthLogs = logs.filter(log => log.date.includes(targetMonth) && log.date.includes(targetYear));

    const logMap = {};
    monthLogs.forEach(log => {
      logMap[log.date] = log;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(targetMonth);
    const daysInMonth = new Date(targetYear, monthIndex + 1, 0).getDate();

    const fullMonthReport = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${formattedDay} ${targetMonth} ${targetYear}`;

      if (logMap[dateStr]) {
        fullMonthReport.push(logMap[dateStr]);
      } else {
        fullMonthReport.push({
          employeeId: employee.employeeId,
          date: dateStr,
          clockInTime: '--:--',
          clockOutTime: '--:--',
          status: 'Absent',
          faceVerified: false,
          qrVerified: false
        });
      }
    }

    res.json({
      employee: { name: employee.name, employeeId: employee.employeeId, role: employee.role },
      report: fullMonthReport
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Reception QR Payload for Kiosk TV Display
// @route   GET /api/attendance/reception-qr
const getReceptionQR = async (req, res) => {
  try {
    const token = jwt.sign(
      { type: 'RAPTOR_OFFICE_QR', timestamp: Date.now() },
      process.env.JWT_SECRET || 'raptor_secret_key',
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

    const decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'raptor_secret_key');
    
    if (decoded.type !== 'RAPTOR_OFFICE_QR') {
      return res.status(400).json({ message: 'Invalid QR format!' });
    }

    res.json({ message: 'Office QR Verified Successfully!' });
  } catch (error) {
    return res.status(400).json({ message: 'QR Code Expired! Please scan the latest one on TV.' });
  }
};

module.exports = { 
  clockIn, 
  clockOut, 
  getMyLogs, 
  getAllLogs, 
  getMonthlyReport, 
  getReceptionQR, 
  verifyQRCode 
};