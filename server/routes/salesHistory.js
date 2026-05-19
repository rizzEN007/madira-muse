const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Expense = require('../models/Expenses');

// Nepali BS date conversion
function adToBS(date) {
  const adDate = new Date(date);
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth() + 1;
  const adDay = adDate.getDate();

  const bsData = [
    [2000, 9, 17], [2001, 9, 17], [2002, 9, 17], [2003, 9, 17], [2004, 9, 17],
    [2005, 9, 17], [2006, 9, 17], [2007, 9, 17], [2008, 9, 17], [2009, 9, 17],
    [2010, 9, 17], [2011, 9, 17], [2012, 9, 17], [2013, 9, 17], [2014, 9, 17],
    [2015, 9, 17], [2016, 9, 17], [2017, 9, 17], [2018, 9, 17], [2019, 9, 17],
    [2020, 9, 17], [2021, 9, 17], [2022, 9, 17], [2023, 9, 17], [2024, 9, 17],
    [2025, 9, 17],
  ];

  // Simple offset: BS = AD + 56 years, 8 months, 17 days approx
  // Use nepali-date library approach: fixed epoch
  const epochAD = new Date(1943, 3, 14); // AD 1943-04-14 = BS 2000-01-01
  const diffMs = adDate - epochAD;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const bsMonthDays = [
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2000
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2001
    [31,32,31,32,31,30,30,30,29,29,30,30], // 2002
    [30,32,31,32,31,30,30,30,29,30,29,31], // 2003
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2004
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2005
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2006
    [30,32,31,32,31,30,30,30,29,30,29,31], // 2007
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2008
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2009
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2010
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2011
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2012
    [31,32,31,32,31,30,30,30,29,30,29,31], // 2013
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2014
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2015
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2016
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2017
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2018
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2019
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2020
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2021
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2022
    [31,31,32,31,31,31,30,29,30,29,30,30], // 2023
    [31,31,32,32,31,30,30,29,30,29,30,30], // 2024
    [31,32,31,32,31,30,30,30,29,29,30,31], // 2025
  ];

  let bsYear = 2000;
  let remaining = diffDays;

  for (let y = 0; y < bsMonthDays.length; y++) {
    const daysInYear = bsMonthDays[y].reduce((a, b) => a + b, 0);
    if (remaining < daysInYear) {
      bsYear = 2000 + y;
      for (let m = 0; m < 12; m++) {
        if (remaining < bsMonthDays[y][m]) {
          return {
            year: bsYear,
            month: m + 1,
            day: remaining + 1,
            formatted: `${bsYear}-${String(m + 1).padStart(2, '0')}-${String(remaining + 1).padStart(2, '0')} BS`
          };
        }
        remaining -= bsMonthDays[y][m];
      }
    }
    remaining -= daysInYear;
  }

  return { year: bsYear, month: 1, day: 1, formatted: `${bsYear}-01-01 BS` };
}

// GET sales history with filters
router.get('/', async (req, res) => {
  try {
    const { from, to, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        filter.createdAt.$lt = toDate;
      }
    }

    if (search) {
      filter.invoiceNo = { $regex: search, $options: 'i' };
    }

    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const salesWithBS = sales.map(s => ({
      ...s.toObject(),
      bsDate: adToBS(s.createdAt),
    }));

    res.json({ sales: salesWithBS, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET closing balance — daily, weekly, monthly
router.get('/closing', async (req, res) => {
  try {
    const { type, date } = req.query;
    const ref = date ? new Date(date) : new Date();

    let from, to;

    if (type === 'daily') {
      from = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
      to   = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 1);
    } else if (type === 'weekly') {
      const day = ref.getDay();
      from = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - day);
      to   = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - day + 7);
    } else {
      from = new Date(ref.getFullYear(), ref.getMonth(), 1);
      to   = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    }

    const sales = await Sale.find({ createdAt: { $gte: from, $lt: to } });
    const saleIds = sales.map(s => s._id);
    const items = await SaleItem.find({ sale: { $in: saleIds } });
    const expenses = await Expense.find({ date: { $gte: from, $lt: to } });

    const totalRevenue  = sales.reduce((sum, s) => sum + s.total, 0);
    const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cashSales     = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const cardSales     = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
    const esewaS        = sales.filter(s => s.paymentMethod === 'esewa').reduce((sum, s) => sum + s.total, 0);
    const creditSales   = sales.filter(s => s.isCredit).reduce((sum, s) => sum + s.total, 0);
    const profit        = totalRevenue - totalExpenses;

    // Top items
    const itemMap = {};
    items.forEach(i => {
      if (!itemMap[i.productName]) itemMap[i.productName] = { qty: 0, revenue: 0 };
      itemMap[i.productName].qty += i.quantity;
      itemMap[i.productName].revenue += i.lineTotal;
    });
    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      type, from, to,
      bsFrom: adToBS(from),
      bsTo: adToBS(to),
      totalSales: sales.length,
      totalRevenue, totalDiscount, totalExpenses,
      cashSales, cardSales, esewaS, creditSales,
      profit, topItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single sale detail
router.get('/:id', async (req, res) => {
  try {
    const sale  = await Sale.findById(req.params.id).populate('customer', 'name phone');
    const items = await SaleItem.find({ sale: req.params.id });
    res.json({ sale: { ...sale.toObject(), bsDate: adToBS(sale.createdAt) }, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;