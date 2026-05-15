const express = require('express');
const router  = express.Router();
const Supplier            = require('../models/Supplier');
const SupplierTransaction = require('../models/SupplierTransaction');

// GET all active suppliers with running balance
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });

    const withBalance = await Promise.all(suppliers.map(async (s) => {
      const txns = await SupplierTransaction.find({ supplier: s._id });
      const balance = txns.reduce((sum, t) => {
        return t.type === 'debt' ? sum + t.amount : sum - t.amount;
      }, 0);
      return { ...s.toObject(), balance };
    }));

    res.json(withBalance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE soft delete
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Supplier deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions for a supplier
router.get('/:id/transactions', async (req, res) => {
  try {
    const txns = await SupplierTransaction.find({ supplier: req.params.id })
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add debt or payment transaction
router.post('/:id/transactions', async (req, res) => {
  try {
    const { type, amount, note, stockMovement } = req.body;
    if (!['debt', 'payment'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type.' });
    }
    const txn = new SupplierTransaction({
      supplier: req.params.id, type, amount, note,
      stockMovement: stockMovement || null
    });
    await txn.save();

    // Return updated balance
    const txns = await SupplierTransaction.find({ supplier: req.params.id });
    const balance = txns.reduce((sum, t) => {
      return t.type === 'debt' ? sum + t.amount : sum - t.amount;
    }, 0);

    res.status(201).json({ transaction: txn, balance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;