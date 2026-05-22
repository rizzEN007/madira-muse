const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNo:     { type: String, required: true, unique: true },
  subtotal:      { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  taxableAmount: { type: Number, default: 0 },
  vatAmount:     { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cash' },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  isCredit:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);