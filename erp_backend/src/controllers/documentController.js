const Document = require('../models/Document');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// .env se Cloudinary configure karna
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload new document for an employee
// @route   POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    const { employeeId, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Buffer ko Cloudinary par stream karna
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'raptor_erp_documents' },
      async (error, result) => {
        if (error) return res.status(500).json({ message: 'Cloudinary upload failed', error });

        // Database mein save karna
        const doc = await Document.create({
          employee: employeeId,
          documentType,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          uploadedBy: req.user._id // Super Admin ID
        });

        res.status(201).json({ message: 'Document uploaded successfully', doc });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all documents for a specific employee
// @route   GET /api/documents/:employeeId
const getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employee: req.params.employeeId })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:docId
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Cloudinary se delete karna
    await cloudinary.uploader.destroy(doc.publicId);
    
    // DB se delete karna
    await doc.deleteOne();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadDocument, getEmployeeDocuments, deleteDocument };