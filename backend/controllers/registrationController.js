const Registration = require('../models/Registration');
const Subject = require('../models/Subject');

// @desc    Get student's registered subjects
// @route   GET /api/registrations/:studentId
exports.getRegistrations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const registrations = await Registration.find({ studentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error('[registrationController.getRegistrations Error]', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy môn đã đăng ký' });
  }
};

const checkIsTH = (sub) => {
  if (!sub) return false;
  const nameStr = (sub.tenMon || '').toLowerCase();
  return !!(sub.toTH || nameStr.includes('thực hành') || nameStr.includes('thí nghiệm') || (sub.maLop || '').toLowerCase().includes('th'));
};

// @desc    Register a subject (with schedule conflict & same group check)
// @route   POST /api/registrations
exports.registerSubject = async (req, res) => {
  try {
    const { studentId = 'B25DCCC145', subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID môn học' });
    }

    const targetSubject = await Subject.findById(subjectId);
    if (!targetSubject) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy môn học phần' });
    }

    if (targetSubject.daDangKyCount >= targetSubject.sySo) {
      return res.status(400).json({ success: false, message: 'Lớp học phần này đã hết chỗ' });
    }

    const currentRegs = await Registration.find({ studentId });

    // Check same subject code & same group rules
    const sameMonRegs = currentRegs.filter(r => r.maMon === targetSubject.maMon);
    
    if (sameMonRegs.length > 0) {
      // 1. Must belong to the SAME group (cùng nhóm)
      const diffGroupReg = sameMonRegs.find(r => r.nhom && targetSubject.nhom && r.nhom !== targetSubject.nhom);
      if (diffGroupReg) {
        return res.status(400).json({
          success: false,
          message: `⚠️ Môn [${targetSubject.tenMon}] yêu cầu Lý thuyết và Thực hành phải thuộc CÙNG NHÓM (Đã chọn Nhóm ${diffGroupReg.nhom}). Không thể chọn Nhóm ${targetSubject.nhom}!`
        });
      }

      // 2. Cannot register 2 Theory or 2 Practice classes for the same subject
      const targetIsTH = checkIsTH(targetSubject);
      if (targetIsTH) {
        const existingTH = sameMonRegs.find(r => checkIsTH(r));
        if (existingTH) {
          return res.status(400).json({
            success: false,
            message: `Bạn đã đăng ký Tổ Thực hành cho môn [${targetSubject.tenMon}] ở lớp ${existingTH.maLop} rồi!`
          });
        }
      } else {
        const existingLT = sameMonRegs.find(r => !checkIsTH(r));
        if (existingLT) {
          return res.status(400).json({
            success: false,
            message: `Bạn đã đăng ký lớp Lý thuyết cho môn [${targetSubject.tenMon}] ở lớp ${existingLT.maLop} rồi!`
          });
        }
      }
    }

    // Check conflict (cùng Thứ và trùng Kíp/Tiết)
    const conflictingReg = currentRegs.find(r => {
      if (!r.thu || !targetSubject.thu) return false;
      if (r.thu === targetSubject.thu) {
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

    // Create registration record
    const newReg = await Registration.create({
      studentId,
      subjectId: targetSubject._id,
      maMon: targetSubject.maMon,
      tenMon: targetSubject.tenMon,
      maLop: targetSubject.maLop,
      nhom: targetSubject.nhom,
      toTH: targetSubject.toTH,
      soTC: targetSubject.soTC,
      thu: targetSubject.thu,
      kip: targetSubject.kip,
      tietBD: targetSubject.tietBD,
      soTiet: targetSubject.soTiet,
      phong: targetSubject.phong,
      nha: targetSubject.nha,
      giangVien: targetSubject.giangVien,
      tuanHoc: targetSubject.tuanHoc
    });

    targetSubject.daDangKyCount += 1;
    await targetSubject.save();

    let autoPairMsg = '';

    // Smart Auto-pairing in Backend Database
    if (targetSubject.nhom) {
      const isTargetTH = checkIsTH(targetSubject);
      
      if (isTargetTH) {
        // User registered TH -> Check if matching LT is already registered
        const hasLTReg = sameMonRegs.some(r => !checkIsTH(r));
        if (!hasLTReg) {
          const allSameGroup = await Subject.find({ maMon: targetSubject.maMon, nhom: targetSubject.nhom });
          const matchingLT = allSameGroup.find(s => !checkIsTH(s) && String(s._id) !== String(targetSubject._id));
          
          if (matchingLT && matchingLT.daDangKyCount < matchingLT.sySo) {
            const ltConflict = currentRegs.find(r => {
              if (!r.thu || !matchingLT.thu) return false;
              if (r.thu === matchingLT.thu) {
                if (r.kip === matchingLT.kip) return true;
                if (r.tietBD && matchingLT.tietBD) {
                  const rStart = parseInt(r.tietBD);
                  const rEnd = rStart + (parseInt(r.soTiet) || 2) - 1;
                  const tStart = parseInt(matchingLT.tietBD);
                  const tEnd = tStart + (parseInt(matchingLT.soTiet) || 2) - 1;
                  return !(rEnd < tStart || tEnd < rStart);
                }
              }
              return false;
            });

            if (!ltConflict) {
              await Registration.create({
                studentId,
                subjectId: matchingLT._id,
                maMon: matchingLT.maMon,
                tenMon: matchingLT.tenMon,
                maLop: matchingLT.maLop,
                nhom: matchingLT.nhom,
                toTH: matchingLT.toTH,
                soTC: matchingLT.soTC,
                thu: matchingLT.thu,
                kip: matchingLT.kip,
                tietBD: matchingLT.tietBD,
                soTiet: matchingLT.soTiet,
                phong: matchingLT.phong,
                nha: matchingLT.nha,
                giangVien: matchingLT.giangVien,
                tuanHoc: matchingLT.tuanHoc
              });
              matchingLT.daDangKyCount += 1;
              await matchingLT.save();
              autoPairMsg = ` ➕ Đã tự động xếp luôn lớp Lý thuyết đi kèm (Nhóm ${targetSubject.nhom})!`;
            }
          }
        }
      } else {
        // User registered LT -> Check if matching TH is already registered
        const hasTHReg = sameMonRegs.some(r => checkIsTH(r));
        if (!hasTHReg) {
          const allSameGroup = await Subject.find({ maMon: targetSubject.maMon, nhom: targetSubject.nhom });
          const matchingTHs = allSameGroup.filter(s => checkIsTH(s) && String(s._id) !== String(targetSubject._id));

          if (matchingTHs.length === 1 && matchingTHs[0].daDangKyCount < matchingTHs[0].sySo) {
            const singleTH = matchingTHs[0];
            const thConflict = currentRegs.find(r => {
              if (!r.thu || !singleTH.thu) return false;
              if (r.thu === singleTH.thu) {
                if (r.kip === singleTH.kip) return true;
                if (r.tietBD && singleTH.tietBD) {
                  const rStart = parseInt(r.tietBD);
                  const rEnd = rStart + (parseInt(r.soTiet) || 2) - 1;
                  const tStart = parseInt(singleTH.tietBD);
                  const tEnd = tStart + (parseInt(singleTH.soTiet) || 2) - 1;
                  return !(rEnd < tStart || tEnd < rStart);
                }
              }
              return false;
            });

            if (!thConflict) {
              await Registration.create({
                studentId,
                subjectId: singleTH._id,
                maMon: singleTH.maMon,
                tenMon: singleTH.tenMon,
                maLop: singleTH.maLop,
                nhom: singleTH.nhom,
                toTH: singleTH.toTH,
                soTC: singleTH.soTC,
                thu: singleTH.thu,
                kip: singleTH.kip,
                tietBD: singleTH.tietBD,
                soTiet: singleTH.soTiet,
                phong: singleTH.phong,
                nha: singleTH.nha,
                giangVien: singleTH.giangVien,
                tuanHoc: singleTH.tuanHoc
              });
              singleTH.daDangKyCount += 1;
              await singleTH.save();
              autoPairMsg = ` ➕ Đã tự động xếp luôn Tổ Thực hành đi kèm (Tổ ${singleTH.toTH || '01'}, Nhóm ${targetSubject.nhom})!`;
            }
          } else if (matchingTHs.length > 1) {
            autoPairMsg = ` 💡 Gợi ý: Hãy chọn tiếp 1 Tổ Thực hành thuộc Nhóm ${targetSubject.nhom} trong danh sách!`;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Đăng ký thành công môn [${targetSubject.maMon} - ${targetSubject.tenMon}]!${autoPairMsg}`,
      data: newReg
    });
  } catch (error) {
    console.error('[registrationController.registerSubject Error]', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký môn' });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Registration.findById(id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi đăng ký' });
    }

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
    console.error('[registrationController.cancelRegistration Error]', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi hủy môn học' });
  }
};
