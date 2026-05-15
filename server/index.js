require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/products',   require('./routes/products'));
app.use('/api/sales',      require('./routes/sales'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/stock',      require('./routes/stock'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/expenses',   require('./routes/expenses'));
app.use('/api/staff',      require('./routes/staff'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));