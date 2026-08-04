const Subject = require('../models/Subject');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const cleanStr = (val) => {
  if (val === null || val === undefined) return '';
  let s = String(val).trim();
  if (s.endsWith('.0')) s = s.slice(0, -2);
  return s;
};

const formatKhoa = (val) => {
  if (!val) return '';
  let s = cleanStr(val);
  if (s.toLowerCase().startsWith('khóa')) s = s.slice(4).trim();
  else if (s.toLowerCase().startsWith('k')) s = s.slice(1).trim();
  if (/^\d{4}$/.test(s)) return `D${s.slice(2)}`;
  if (/^\d{2}$/.test(s)) return `D${s}`;
  if (s.toUpperCase().startsWith('D')) return s.toUpperCase();
  return `D${s}`;
};

// @desc    Get all subjects with filters (Khoa, MonHoc, Nganh, Thu, Kip, Search)
// @route   GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const { search, khoa, monHoc, nganh, thu, kip, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { maMon: searchRegex },
        { tenMon: searchRegex },
        { maLop: searchRegex },
        { giangVien: searchRegex },
        { phong: searchRegex }
      ];
    }

    if (khoa && khoa !== 'ALL') {
      const targetKhoa = formatKhoa(khoa);
      query.khoa = new RegExp(`^${targetKhoa}$|^${khoa}$`, 'i');
    }

    if (monHoc && monHoc !== 'ALL') {
      query.maMon = new RegExp(`^${monHoc.trim()}$`, 'i');
    }

    if (nganh && nganh !== 'ALL') {
      query.nganh = new RegExp(`^${nganh.trim()}$`, 'i');
    }

    if (thu && thu !== 'ALL') {
      query.thu = String(thu).trim();
    }

    if (kip && kip !== 'ALL') {
      query.kip = String(kip).trim();
    }

    const total = await Subject.countDocuments(query);

    let subjects;
    let pageNum = Math.max(1, parseInt(page) || 1);
    let limitNum = limit === 'ALL' || limit === '0' ? total : Math.max(1, parseInt(limit) || 10);
    
    if (limit === 'ALL' || limit === '0' || limitNum >= total) {
      subjects = await Subject.find(query).sort({ khoa: 1, maMon: 1, nhom: 1 });
      pageNum = 1;
      limitNum = total || 1;
    } else {
      const skip = (pageNum - 1) * limitNum;
      subjects = await Subject.find(query)
        .sort({ khoa: 1, maMon: 1, nhom: 1 })
        .skip(skip)
        .limit(limitNum);
    }

    const totalPages = limit === 'ALL' || limit === '0' ? 1 : (Math.ceil(total / limitNum) || 1);

    const rawKhoaList = await Subject.distinct('khoa');
    const khoaList = Array.from(new Set(rawKhoaList.map(formatKhoa).filter(Boolean))).sort();
    const majors = await Subject.distinct('nganh');

    // Build subject list query dependent on BOTH selected Khoa AND Nganh
    let depQuery = {};
    if (khoa && khoa !== 'ALL') {
      const targetKhoa = formatKhoa(khoa);
      depQuery.khoa = new RegExp(`^${targetKhoa}$|^${khoa}$`, 'i');
    }
    if (nganh && nganh !== 'ALL') {
      depQuery.nganh = new RegExp(`^${nganh.trim()}$`, 'i');
    }

    const subjectListRaw = await Subject.find(depQuery).select('maMon tenMon khoa nganh').lean();
    
    const subjectMap = new Map();
    subjectListRaw.forEach(item => {
      if (item.maMon && item.tenMon && !subjectMap.has(item.maMon)) {
        subjectMap.set(item.maMon, { maMon: item.maMon, tenMon: item.tenMon, khoa: formatKhoa(item.khoa), nganh: item.nganh });
      }
    });
    const subjectList = Array.from(subjectMap.values()).sort((a, b) => a.tenMon.localeCompare(b.tenMon));

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limit === 'ALL' ? 'ALL' : limitNum,
      totalPages,
      khoaList,
      majors: majors.filter(Boolean).sort(),
      subjectList,
      data: subjects.map(s => ({
        ...s.toObject(),
        khoa: formatKhoa(s.khoa)
      }))
    });
  } catch (error) {
    console.error('[subjectController.getSubjects Error]', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách môn học' });
  }
};

// @desc    Get metadata
// @route   GET /api/subjects/metadata
exports.getMetadata = async (req, res) => {
  try {
    const { khoa, nganh } = req.query;
    const rawKhoaList = await Subject.distinct('khoa');
    const khoaList = Array.from(new Set(rawKhoaList.map(formatKhoa).filter(Boolean))).sort();
    const majors = await Subject.distinct('nganh');

    let depQuery = {};
    if (khoa && khoa !== 'ALL') {
      const targetKhoa = formatKhoa(khoa);
      depQuery.khoa = new RegExp(`^${targetKhoa}$|^${khoa}$`, 'i');
    }
    if (nganh && nganh !== 'ALL') {
      depQuery.nganh = new RegExp(`^${nganh.trim()}$`, 'i');
    }

    const subjectListRaw = await Subject.find(depQuery).select('maMon tenMon khoa nganh').lean();
    
    const subjectMap = new Map();
    subjectListRaw.forEach(item => {
      if (item.maMon && item.tenMon && !subjectMap.has(item.maMon)) {
        subjectMap.set(item.maMon, { maMon: item.maMon, tenMon: item.tenMon });
      }
    });
    const subjectList = Array.from(subjectMap.values()).sort((a, b) => a.tenMon.localeCompare(b.tenMon));

    res.json({
      success: true,
      khoaList,
      majors: majors.filter(Boolean).sort(),
      subjectList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh mục Khóa & Môn' });
  }
};

// @desc    Upload Excel File and Import Subject Data into MongoDB
// @route   POST /api/subjects/upload-excel
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp Excel (.xlsx)' });
    }

    const uploadedFilePath = req.file.path;
    console.log(`[Upload Excel] Reading file: ${uploadedFilePath}...`);

    const workbook = XLSX.readFile(uploadedFilePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const subjects = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !Array.isArray(r) || r.length < 3) continue;

      const maMon = cleanStr(r[1]);
      const tenMon = cleanStr(r[2]);

      if (!maMon || !tenMon || maMon.startsWith('#') || maMon === 'Mã môn học' || maMon.includes('STT')) {
        continue;
      }

      const khoa = formatKhoa(r[3]);
      const he = cleanStr(r[4]);
      const nganh = cleanStr(r[5]);
      
      let sySo = 40;
      if (r[6] !== undefined && r[6] !== null && !isNaN(r[6])) {
        sySo = parseInt(r[6]);
      }

      const nhom = cleanStr(r[7]);
      const toHap = cleanStr(r[8]);
      const toTH = cleanStr(r[9]);
      const thu = cleanStr(r[10]);
      const kip = cleanStr(r[11]);
      const tietBD = cleanStr(r[13]);
      const soTiet = cleanStr(r[14]);
      const phong = cleanStr(r[15]);
      const nha = cleanStr(r[16]);
      const giangVien = cleanStr(r[18]);

      let tuanList = [];
      for (let colI = 22; colI < Math.min(40, r.length); colI++) {
        const val = r[colI];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          tuanList.push(colI - 21);
        }
      }
      let tuanHoc = tuanList.length > 0 ? tuanList.join(' ') : '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15';

      let maLop = cleanStr(r[39]) || cleanStr(r[41]) || `${maMon}_${nhom}`;

      let soTC = 3;
      if (toTH !== '' || tenMon.toLowerCase().includes('thực hành')) {
        soTC = 0;
      } else if (r[42] !== undefined && r[42] !== null && !isNaN(r[42])) {
        soTC = parseInt(r[42]);
      }

      subjects.push({
        maMon,
        tenMon,
        khoa,
        he,
        nganh,
        sySo,
        nhom,
        toHap,
        toTH,
        thu,
        kip,
        tietBD,
        soTiet,
        phong,
        nha,
        giangVien,
        tuanHoc,
        maLop,
        soTC,
        daDangKyCount: Math.min(sySo, Math.abs(hashCode(maLop)) % Math.max(1, sySo))
      });
    }

    function hashCode(str) {
      let hash = 0;
      for (let j = 0; j < str.length; j++) {
        hash = (hash << 5) - hash + str.charCodeAt(j);
        hash |= 0;
      }
      return hash;
    }

    console.log(`[Upload Excel] Extracted ${subjects.length} valid subjects from Excel.`);

    if (subjects.length === 0) {
      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ 
        success: false, 
        message: 'Không tìm thấy dữ liệu môn học hợp lệ trong tệp Excel đã tải lên.' 
      });
    }

    await Subject.deleteMany({});
    await Subject.insertMany(subjects);

    if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      count: subjects.length,
      message: `Đã nạp thành công ${subjects.length} lớp môn học từ tệp Excel!`
    });

  } catch (err) {
    console.error('[Upload Excel Error]', err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Lỗi bóc tách tệp Excel: ' + err.message });
  }
};
