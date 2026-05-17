const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET a setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json(setting || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST set/update a setting
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST verify PIN
router.post('/verify-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    const setting = await Settings.findOne({ key: 'owner_pin' });
    if (!setting) return res.json({ valid: false, notSet: true });
    res.json({ valid: setting.value === pin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;