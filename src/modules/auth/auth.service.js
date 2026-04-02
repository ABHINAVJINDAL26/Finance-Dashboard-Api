const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');

const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'CONFLICT';
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: 'VIEWER' },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, name: user.name, role: user.role } };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe };
