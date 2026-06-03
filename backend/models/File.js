const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileNumber: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  submittedBy: {
    type: String, // 👈 'string' වෙනුවට 'String' ලෙස නිවැරදි කළා
    required: true
  },
  fileUrl: { type: String, required: true },
  isVerified: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  needsReapproval: { type: Boolean, default: false },
  rackNumber: { type: String, default: 'Unassigned' },
  shelfNumber: { type: String, default: 'Unassigned' },
  slotIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema, 'files');
