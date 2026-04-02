const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');

const safeUser = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role, isActive: u.isActive, createdAt: u.createdAt,
});

const listUsers = async () => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(safeUser);
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { const e = new Error('User not found'); e.statusCode = 404; e.code = 'NOT_FOUND'; throw e; }
  return safeUser(user);
};

const createUser = async ({ name, email, password, role = 'VIEWER' }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { const e = new Error('Email already registered'); e.statusCode = 409; e.code = 'CONFLICT'; throw e; }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
  return safeUser(user);
};

const updateUser = async (id, data) => {
  await getUserById(id);
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.update({ where: { id }, data });
  return safeUser(user);
};

const updateStatus = async (id, isActive) => {
  await getUserById(id);
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  return safeUser(user);
};

const deleteUser = async (id) => {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
  return { message: 'User deleted successfully' };
};

module.exports = { listUsers, getUserById, createUser, updateUser, updateStatus, deleteUser };
