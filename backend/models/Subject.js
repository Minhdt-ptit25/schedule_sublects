const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  maMon: { type: String, required: true, index: true },
  tenMon: { type: String, required: true, index: true },
  khoa: { type: String, default: '' },
  he: { type: String, default: '' },
  nganh: { type: String, default: '', index: true },
  sySo: { type: Number, default: 40 },
  nhom: { type: String, default: '' },
  toHap: { type: String, default: '' },
  toTH: { type: String, default: '' },
  thu: { type: String, default: '', index: true },
  kip: { type: String, default: '', index: true },
  tietBD: { type: String, default: '' },
  soTiet: { type: String, default: '' },
  phong: { type: String, default: '' },
  nha: { type: String, default: '' },
  giangVien: { type: String, default: '' },
  tuanHoc: { type: String, default: '' },
  maLop: { type: String, default: '', index: true },
  soTC: { type: Number, default: 2 },
  daDangKyCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
