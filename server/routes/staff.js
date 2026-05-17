const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add staff
router.post('/', async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE soft delete
router.delete('/:id', async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Staff deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark attendance
router.post('/attendance', async (req, res) => {
  const { staffId, date, status, checkInTime, checkOutTime, note } = req.body;
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { staff: staffId, date },
      { status, checkInTime: checkInTime || '', checkOutTime: checkOutTime || '', note: note || '' },
      { upsert: true, new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET attendance for a specific month
router.get('/attendance', async (req, res) => {
  const { month, year } = req.query;
  try {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end   = `${year}-${String(month).padStart(2, '0')}-31`;
    const records = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('staff', 'name role monthlySalary');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET salary report for a month
router.get('/salary', async (req, res) => {
  const { month, year } = req.query;
  try {
    const staff = await Staff.find({ isActive: true });
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end   = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end }
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    const report = staff.map(s => {
      const records = attendanceRecords.filter(a => a.staff.toString() === s._id.toString());
      const present  = records.filter(r => r.status === 'present').length;
      const half     = records.filter(r => r.status === 'half').length;
      const absent   = records.filter(r => r.status === 'absent').length;
      const worked   = present + (half * 0.5);
      const salary   = Math.round((s.monthlySalary / daysInMonth) * worked);

      return {
        staff: s,
        present, half, absent,
        daysInMonth, worked,
        salary
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;