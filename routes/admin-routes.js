const express = require('express');

const userController = require('../controllers/user-controller');
const checkAuth = require('../middlewares/auth');


const router = express.Router();

router.get("/fetchAllProWithLectures", userController.fetchAllProWithLectures);

router.use(checkAuth);

router.post('/addUser', userController.addUser);

router.get('/getAvailableSoltOfDay/:professorId/:classRoomId/:day', userController.getAvailableSoltOfDay);

router.get('/availableProfessorForWeek', userController.availableProfessorForWeek);

router.get('/availableClassRoomForWeek', userController.availableClassRoomForWeek);

module.exports = router;