import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get applications for user
router.get('/user/:userId', async (req, res) => {
  try {
    const applications = await dbAll(
      `SELECT * FROM applications WHERE userId = ? ORDER BY createdAt DESC`,
      [req.params.userId]
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications (admin only)
router.get('/', async (req, res) => {
  try {
    const applications = await dbAll(
      `SELECT a.*, u.accountNumber, u.fullName, u.settlement, u.address, u.phone
       FROM applications a 
       LEFT JOIN users u ON a.userId = u.id 
       ORDER BY a.createdAt DESC`
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await dbGet(
      `SELECT a.*, u.fullName, u.settlement, u.address
       FROM applications a 
       LEFT JOIN users u ON a.userId = u.id 
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create application
router.post('/', async (req, res) => {
  try {
    const { userId, serviceType, meterType, deliveryAddress, deliveryVolume, contactPhone, preferredDateTime } = req.body;

    if (!userId || !serviceType || !contactPhone || !preferredDateTime) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = 'A' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO applications (id, userId, serviceType, meterType, deliveryAddress, deliveryVolume, contactPhone, preferredDateTime, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, serviceType, meterType || null, deliveryAddress || null, deliveryVolume || null, contactPhone, preferredDateTime, now, now]
    );

    res.status(201).json({ id, message: 'Application created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application
router.put('/:id', async (req, res) => {
  try {
    const { status, plumberId } = req.body;

    const application = await dbGet('SELECT id FROM applications WHERE id = ?', [req.params.id]);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (plumberId !== undefined) {
      updates.push('plumberId = ?');
      values.push(plumberId);
      updates.push('assignedAt = ?');
      values.push(new Date().toISOString());
    }

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(req.params.id);

    await dbRun(`UPDATE applications SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Application updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete application (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const application = await dbGet('SELECT id FROM applications WHERE id = ?', [req.params.id]);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await dbRun('DELETE FROM applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
