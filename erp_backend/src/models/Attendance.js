const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Format: DD MMM YYYY (e.g., "24 Aug 2026")
      required: true,
    },
    clockInTime: {
      type: String,
      default: '--:--',
    },
    clockOutTime: {
      type: String,
      default: '--:--',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Paid Short Leave', 'Paid Half Day', 'Unpaid Half Day'],
      default: 'Present',
    },
    faceVerified: {
      type: Boolean,
      default: false,
    },
    qrVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;