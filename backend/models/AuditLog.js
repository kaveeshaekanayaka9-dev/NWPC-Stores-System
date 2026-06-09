const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  officerId: String,
  action: String,
  fileName: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
