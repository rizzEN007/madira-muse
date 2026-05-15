const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0 },
    category:    { type: String, enum: ['rent', 'utilities', 'supplies', 'salary', 'maintenance', 'other'], default: 'other' },
    paidTo:      { type: String, trim: true, default: '' },
    note:        { type: String, trim: true, default: '' },
    date:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);