const express = require('express');
const router = express.Router();
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const SupplierTransaction = require('../models/SupplierTransaction');

// GET all movements (optionally filter by product)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.productId ? { product: req.query.productId } : {};
    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('product', 'name sku')
      .populate('supplier', 'name phone');
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - add stock (restock / adjustment)
router.post('/', async (req, res) => {
  const { productId, movementType, quantity, unitCost, note, supplierId, isCredit } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Adjust stock quantity
    const delta = movementType === 'adjustment'
      ? Number(quantity)
      : Math.abs(Number(quantity));

    await Product.findByIdAndUpdate(productId, { $inc: { stockQty: delta } });

    const movement = await StockMovement.create({
      product: productId,
      productName: product.name,
      movementType,
      quantity: delta,
      unitCost: unitCost || 0,
      note: note || '',
      supplier: supplierId || null,
      isCredit: isCredit || false,
    });

    // If credit restock, record a SupplierTransaction
    if (isCredit && supplierId) {
      const totalCost = delta * (unitCost || 0);
      await SupplierTransaction.create({
        supplier: supplierId,
        type: 'debt',
        amount: totalCost,
        note: `Credit restock — ${product.name} x${delta}`,
        stockMovement: movement._id,
      });
    }

    res.status(201).json(movement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;