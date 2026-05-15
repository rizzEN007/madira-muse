const mongoose = require('mongoose');

const customerTransactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    type:     { type: String, enum: ['credit', 'payment'], required: true },
    amount:   { type: Number, required: true, min: 0 },
    note:     { type: String, trim: true, default: '' },
    sale:     { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomerTransaction', customerTransactionSchema);