const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  fromName: { type: String, required: true },
  fromEmail: { type: String, required: true },
  htmlContent: { type: String, required: true },
  category: {
    type: String,
    enum: ['credential_harvest', 'urgency', 'it_notice', 'hr', 'financial', 'other'],
    default: 'other'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
