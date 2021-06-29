const express = require('express');

const checkAuth = require('../middlewares/auth');
const lectureController = require('../controllers/lecture-controller');

const router = express.Router();

router.get('/today/:userType/:userId', lectureController.getTodayLecture); //TODO: added to the protected resource

router.get('/week/:userType/:userId', lectureController.getWeekLectures); //TODO: added to the protected resource

router.use(checkAuth);

router.post('/addClass', lectureController.addClass);

router.post('/assignProfessor', lectureController.assignLecture);




module.exports = router;