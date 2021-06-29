const express = require('express');

const lectureController = require('../controllers/lecture-controller');
const checkAuth = require('../middlewares/auth');


const router = express.Router();

router.get('/today/:userType/:userId', lectureController.getTodayLecture);

router.use(checkAuth);

router.post('/addClass', lectureController.addClass);

router.post('/assignProfessor', lectureController.assignLecture);



module.exports = router;