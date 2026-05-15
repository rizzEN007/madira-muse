const mongoose = require('mongoose');

const supplierTransactionSchema = new mongoose.Schema(
  {
    supplier:      { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    type:          { type: String, enum: ['debt', 'payment'], required: true },
    amount:        { type: Number, required: true, min: 0 },
    note:          { type: String, trim: true, default: '' },
    stockMovement: { type: mongoose.Schema.Types.ObjectId, ref: 'StockMovement', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplierTransaction', supplierTransactionSchema);