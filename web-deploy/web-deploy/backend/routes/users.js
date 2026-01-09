import express from 'express';
import bcryptjs from 'bcryptjs';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, accountNumber, fullName, settlement, address, phone, email, 
              hasDualMeters, isLegalEntity, legalEntityType, companyName, isAdmin,
              CASE WHEN password IS NOT NULL AND password != 'NOTSET' THEN 1 ELSE 0 END as passwordSet,
              updatedAt
       FROM users WHERE isAdmin = 0 ORDER BY accountNumber`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await dbGet(
      `SELECT id, accountNumber, fullName, settlement, address, phone, email, 
              hasDualMeters, isLegalEntity, legalEntityType, companyName, avatarUrl,
              themeColor, weatherProvider 
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/', async (req, res) => {
  try {
    const { accountNumber, fullName, settlement, address, phone, email, password } = req.body;

    if (!accountNumber || !fullName) {
      return res.status(400).json({ error: 'Account number and full name required' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE accountNumber = ?', [accountNumber]);
    if (existingUser) {
      return res.status(400).json({ error: 'Account number already exists' });
    }

    const id = 'u' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO users (id, accountNumber, fullName, settlement, address, phone, email, password, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, accountNumber, fullName, settlement, address, phone, email, password || 'default123', now, now]
    );

    res.status(201).json({ id, accountNumber, fullName, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { fullName, settlement, address, phone, email, hasDualMeters, avatarUrl, themeColor, weatherProvider, newPassword } = req.body;

    const user = await dbGet('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (fullName !== undefined) {
      updates.push('fullName = ?');
      values.push(fullName);
    }
    if (settlement !== undefined) {
      updates.push('settlement = ?');
      values.push(settlement);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (hasDualMeters !== undefined) {
      updates.push('hasDualMeters = ?');
      values.push(hasDualMeters ? 1 : 0);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatarUrl = ?');
      values.push(avatarUrl);
    }
    if (themeColor !== undefined) {
      updates.push('themeColor = ?');
      values.push(themeColor);
    }
    if (weatherProvider !== undefined) {
      updates.push('weatherProvider = ?');
      values.push(weatherProvider);
    }
    if (newPassword !== undefined && newPassword) {
      const hashedPassword = bcryptjs.hashSync(newPassword, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(req.params.id);

    await dbRun(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import users from CSV
router.post('/import', async (req, res) => {
  try {
    const { users: usersToImport } = req.body;
    
    if (!Array.isArray(usersToImport) || usersToImport.length === 0) {
      return res.status(400).json({ error: 'No users to import' });
    }

    const importedIds = [];
    for (const userData of usersToImport) {
      const { accountNumber, fullName, settlement, address, phone, email } = userData;
      
      console.log('Importing user:', { accountNumber, fullName, settlement, address, phone, email });
      
      if (!accountNumber) continue;
      
      // Check if user already exists
      const existingUser = await dbGet('SELECT id FROM users WHERE accountNumber = ?', [accountNumber]);
      
      if (!existingUser) {
        // Create new user with generated password
        const id = 'u' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const now = new Date().toISOString();
        
        // Generate default password for imported users
        const defaultPassword = 'temp' + Math.random().toString(36).slice(2, 10);
        const hashedPassword = bcryptjs.hashSync(defaultPassword, 10);
        
        // Ensure fullName is not null/undefined
        const finalFullName = fullName && fullName.trim() ? fullName.trim() : 'ФИО не указано';
        const finalAddress = address && address.trim() ? address.trim() : '';
        const finalSettlement = settlement && settlement.trim() ? settlement.trim() : 'г. Питкяранта';
        const finalPhone = phone && phone.trim() ? phone.trim() : '';
        const finalEmail = email && email.trim() ? email.trim() : '';
        
        await dbRun(
          `INSERT INTO users (id, accountNumber, fullName, address, settlement, phone, email, password, isAdmin, hasDualMeters, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
          [id, accountNumber, finalFullName, finalAddress, finalSettlement, finalPhone, finalEmail, hashedPassword, now, now]
        );
        importedIds.push(id);
      }
    }

    res.json({ 
      message: `Imported ${importedIds.length} users successfully`,
      count: importedIds.length 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
