const recordsService = require('./records.service');
const { createRecordSchema, updateRecordSchema } = require('./records.schema');
const { success } = require('../../utils/response');

const list = async (req, res, next) => {
  try { return success(res, await recordsService.listRecords(req.query)); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { return success(res, await recordsService.getRecordById(req.params.id)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const data = createRecordSchema.parse(req.body);
    return success(res, await recordsService.createRecord(data, req.user.id), 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const data = updateRecordSchema.parse(req.body);
    return success(res, await recordsService.updateRecord(req.params.id, data));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { return success(res, await recordsService.deleteRecord(req.params.id)); } catch (e) { next(e); }
};

module.exports = { list, getById, create, update, remove };
