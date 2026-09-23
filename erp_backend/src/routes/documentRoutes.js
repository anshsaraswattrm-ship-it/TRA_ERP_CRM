const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getEmployeeDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, admin } = require('../middleware/authMiddleware'); // Tera existing auth middleware

// Memory storage for multer (No local files saved)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload', protect, admin, upload.single('file'), uploadDocument);
router.get('/:employeeId', protect, admin, getEmployeeDocuments);
router.delete('/:docId', protect, admin, deleteDocument);

module.exports = router;