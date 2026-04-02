const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = path.resolve(dbUrl.replace(/^file:/, ''));

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
