import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
router.post('/login', async (req, res) => {
  try {
    const { accountNumber, password } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ error: 'Account number required' });
    }

    let user = await dbGet('SELECT * FROM users WHERE accountNumber = ?', [accountNumber]);

    console.log('User found:', user);
    console.log('Password in DB:', user?.password);

    // Если пользователя нет - создаем его
    if (!user) {
      const defaultPassword = 'temp' + Math.random().toString(36).slice(2, 10);
      const hashedPassword = bcryptjs.hashSync(defaultPassword, 10);
      
      const id = 'user_' + Date.now();
      await dbRun(
        `INSERT INTO users (id, accountNumber, password, isAdmin, hasDualMeters, createdAt) 
         VALUES (?, ?, ?, 0, 0, ?)`,
        [id, accountNumber, hashedPassword, new Date().toISOString()]
      );

      user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);

      const token = jwt.sign(
        { id: user.id, accountNumber: user.accountNumber, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        isFirstLogin: true,
        tempPassword: defaultPassword,
        message: 'Первый вход. Используется временный пароль. Измените пароль в настройках.',
        user: {
          id: user.id,
          accountNumber: user.accountNumber,
          fullName: user.fullName,
          settlement: user.settlement,
          address: user.address,
          phone: user.phone,
          email: user.email,
          isAdmin: user.isAdmin,
          avatarUrl: user.avatarUrl,
          themeColor: user.themeColor,
          weatherProvider: user.weatherProvider,
          hasDualMeters: user.hasDualMeters
        }
      });
    }

    // Пользователь существует - проверяем пароль
    // Если пароль не установлен (первый вход) - не требуем его
    if (!user.password || user.password === 'NOTSET' || user.password === '' || user.password === 'null') {
      // Первый вход - генерируем и устанавливаем временный пароль
      const defaultPassword = 'temp' + Math.random().toString(36).slice(2, 10);
      const hashedPassword = bcryptjs.hashSync(defaultPassword, 10);
      
      await dbRun('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?', [
        hashedPassword,
        new Date().toISOString(),
        user.id
      ]);

      const token = jwt.sign(
        { id: user.id, accountNumber: user.accountNumber, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        isFirstLogin: true,
        tempPassword: defaultPassword,
        message: 'Первый вход. Используется временный пароль. Измените пароль в настройках.',
        user: {
          id: user.id,
          accountNumber: user.accountNumber,
          fullName: user.fullName,
          settlement: user.settlement,
          address: user.address,
          phone: user.phone,
          email: user.email,
          isAdmin: user.isAdmin,
          avatarUrl: user.avatarUrl,
          themeColor: user.themeColor,
          weatherProvider: user.weatherProvider,
          hasDualMeters: user.hasDualMeters
        }
      });
    }

    // Пароль существует - проверяем его (для повторных входов)
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const passwordValid = bcryptjs.compareSync(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    console.log('✓ Password valid for user:', user.accountNumber, 'isAdmin:', user.isAdmin, 'type:', typeof user.isAdmin);

    const isAdmin = !!user.isAdmin;
    console.log('✓ isAdmin converted to boolean:', isAdmin);

    const token = jwt.sign(
      { id: user.id, accountNumber: user.accountNumber, isAdmin: isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const responseData = {
      token,
      isFirstLogin: false,
      user: {
        id: user.id,
        accountNumber: user.accountNumber,
        fullName: user.fullName,
        settlement: user.settlement,
        address: user.address,
        phone: user.phone,
        email: user.email,
        isAdmin: isAdmin,
        avatarUrl: user.avatarUrl,
        themeColor: user.themeColor,
        weatherProvider: user.weatherProvider,
        hasDualMeters: user.hasDualMeters
      }
    };
    
    console.log('✓ Returning login response with isAdmin:', responseData.user.isAdmin, 'type:', typeof responseData.user.isAdmin);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { accountNumber, oldPassword, newPassword } = req.body;

    if (!accountNumber || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE accountNumber = ?', [accountNumber]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordValid = bcryptjs.compareSync(oldPassword, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);

    await dbRun('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?', [
      hashedPassword,
      new Date().toISOString(),
      user.id
    ]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
