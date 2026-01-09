import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get readings for user
router.get('/user/:userId', async (req, res) => {
  try {
    const readings = await dbAll(
      `SELECT * FROM readings WHERE userId = ? ORDER BY submissionDate DESC`,
      [req.params.userId]
    );
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all readings (admin only)
router.get('/', async (req, res) => {
  try {
    const readings = await dbAll(
      `SELECT r.*, u.accountNumber, u.fullName, u.settlement, u.address 
       FROM readings r 
       LEFT JOIN users u ON r.userId = u.id 
       ORDER BY r.submissionDate DESC`
    );
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reading by ID
router.get('/:id', async (req, res) => {
  try {
    const reading = await dbGet('SELECT * FROM readings WHERE id = ?', [req.params.id]);

    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create reading
router.post('/', async (req, res) => {
  try {
    const { userId, coldWater, hotWater, coldWater2, hotWater2 } = req.body;

    if (!userId || coldWater === undefined || hotWater === undefined) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = 'R' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO readings (id, userId, coldWater, hotWater, coldWater2, hotWater2, submissionDate, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, coldWater, hotWater, coldWater2 || null, hotWater2 || null, now, now]
    );

    res.status(201).json({ id, message: 'Reading created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reading
router.put('/:id', async (req, res) => {
  try {
    const { coldWater, hotWater, coldWater2, hotWater2 } = req.body;

    const reading = await dbGet('SELECT id FROM readings WHERE id = ?', [req.params.id]);
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    const updates = [];
    const values = [];

    if (coldWater !== undefined) {
      updates.push('coldWater = ?');
      values.push(coldWater);
    }
    if (hotWater !== undefined) {
      updates.push('hotWater = ?');
      values.push(hotWater);
    }
    if (coldWater2 !== undefined) {
      updates.push('coldWater2 = ?');
      values.push(coldWater2);
    }
    if (hotWater2 !== undefined) {
      updates.push('hotWater2 = ?');
      values.push(hotWater2);
    }

    values.push(req.params.id);

    await dbRun(`UPDATE readings SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Reading updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reading (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const reading = await dbGet('SELECT id FROM readings WHERE id = ?', [req.params.id]);
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    await dbRun('DELETE FROM readings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reading deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
