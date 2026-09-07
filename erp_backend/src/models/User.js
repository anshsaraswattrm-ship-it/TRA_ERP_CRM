const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader', 'BDE LEVEL1', 'BDE LEVEL2'],
      default: 'BDE LEVEL1'
    },
    faceDescriptor: {
      type: [Number], // AI model returns a 128-dimensional array of numbers
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  // Agar password change nahi hua, toh seedha return kar do, next() ki zaroorat hi nahi hai async function mein!
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;