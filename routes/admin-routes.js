const express = require('express');

const userController = require('../controllers/user-controller');
const checkAuth = require('../middlewares/auth');


const router = express.Router();

router.use(checkAuth);

router.post('/addUser', userController.addUser);

module.exports = router;