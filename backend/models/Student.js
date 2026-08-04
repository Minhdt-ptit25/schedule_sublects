const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  classCode: { type: String, default: 'D23CCPM01' },
  major: { type: String, default: 'Công nghệ phần mềm' },
  faculty: { type: String, default: 'Công nghệ thông tin 1' },
  maxCredits: { type: Number, default: 30 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
