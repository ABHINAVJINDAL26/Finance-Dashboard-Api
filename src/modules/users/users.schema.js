const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

module.exports = { createUserSchema, updateUserSchema, updateStatusSchema };
