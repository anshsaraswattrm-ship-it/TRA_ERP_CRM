const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User'); 

// ✅ Same 100% Bulletproof Date Formatter (Matches Frontend & Controller)
const getFormattedDate = () => {
  const dateObj = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = String(dateObj.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

const startAttendanceCron = () => {
  // Har raat 11:55 PM (IST) par chalega
  cron.schedule('55 23 * * *', async () => {
    try {
      const today = getFormattedDate();
      console.log(`Running Auto-Absent Cron Job for: ${today}`);

      // Un sabhi employees ko uthao jinko attendance mark karni hoti hai
      const allEmployees = await User.find({ 
        role: { $nin: ['Super Admin', 'Founder and Director', 'Receptionist'] } 
      });

      for (let emp of allEmployees) {
        // Check karo ki kya is employee ka aaj ka koi record pehle se hai?
        const existingLog = await Attendance.findOne({ employee: emp._id, date: today });

        if (!existingLog) {
          // Agar koi record nahi hai, toh Absent mark kardo
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
      console.log(`✅ Auto-Absent marking completed for ${today}`);
    } catch (error) {
      console.error("❌ Auto-Absent cron job failed:", error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};

module.exports = startAttendanceCron;