const { error } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'FORBIDDEN', 'You do not have permission to perform this action', 403);
    }
    next();
  };
};

module.exports = { authorize };
