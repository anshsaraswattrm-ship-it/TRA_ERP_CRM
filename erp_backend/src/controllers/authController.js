const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token (LOGIN)
// @route   POST /api/auth/login

const enrollFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ message: 'No face data provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.faceDescriptor = faceDescriptor;
    await user.save();

    return res.json({ message: 'Face successfully enrolled for biometric attendance!' });
  } catch (error) {
    console.error("ASLI BACKEND ERROR:", error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const user = await User.findOne({ employeeId });

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(401).json({ message: 'Your account has been deactivated.' });
      }

      res.json({
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid Employee ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new employee account (ONLY ADMIN/FOUNDER)
// @route   POST /api/auth/create-employee
const createEmployee = async (req, res) => {
  const { employeeId, name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });

    if (userExists) {
      return res.status(400).json({ message: 'Employee with this ID or Email already exists' });
    }

    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        message: 'Employee created successfully',
        employeeId: user.employeeId,
        name: user.name,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users (ONLY ADMIN/FOUNDER)
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching users' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // 🔒 STRICT SECURITY: Master Admin cannot be deleted
      if (user.employeeId === 'RA-001-ADMIN-2026') {
        return res.status(403).json({ message: 'Action Denied: Master Super Admin cannot be deleted!' });
      }
      
      await user.deleteOne();
      res.json({ message: 'User account revoked successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting user' });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // 🔒 STRICT SECURITY: Master Admin cannot be edited by ANYONE
      if (user.employeeId === 'RA-001-ADMIN-2026') {
         return res.status(403).json({ message: 'Action Denied: Master Super Admin details cannot be modified!' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        employeeId: updatedUser.employeeId,
        name: updatedUser.name,
        role: updatedUser.role,
        email: updatedUser.email
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating user' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin enroll face for any user by ID
const adminEnrollFace = async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ message: 'No face data provided' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.faceDescriptor = faceDescriptor;
    await user.save();

    return res.json({ message: `Face successfully enrolled for ${user.name}!` });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser, createEmployee, getUsers, deleteUser, updateUser, enrollFace, getUserProfile, adminEnrollFace };