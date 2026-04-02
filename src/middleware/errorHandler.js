const { ZodError } = require('zod');
const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return error(res, 'VALIDATION_ERROR', 'Invalid input data', 400, details);
  }

  if (err.statusCode) {
    return error(res, err.code || 'ERROR', err.message, err.statusCode);
  }

  return error(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
};

module.exports = { errorHandler };
