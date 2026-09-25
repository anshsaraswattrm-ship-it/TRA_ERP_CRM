const Document = require('../models/Document');
const User = require('../models/User'); // IMPORTANT: User model import kiya hai taaki ID search ho sake
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload new document for an employee
const uploadDocument = async (req, res) => {
  try {
    const { employeeId, documentType } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `raptor_erp_documents/${employeeId || 'general'}`,
        resource_type: 'auto'
      },
      async (error, result) => {
        if (error) return res.status(500).json({ message: 'Cloudinary upload failed', error });
        const doc = await Document.create({
          employee: employeeId,
          documentType,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          uploadedBy: req.user._id
        });
        res.status(201).json({ message: 'Document uploaded successfully', doc });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Smart Fetch: Verify Access & Get user + documents
// @route   POST /api/documents/fetch-records
const fetchEmployeeRecords = async (req, res) => {
  try {
    const { queryId } = req.body;
    const currentUser = req.user;
    
    let targetUser;

    // Agar kisi ne ID search ki hai (Reception/Founder)
    if (queryId) {
      targetUser = await User.findOne({ employeeId: { $regex: new RegExp(`^${queryId}$`, 'i') } });
    } else {
      // Agar auto-load ho raha hai (Regular Employee)
      targetUser = await User.findById(currentUser._id);
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'No employee found with this exact ID.' });
    }

    // RBAC Security Check
    const isSuperAdmin = currentUser.role === 'Super Admin';
    const isManagement = ['Founder and Director', 'Founder', 'Manager'].includes(currentUser.role);
    const isRequestingOwnDocs = currentUser._id.toString() === targetUser._id.toString();

    // Block logic
    if (!isSuperAdmin && !isManagement && !isRequestingOwnDocs) {
      return res.status(403).json({ message: 'Access denied. You can only view your own documents.' });
    }

    const documents = await Document.find({ employee: targetUser._id }).sort({ createdAt: -1 });

    // Response mein User info aur uske Documents dono bhej rahe hain
    res.json({
      user: {
        _id: targetUser._id,
        employeeId: targetUser.employeeId,
        name: targetUser.name,
        role: targetUser.role
      },
      documents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employee: req.params.employeeId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    await cloudinary.uploader.destroy(doc.publicId);
    await doc.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadDocument, getEmployeeDocuments, deleteDocument, fetchEmployeeRecords };