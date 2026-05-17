const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const CustomerTransaction = require('../models/CustomerTransaction');

// POST - complete a sale
router.post('/', async (req, res) => {
  const { items, discount, paymentMethod, customerId, isCredit } = req.body;

  try {
    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const total = subtotal - (discount || 0);

    // Generate invoice number
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const count = await Sale.countDocuments();
    const invoiceNo = `MM-${month}-${year}-${String(count + 1).padStart(4, '0')}`;

    // Create sale — if credit sale, payment method is 'credit'
    const sale = await Sale.create({
      invoiceNo,
      subtotal,
      discount: discount || 0,
      total,
      paymentMethod: isCredit ? 'credit' : paymentMethod,
      customer: customerId || null,
      isCredit: isCredit || false,
    });

    // Create sale items and deduct stock
    for (const item of items) {
      await SaleItem.create({
        sale: sale._id,
        product: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      });

      await Product.findByIdAndUpdate(item.productId, {
         $inc: { stockQty: -(item.qtyDeduct || item.quantity) }
      });
    }

    // If credit sale, record a CustomerTransaction
    if (isCredit && customerId) {
      await CustomerTransaction.create({
        customer: customerId,
        type: 'credit',
        amount: total,
        note: `Credit sale — Invoice ${invoiceNo}`,
        sale: sale._id,
      });
    }

    res.status(201).json({ sale, invoiceNo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - recent sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - single sale with items
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer', 'name phone');
    const items = await SaleItem.find({ sale: req.params.id });
    res.json({ sale, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;