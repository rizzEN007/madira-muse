const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff:         { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date:          { type: String, required: true },
  status:        { type: String, enum: ['present', 'absent', 'half'], required: true },
  checkInTime:   { type: String, default: '' },
  checkOutTime:  { type: String, default: '' },
  note:          { type: String, default: '' },
}, { timestamps: true });

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);