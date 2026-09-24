const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadDocument, getEmployeeDocuments, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware'); 

// Safe inline Admin check for IT Department
const itAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Super Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only IT Department (Super Admin) can edit documents.' });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload aur Delete sirf IT Department kar sakta hai
router.post('/upload', protect, itAdminOnly, upload.single('file'), uploadDocument);
router.delete('/:docId', protect, itAdminOnly, deleteDocument);

// Get Documents sab access kar sakte hain (Role check controller ke andar hoga)
router.get('/:employeeId', protect, getEmployeeDocuments);

module.exports = router;