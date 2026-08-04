const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET /api/subjects
router.get('/', async (req, res) => {
  try {
    const { search, nganh, thu, kip, page = 1, limit = 100 } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { maMon: searchRegex },
        { tenMon: searchRegex },
        { maLop: searchRegex },
        { giangVien: searchRegex },
        { phong: searchRegex }
      ];
    }

    if (nganh && nganh !== 'ALL') {
      query.nganh = nganh;
    }

    if (thu && thu !== 'ALL') {
      query.thu = thu;
    }

    if (kip && kip !== 'ALL') {
      query.kip = kip;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Subject.countDocuments(query);
    const subjects = await Subject.find(query)
      .sort({ maMon: 1, nhom: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get unique list of majors
    const majors = await Subject.distinct('nganh');

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      majors: majors.filter(Boolean).sort(),
      data: subjects
    });
  } catch (error) {
    console.error('[API GET /subjects Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving subjects' });
  }
});

// GET /api/subjects/majors
router.get('/majors', async (req, res) => {
  try {
    const majors = await Subject.distinct('nganh');
    res.json({ success: true, data: majors.filter(Boolean).sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving majors' });
  }
});

module.exports = router;
