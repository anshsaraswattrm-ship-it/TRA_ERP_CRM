const express = require('express');
const router = express.Router();
const { loginUser, createEmployee, getUsers, deleteUser, updateUser, enrollFace, getUserProfile, adminEnrollFace } = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public & Face routes
router.put('/enroll-face', protect, enrollFace);
router.post('/login', loginUser);

// Profile route
router.get('/profile', protect, getUserProfile);

// Protected routes (Only Admin/Founder) to create new employees
router.post('/create-employee', protect, adminOnly, createEmployee);
router.put('/admin-enroll-face', protect, adminOnly, adminEnrollFace);

// Protected routes (Only Admin/Founder) to manage users
router.get('/users', protect, adminOnly, getUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id', protect, adminOnly, updateUser);

module.exports = router;