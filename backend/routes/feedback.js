import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get feedback for user
router.get('/user/:userId', async (req, res) => {
  try {
    const feedbacks = await dbAll(
      'SELECT * FROM feedbacks WHERE userId = ? ORDER BY createdAt DESC',
      [req.params.userId]
    );
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (admin only)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await dbAll(
      `SELECT f.*, u.accountNumber, u.fullName, u.email
       FROM feedbacks f 
       LEFT JOIN users u ON f.userId = u.id 
       ORDER BY f.createdAt DESC`
    );
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await dbGet('SELECT * FROM feedbacks WHERE id = ?', [req.params.id]);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create feedback
router.post('/', async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'User ID and text required' });
    }

    const id = 'F' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO feedbacks (id, userId, text, createdAt)
       VALUES (?, ?, ?, ?)`,
      [id, userId, text, now]
    );

    res.status(201).json({ id, message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update feedback (admin reply)
router.put('/:id', async (req, res) => {
  try {
    const { isRead, adminReply } = req.body;

    const feedback = await dbGet('SELECT id FROM feedbacks WHERE id = ?', [req.params.id]);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const updates = [];
    const values = [];

    if (isRead !== undefined) {
      updates.push('isRead = ?');
      values.push(isRead ? 1 : 0);
    }
    if (adminReply !== undefined) {
      updates.push('adminReply = ?');
      values.push(adminReply);
      updates.push('repliedAt = ?');
      values.push(new Date().toISOString());
    }

    values.push(req.params.id);

    await dbRun(`UPDATE feedbacks SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Feedback updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete feedback (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await dbGet('SELECT id FROM feedbacks WHERE id = ?', [req.params.id]);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await dbRun('DELETE FROM feedbacks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
