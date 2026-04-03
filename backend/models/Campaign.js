const mongoose = require('mongoose');

const campaignResultSchema = new mongoose.Schema({
  targetEmail: { type: String, required: true },
  targetName: { type: String },
  department: { type: String },
  events: [{
    type: {
      type: String,
      enum: ['email_sent', 'email_opened', 'link_clicked', 'data_submitted', 'reported'],
    },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
  }],
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  launchDate: { type: Date },
  endDate: { type: Date },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'TargetGroup' },
  landingPage: { type: mongoose.Schema.Types.ObjectId, ref: 'LandingPage' },
  smtpProfile: { type: String, default: 'default' },
  results: [campaignResultSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual stats
campaignSchema.virtual('stats').get(function () {
  const results = this.results || [];
  return {
    sent: results.filter(r => r.events.some(e => e.type === 'email_sent')).length,
    opened: results.filter(r => r.events.some(e => e.type === 'email_opened')).length,
    clicked: results.filter(r => r.events.some(e => e.type === 'link_clicked')).length,
    submitted: results.filter(r => r.events.some(e => e.type === 'data_submitted')).length,
    reported: results.filter(r => r.events.some(e => e.type === 'reported')).length,
  };
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
