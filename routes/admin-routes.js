const express = require('express');

const userController = require('../controllers/user-controller');
const checkAuth = require('../middlewares/auth');


const router = express.Router();

router.get('/getAvailableSoltOfDay/:professorId/:classRoomId/:day', userController.getAvailableSoltOfDay); //TODO: added to the protected resource

router.get('/availableProfessorForWeek', userController.availableProfessorForWeek);

router.get('/availableClassRoomForWeek', userController.availableClassRoomForWeek);

router.use(checkAuth);

router.post('/addUser', userController.addUser);

module.exports = router;