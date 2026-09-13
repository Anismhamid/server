const Jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'safqa_token';

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies?.[AUTH_COOKIE_NAME];

        if (!token) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const payload = Jwt.verify(
            token,
            process.env.JWT_SECRET,
        );

        req.payload = payload;

        next();
    } catch (error) {
        console.error(
            'Auth middleware error:',
            error.message,
        );

        return res.status(401).json({
            success: false,
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message: 'Invalid or expired session',
        });
    }
};