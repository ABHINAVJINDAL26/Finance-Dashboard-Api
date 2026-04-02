const authService = require('./auth.service');
const { success } = require('../../utils/response');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
