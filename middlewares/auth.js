const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('auth failed');
        }

        const decodedToken = jwt.verify(token, "TOKEN SECRET KEY DO NOT SHARE");
        req.userData = decodedToken
        next();
    } catch (e) {
        return next(new HttpError('Not authenticated request', 401));
    }
    
}