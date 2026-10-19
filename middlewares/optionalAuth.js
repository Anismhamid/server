const Jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'safqa_token';

module.exports = async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
        req.payload = null;
        return next();
    }

    try {
        req.payload = Jwt.verify(token, process.env.JWT_SECRET);

        return next();
    } catch (error) {
        req.payload = null;
        return next();
    }
};
