const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['FILE_SUBMITTED', 'FILE_APPROVED', 'FILE_REJECTED'], required: true },
  fileNumber: { type: String, required: true },
  fileName: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
