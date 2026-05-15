const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  sale:       { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity:   { type: Number, required: true },
  unitPrice:  { type: Number, required: true },
  lineTotal:  { type: Number, required: true },
});

module.exports = mongoose.model('SaleItem', saleItemSchema);