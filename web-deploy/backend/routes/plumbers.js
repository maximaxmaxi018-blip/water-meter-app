import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get all plumbers
router.get('/', async (req, res) => {
  try {
    const plumbers = await dbAll('SELECT * FROM plumbers ORDER BY fullName');
    res.json(plumbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get plumber by ID
router.get('/:id', async (req, res) => {
  try {
    const plumber = await dbGet('SELECT * FROM plumbers WHERE id = ?', [req.params.id]);

    if (!plumber) {
      return res.status(404).json({ error: 'Plumber not found' });
    }

    res.json(plumber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create plumber (admin only)
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, specialization } = req.body;

    if (!fullName || !phone || !specialization) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = 'P' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO plumbers (id, fullName, phone, email, specialization, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, fullName, phone, email || null, specialization, now]
    );

    res.status(201).json({ id, message: 'Plumber created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update plumber (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, email, specialization, isActive } = req.body;

    const plumber = await dbGet('SELECT id FROM plumbers WHERE id = ?', [req.params.id]);
    if (!plumber) {
      return res.status(404).json({ error: 'Plumber not found' });
    }

    const updates = [];
    const values = [];

    if (fullName !== undefined) {
      updates.push('fullName = ?');
      values.push(fullName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (specialization !== undefined) {
      updates.push('specialization = ?');
      values.push(specialization);
    }
    if (isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(isActive ? 1 : 0);
    }

    values.push(req.params.id);

    await dbRun(`UPDATE plumbers SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Plumber updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete plumber (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const plumber = await dbGet('SELECT id FROM plumbers WHERE id = ?', [req.params.id]);
    if (!plumber) {
      return res.status(404).json({ error: 'Plumber not found' });
    }

    await dbRun('DELETE FROM plumbers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plumber deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
