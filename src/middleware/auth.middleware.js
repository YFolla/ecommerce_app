const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({
        status: 'error',
        message: 'Authentication required'
    });
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({
        status: 'error',
        message: 'Admin access required'
    });
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 