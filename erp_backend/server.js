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
app.use('/api/auth', authRoutes);

// --- HARDCODED SUPER ADMIN SEEDER ---
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ employeeId: 'RA-001-ADMIN-2026' });
    if (!adminExists) {
      await User.create({
        employeeId: 'RA-001-ADMIN-2026',
        name: 'IT Department',
        email: 'ansh.saraswat.trm@gmail.com', 
        password: 'Admin@123!@#$%^&*()',
        role: 'Super Admin', 
      });
      console.log('✅ Hardcoded Master Super Admin Account Created! (ID: RA-001-ADMIN-2026)');
    } else {
      console.log('Super Admin account already exists in DB.');
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