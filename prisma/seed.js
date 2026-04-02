require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = path.resolve(dbUrl.replace(/^file:/, ''));
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const adminPass = await bcrypt.hash('password123', 10);
  const analystPass = await bcrypt.hash('password123', 10);
  const viewerPass = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@demo.com', password: adminPass, role: 'ADMIN' },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@demo.com' },
    update: {},
    create: { name: 'Analyst User', email: 'analyst@demo.com', password: analystPass, role: 'ANALYST' },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@demo.com' },
    update: {},
    create: { name: 'Viewer User', email: 'viewer@demo.com', password: viewerPass, role: 'VIEWER' },
  });

  console.log('✅ Users created:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  // Create sample financial records
  const categories = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Sales', 'Freelance', 'Equipment', 'Software'];
  const records = [];

  // Generate ~50 records across 6 months for 2024
  for (let month = 1; month <= 6; month++) {
    // Income records
    records.push({ amount: 85000, type: 'INCOME', category: 'Salary', date: new Date(`2024-${String(month).padStart(2,'0')}-01`), notes: `Monthly salary for month ${month}`, createdBy: admin.id });
    records.push({ amount: Math.floor(Math.random() * 30000) + 10000, type: 'INCOME', category: 'Sales', date: new Date(`2024-${String(month).padStart(2,'0')}-15`), notes: 'Product sales revenue', createdBy: admin.id });
    if (month % 2 === 0) {
      records.push({ amount: Math.floor(Math.random() * 20000) + 5000, type: 'INCOME', category: 'Freelance', date: new Date(`2024-${String(month).padStart(2,'0')}-20`), notes: 'Freelance consulting', createdBy: admin.id });
    }

    // Expense records
    records.push({ amount: 30000, type: 'EXPENSE', category: 'Rent', date: new Date(`2024-${String(month).padStart(2,'0')}-05`), notes: 'Office rent', createdBy: admin.id });
    records.push({ amount: Math.floor(Math.random() * 5000) + 2000, type: 'EXPENSE', category: 'Utilities', date: new Date(`2024-${String(month).padStart(2,'0')}-10`), notes: 'Electricity and internet', createdBy: admin.id });
    records.push({ amount: Math.floor(Math.random() * 15000) + 5000, type: 'EXPENSE', category: 'Marketing', date: new Date(`2024-${String(month).padStart(2,'0')}-12`), notes: 'Digital marketing campaigns', createdBy: admin.id });
    records.push({ amount: Math.floor(Math.random() * 8000) + 2000, type: 'EXPENSE', category: 'Software', date: new Date(`2024-${String(month).padStart(2,'0')}-18`), notes: 'SaaS subscriptions', createdBy: admin.id });
    if (month % 3 === 0) {
      records.push({ amount: Math.floor(Math.random() * 25000) + 10000, type: 'EXPENSE', category: 'Equipment', date: new Date(`2024-${String(month).padStart(2,'0')}-25`), notes: 'Hardware purchase', createdBy: admin.id });
    }
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log(`✅ Created ${records.length} financial records`);

  console.log('\n📋 Demo credentials:');
  console.log('  Admin:   admin@demo.com   / password123');
  console.log('  Analyst: analyst@demo.com / password123');
  console.log('  Viewer:  viewer@demo.com  / password123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
