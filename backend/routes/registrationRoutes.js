const express = require('express');
const router = express.Router();
const { getRegistrations, registerSubject, cancelRegistration } = require('../controllers/registrationController');

router.get('/:studentId', getRegistrations);
router.post('/', registerSubject);
router.delete('/:id', cancelRegistration);

module.exports = router;
