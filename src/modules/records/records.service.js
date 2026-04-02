const prisma = require('../../utils/prisma');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

const listRecords = async ({ type, category, from, to, page, limit }) => {
  const p = Math.max(1, parseInt(page) || PAGINATION_DEFAULTS.PAGE);
  const l = Math.min(parseInt(limit) || PAGINATION_DEFAULTS.LIMIT, PAGINATION_DEFAULTS.MAX_LIMIT);

  const where = { isDeleted: false };
  if (type) where.type = type;
  if (category) where.category = { equals: category };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where, skip: (p - 1) * l, take: l,
      orderBy: { date: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return { records, pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
};

const getRecordById = async (id) => {
  const record = await prisma.financialRecord.findFirst({ where: { id, isDeleted: false } });
  if (!record) { const e = new Error('Record not found'); e.statusCode = 404; e.code = 'NOT_FOUND'; throw e; }
  return record;
};

const createRecord = async (data, userId) => {
  return prisma.financialRecord.create({
    data: { ...data, date: new Date(data.date), createdBy: userId },
  });
};

const updateRecord = async (id, data) => {
  await getRecordById(id);
  if (data.date) data.date = new Date(data.date);
  return prisma.financialRecord.update({ where: { id }, data });
};

const deleteRecord = async (id) => {
  await getRecordById(id);
  await prisma.financialRecord.update({ where: { id }, data: { isDeleted: true } });
  return { message: 'Record deleted successfully' };
};

module.exports = { listRecords, getRecordById, createRecord, updateRecord, deleteRecord };
