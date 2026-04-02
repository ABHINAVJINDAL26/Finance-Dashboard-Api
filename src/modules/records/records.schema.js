const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  notes: z.string().optional(),
});

const updateRecordSchema = createRecordSchema.partial();

module.exports = { createRecordSchema, updateRecordSchema };
