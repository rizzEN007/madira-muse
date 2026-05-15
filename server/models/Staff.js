const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  role:          { type: String, default: 'Staff' },
  phone:         { type: String },
  monthlySalary: { type: Number, required: true },
  joinDate:      { type: Date, default: Date.now },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);