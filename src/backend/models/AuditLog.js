```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  changeType: {
    type: String,
    required: true
  },
  originalValue: {
    type: String,
    required: true
  },
  newValue: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
```