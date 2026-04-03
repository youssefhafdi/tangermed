const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  htmlContent: { type: String, required: true },
  redirectUrl: { type: String, default: 'https://www.google.com' },
  captureCredentials: { type: Boolean, default: true },
  capturePasswords: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('LandingPage', landingPageSchema);
