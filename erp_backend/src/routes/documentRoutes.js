const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadDocument, getEmployeeDocuments, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware'); 

// Safe inline Admin check (since 'admin' export was missing in authMiddleware)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Super Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin (Super Admin access required)' });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload', protect, admin, upload.single('file'), uploadDocument);
router.get('/:employeeId', protect, admin, getEmployeeDocuments);
router.delete('/:docId', protect, admin, deleteDocument);

module.exports = router;