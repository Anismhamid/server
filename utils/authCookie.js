const AUTH_COOKIE_NAME = 'safqa_token';

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
});

/**
 * خيارات المسح — يجب أن تتطابق مع خيارات set
 * لكن بدون maxAge (أو مع expires في الماضي).
 */
const getClearCookieOptions = () => {
    const { maxAge, ...options } = getCookieOptions();

    return {
        ...options,
        expires: new Date(0), // ← بديل صريح
    };
};

const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
};

module.exports = {
    AUTH_COOKIE_NAME,
    setAuthCookie,
    clearAuthCookie,
};
