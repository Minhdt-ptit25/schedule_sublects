const Student = require('../models/Student');

// @desc    Get student profile by studentId
// @route   GET /api/students/:studentId
exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    let student = await Student.findOne({ studentId });
    if (!student) {
      student = await Student.create({
        studentId,
        fullName: 'Đinh Tuấn Minh',
        classCode: 'D25DCCC145_1',
        major: 'Công nghệ thông tin',
        faculty: 'CNTT1'
      });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('[studentController.getStudentProfile Error]', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin sinh viên' });
  }
};
