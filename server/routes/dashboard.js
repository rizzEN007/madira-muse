const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Expense = require('../models/Expenses');

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();

    // Build date range from query params or fall back to defaults
    const from = req.query.from ? new Date(req.query.from) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to   = req.query.to   ? new Date(req.query.to)   : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Ensure `to` covers the full end day (set to midnight of next day)
    const toEnd = new Date(to);
    toEnd.setDate(toEnd.getDate() + 1);

    const dateFilter = { createdAt: { $gte: from, $lt: toEnd } };

    // Revenue within selected range
    const rangeSales = await Sale.find(dateFilter);
    const rangeRevenue = rangeSales.reduce((sum, s) => sum + s.total, 0);

    // Sales count within selected range
    const totalSales = await Sale.countDocuments(dateFilter);

    // Low stock — always global, not date filtered
    const lowStock = await Product.find({
      $expr: { $lte: ['$stockQty', '$lowStockThreshold'] },
      isActive: true
    }).select('name sku stockQty lowStockThreshold');

    // Top selling products within selected range
    const rangeSaleIds = rangeSales.map(s => s._id);
    const topProducts = await SaleItem.aggregate([
      { $match: { sale: { $in: rangeSaleIds } } },
      { $group: { _id: '$productName', totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$lineTotal' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    // Chart — split selected range into intervals
    const diffMs   = toEnd - from;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const chartData = [];

    if (diffDays <= 7) {
      // Day by day
      for (let i = 0; i < diffDays; i++) {
        const day  = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
        const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i + 1);
        const daySales = await Sale.find({ createdAt: { $gte: day, $lt: next } });
        const revenue  = daySales.reduce((sum, s) => sum + s.total, 0);
        chartData.push({
          date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue
        });
      }
    } else if (diffDays <= 31) {
      // Week by week
      for (let i = 0; i < diffDays; i += 7) {
        const weekStart = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
        const weekEnd   = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i + 7);
        const weekSales = await Sale.find({ createdAt: { $gte: weekStart, $lt: weekEnd } });
        const revenue   = weekSales.reduce((sum, s) => sum + s.total, 0);
        chartData.push({
          date: `W${Math.floor(i / 7) + 1} ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          revenue
        });
      }
    } else {
      // Month by month
      const startMonth = from.getMonth();
      const startYear  = from.getFullYear();
      const endMonth   = toEnd.getMonth();
      const endYear    = toEnd.getFullYear();
      const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

      for (let i = 0; i < totalMonths; i++) {
        const mStart = new Date(startYear, startMonth + i, 1);
        const mEnd   = new Date(startYear, startMonth + i + 1, 1);
        const mSales = await Sale.find({ createdAt: { $gte: mStart, $lt: mEnd } });
        const revenue = mSales.reduce((sum, s) => sum + s.total, 0);
        chartData.push({
          date: mStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue
        });
      }
    }

    // Total expenses in selected range
const expenses = await Expense.find({
  date: { $gte: from, $lt: toEnd }
});
const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
const profit = rangeRevenue - totalExpenses;

    res.json({ rangeRevenue, totalSales, totalExpenses, profit, lowStock, topProducts, last7Days: chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent sales — filtered by date range if provided
router.get('/recent', async (req, res) => {
  try {
    const now = new Date();
    const from = req.query.from ? new Date(req.query.from) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to   = req.query.to   ? new Date(req.query.to)   : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const toEnd = new Date(to);
    toEnd.setDate(toEnd.getDate() + 1);

    const sales = await Sale.find({ createdAt: { $gte: from, $lt: toEnd } })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;