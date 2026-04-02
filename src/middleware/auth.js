const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Missing or invalid Authorization header', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'UNAUTHORIZED', 'Token is invalid or has expired', 401);
  }
};

module.exports = { authenticate };
