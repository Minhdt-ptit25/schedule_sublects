const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students/:studentId
router.get('/:studentId', async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Server error retrieving student' });
  }
});

module.exports = router;
