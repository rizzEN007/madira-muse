const express = require('express');
const router  = express.Router();
const Customer            = require('../models/Customer');
const CustomerTransaction = require('../models/CustomerTransaction');

// GET all active customers with running balance
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true }).sort({ name: 1 });

    // Calculate balance for each customer from transactions
    const withBalance = await Promise.all(customers.map(async (c) => {
      const txns = await CustomerTransaction.find({ customer: c._id });
      const balance = txns.reduce((sum, t) => {
        return t.type === 'credit' ? sum + t.amount : sum - t.amount;
      }, 0);
      return { ...c.toObject(), balance };
    }));

    res.json(withBalance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE soft delete
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Customer deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions for a customer
router.get('/:id/transactions', async (req, res) => {
  try {
    const txns = await CustomerTransaction.find({ customer: req.params.id })
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add credit or payment transaction
router.post('/:id/transactions', async (req, res) => {
  try {
    const { type, amount, note, sale } = req.body;
    if (!['credit', 'payment'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type.' });
    }
    const txn = new CustomerTransaction({
      customer: req.params.id, type, amount, note, sale: sale || null
    });
    await txn.save();

    // Return updated balance
    const txns = await CustomerTransaction.find({ customer: req.params.id });
    const balance = txns.reduce((sum, t) => {
      return t.type === 'credit' ? sum + t.amount : sum - t.amount;
    }, 0);

    res.status(201).json({ transaction: txn, balance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;