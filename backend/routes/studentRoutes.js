const express = require('express');
const router = express.Router();
const { getStudentProfile } = require('../controllers/studentController');

router.get('/:studentId', getStudentProfile);

module.exports = router;
