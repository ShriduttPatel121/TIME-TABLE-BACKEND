const express = require('express');

const lectureController = require('../controllers/lecture-controller');


const router = express.Router();

router.post('/addClass', lectureController.addClass);

module.exports = router;