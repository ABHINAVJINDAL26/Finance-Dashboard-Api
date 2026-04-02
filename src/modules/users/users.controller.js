const usersService = require('./users.service');
const { createUserSchema, updateUserSchema, updateStatusSchema } = require('./users.schema');
const { success } = require('../../utils/response');

const list = async (req, res, next) => {
  try { return success(res, await usersService.listUsers()); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { return success(res, await usersService.getUserById(req.params.id)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    return success(res, await usersService.createUser(data), 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);
    return success(res, await usersService.updateUser(req.params.id, data));
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { isActive } = updateStatusSchema.parse(req.body);
    return success(res, await usersService.updateStatus(req.params.id, isActive));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { return success(res, await usersService.deleteUser(req.params.id)); } catch (e) { next(e); }
};

module.exports = { list, getById, create, update, updateStatus, remove };
