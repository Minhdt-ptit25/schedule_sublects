const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Subject = require('../models/Subject');

// GET /api/registrations/:studentId
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const registrations = await Registration.find({ studentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error('[API GET /registrations Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving registrations' });
  }
});

// POST /api/registrations
router.post('/', async (req, res) => {
  try {
    const { studentId = 'B25DCCC145', subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'subjectId is required' });
    }

    const targetSubject = await Subject.findById(subjectId);
    if (!targetSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if capacity full
    if (targetSubject.daDangKyCount >= targetSubject.sySo) {
      return res.status(400).json({ success: false, message: 'Lớp học phần này đã hết chỗ (Sỹ số tối đa)' });
    }

    // Get current registrations of student
    const currentRegs = await Registration.find({ studentId });

    // Check if already registered this subject code (maMon)
    const existingSameSubject = currentRegs.find(r => r.maMon === targetSubject.maMon);
    if (existingSameSubject) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã đăng ký môn [${targetSubject.maMon} - ${targetSubject.tenMon}] ở lớp ${existingSameSubject.maLop} rồi!`
      });
    }

    // Check schedule conflict (cùng Thứ và trùng Kíp)
    const conflictingReg = currentRegs.find(r => {
      if (!r.thu || !targetSubject.thu) return false;
      if (r.thu === targetSubject.thu) {
        // Same day of week, check if same shift (kip) or overlapping lessons
        if (r.kip === targetSubject.kip) return true;
        if (r.tietBD && targetSubject.tietBD) {
          const rStart = parseInt(r.tietBD);
          const rEnd = rStart + (parseInt(r.soTiet) || 2) - 1;
          const tStart = parseInt(targetSubject.tietBD);
          const tEnd = tStart + (parseInt(targetSubject.soTiet) || 2) - 1;
          return !(rEnd < tStart || tEnd < rStart);
        }
      }
      return false;
    });

    if (conflictingReg) {
      return res.status(400).json({
        success: false,
        conflict: true,
        conflictingSubject: conflictingReg,
        message: `⚠️ Trùng lịch với môn [${conflictingReg.maMon} - ${conflictingReg.tenMon} (Thứ ${conflictingReg.thu}, Kíp ${conflictingReg.kip})] đã đăng ký!`
      });
    }

    // Create registration
    const newReg = await Registration.create({
      studentId,
      subjectId: targetSubject._id,
      maMon: targetSubject.maMon,
      tenMon: targetSubject.tenMon,
      maLop: targetSubject.maLop,
      nhom: targetSubject.nhom,
      soTC: targetSubject.soTC,
      thu: targetSubject.thu,
      kip: targetSubject.kip,
      tietBD: targetSubject.tietBD,
      soTiet: targetSubject.soTiet,
      phong: targetSubject.phong,
      giangVien: targetSubject.giangVien
    });

    // Increment count
    targetSubject.daDangKyCount += 1;
    await targetSubject.save();

    res.json({
      success: true,
      message: `Đăng ký thành công môn [${targetSubject.maMon} - ${targetSubject.tenMon}]!`,
      data: newReg
    });

  } catch (error) {
    console.error('[API POST /registrations Error]', error);
    res.status(500).json({ success: false, message: 'Server error processing registration' });
  }
});

// DELETE /api/registrations/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Registration.findById(id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration entry not found' });
    }

    // Decrement count
    const subject = await Subject.findById(reg.subjectId);
    if (subject && subject.daDangKyCount > 0) {
      subject.daDangKyCount -= 1;
      await subject.save();
    }

    await Registration.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Đã hủy đăng ký môn [${reg.maMon} - ${reg.tenMon}] thành công!`
    });
  } catch (error) {
    console.error('[API DELETE /registrations Error]', error);
    res.status(500).json({ success: false, message: 'Server error cancelling registration' });
  }
});

module.exports = router;
