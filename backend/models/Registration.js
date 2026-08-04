const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentId: { type: String, required: true, default: 'B25DCCC145', index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  maMon: { type: String, required: true },
  tenMon: { type: String, required: true },
  maLop: { type: String, required: true },
  nhom: { type: String, default: '' },
  toTH: { type: String, default: '' },
  soTC: { type: Number, default: 0 },
  thu: { type: String, default: '' },
  kip: { type: String, default: '' },
  tietBD: { type: String, default: '' },
  soTiet: { type: String, default: '' },
  phong: { type: String, default: '' },
  nha: { type: String, default: '' },
  giangVien: { type: String, default: '' },
  tuanHoc: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
