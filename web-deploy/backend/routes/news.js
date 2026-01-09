import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get all news
router.get('/', async (req, res) => {
  try {
    const news = await dbAll('SELECT * FROM news ORDER BY createdAt DESC');
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get news by settlement
router.get('/settlement/:settlement', async (req, res) => {
  try {
    const news = await dbAll(
      'SELECT * FROM news WHERE settlement = ? OR settlement IS NULL ORDER BY createdAt DESC',
      [req.params.settlement]
    );
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get news by ID
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await dbGet('SELECT * FROM news WHERE id = ?', [req.params.id]);

    if (!newsItem) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(newsItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create news (admin only)
router.post('/', async (req, res) => {
  try {
    const { type, title, content, settlement, recoveryTime } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = 'N' + Date.now();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO news (id, type, title, content, settlement, recoveryTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, type, title, content, settlement || null, recoveryTime || null, now]
    );

    res.status(201).json({ id, message: 'News created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update news (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { type, title, content, settlement, recoveryTime } = req.body;

    const newsItem = await dbGet('SELECT id FROM news WHERE id = ?', [req.params.id]);
    if (!newsItem) {
      return res.status(404).json({ error: 'News not found' });
    }

    const updates = [];
    const values = [];

    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (settlement !== undefined) {
      updates.push('settlement = ?');
      values.push(settlement);
    }
    if (recoveryTime !== undefined) {
      updates.push('recoveryTime = ?');
      values.push(recoveryTime);
    }

    values.push(req.params.id);

    await dbRun(`UPDATE news SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'News updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete news (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const newsItem = await dbGet('SELECT id FROM news WHERE id = ?', [req.params.id]);
    if (!newsItem) {
      return res.status(404).json({ error: 'News not found' });
    }

    await dbRun('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
