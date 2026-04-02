const prisma = require('../../utils/prisma');

const getSummary = async () => {
  const records = await prisma.financialRecord.findMany({ where: { isDeleted: false } });
  let totalIncome = 0, totalExpenses = 0;
  records.forEach((r) => {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else totalExpenses += r.amount;
  });
  return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, recordCount: records.length };
};

const getByCategory = async () => {
  const records = await prisma.financialRecord.findMany({ where: { isDeleted: false } });
  const map = {};
  records.forEach((r) => {
    if (!map[r.category]) map[r.category] = { category: r.category, total: 0, count: 0 };
    map[r.category].total += r.amount;
    map[r.category].count += 1;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
};

const getTrends = async (year) => {
  const y = parseInt(year) || new Date().getFullYear();
  const from = new Date(`${y}-01-01`);
  const to = new Date(`${y}-12-31T23:59:59`);
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false, date: { gte: from, lte: to } },
  });

  const map = {};
  records.forEach((r) => {
    const month = r.date.toISOString().slice(0, 7);
    if (!map[month]) map[month] = { month, income: 0, expenses: 0, net: 0 };
    if (r.type === 'INCOME') map[month].income += r.amount;
    else map[month].expenses += r.amount;
    map[month].net = map[month].income - map[month].expenses;
  });

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
};

const getRecent = async () => {
  return prisma.financialRecord.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' },
    take: 10,
    include: { user: { select: { id: true, name: true } } },
  });
};

module.exports = { getSummary, getByCategory, getTrends, getRecent };
