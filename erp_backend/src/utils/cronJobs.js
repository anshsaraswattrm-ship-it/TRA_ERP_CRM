const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User'); 

// ✅ 100% Bulletproof Date Formatter (Matches Controller & Frontend)
const getFormattedDate = () => {
  const dateObj = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = String(dateObj.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

const startAttendanceCron = () => {
  // 🕒 Har raat 11:55 PM (IST) par chalega
  cron.schedule('55 23 * * *', async () => {
    try {
      const today = getFormattedDate();
      console.log(`[CRON JOB] Running Auto-Absent Check for: ${today}`);

      // ✅ EXCLUDE ROLES: Super Admin, Founder, aur Receptionist ko absent mark nahi karna hai
      const allEmployees = await User.find({ 
        role: { $nin: ['Super Admin', 'Founder and Director', 'Receptionist'] } 
      });

      for (let emp of allEmployees) {
        // Check karo ki is employee ne aaj koi clock-in ya attendance mark ki hai kya?
        const existingLog = await Attendance.findOne({ employee: emp._id, date: today });

        // Agar koi record nahi mila, toh automatically "Absent" laga do
        if (!existingLog) {
          await Attendance.create({
            employee: emp._id,
            employeeId: emp.employeeId,
            date: today,
            clockInTime: '--:--',
            clockOutTime: '--:--',
            status: 'Absent',
            faceVerified: false,
            qrVerified: false,
          });
        }
      }
      console.log(`✅ [CRON JOB] Auto-Absent marking successfully completed for ${today}`);
    } catch (error) {
      console.error("❌ [CRON JOB] Auto-Absent task failed:", error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};

module.exports = startAttendanceCron;