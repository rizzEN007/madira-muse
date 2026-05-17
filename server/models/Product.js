const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  sku:               { type: String, required: true, unique: true },
  category:          { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  unit:              { type: String, default: 'bottle' },
  size:              { type: String, default: '' },
  bottleSizeMl:      { type: Number },
  costPrice:         { type: Number, required: true },
  sellingPrice:      { type: Number, required: true },
  caseQty:           { type: Number, default: null },
  casePrice:         { type: Number, default: null },
  stockQty:          { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  expiryDate:        { type: Date },
  isActive:          { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);