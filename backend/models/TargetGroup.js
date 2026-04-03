const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, default: '' },
  position: { type: String, default: '' },
});

const targetGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  targets: [targetSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TargetGroup', targetGroupSchema);
