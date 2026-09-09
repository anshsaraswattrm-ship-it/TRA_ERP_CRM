require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const authRoutes = require('./src/routes/authRoutes');

const startAttendanceCron = require('./src/utils/cronJobs'); 

const app = express();

// Connect to Database
connectDB();

// CORS Configuration for Live Frontend & Local testing
const allowedOrigins = [
  'https://erp.theraptoracademics.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); 

// --- HARDCODED SUPER ADMIN SEEDER ---
const seedAdmin = async () => {
  try {
    const adminEmail = 'ansh.saraswat.trm@gmail.com';
    // ✅ FORMAT CHANGED TO SLASHES (/)
    const newAdminId = '100/SEP/RAPTOR/26'; 

    // Check by email so we don't create duplicate admins
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      await User.create({
        employeeId: newAdminId,
        name: 'IT Department',
        email: adminEmail, 
        password: 'Admin@123!@#$%^&*()',
        role: 'Super Admin', 
      });
      console.log(`✅ Hardcoded Master Super Admin Account Created! (ID: ${newAdminId})`);
    } else if (adminExists.employeeId !== newAdminId) {
      // ✅ Agar DB mein purani ID hai, toh use update karke nayi ID set kar do
      adminExists.employeeId = newAdminId;
      await adminExists.save();
      console.log(`✅ Super Admin ID updated to new format: ${newAdminId}`);
    } else {
      console.log(`✅ Super Admin account already exists with ID: ${newAdminId}`);
    }
  } catch (error) {
    console.error('Admin Seeding Error:', error);
  }
};
seedAdmin(); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// ✅ START CRON JOBS
startAttendanceCron();

app.get('/', (req, res) => {
  res.send('Raptor ERP API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});