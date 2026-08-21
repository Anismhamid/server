const setPermission = (permission) => {
    return (req, res, next) => {
        req.permission = permission;
        next();
    };
};