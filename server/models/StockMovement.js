const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  { type: String, required: true },
  movementType: { type: String, enum: ['purchase', 'adjustment', 'sale', 'return'], required: true },
  quantity:     { type: Number, required: true },
  unitCost:     { type: Number, default: 0 },
  note:         { type: String, default: '' },
  supplier:     { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  isCredit:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);