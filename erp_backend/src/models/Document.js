const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true, // e.g., 'Aadhar Card', 'PAN Card', 'Resume', 'Offer Letter'
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String, // Cloudinary se delete karne ke liye chahiye hota hai
    required: true 
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // IT Admin jisne upload kiya
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);