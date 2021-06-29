const express = require('express');

const userController = require('../controllers/user-controller');


const router = express.Router();

router.post('/addUser', userController.addUser);

module.exports = router;