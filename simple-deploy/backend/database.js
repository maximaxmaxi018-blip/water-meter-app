import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'water_meter.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.serialize(() => {
      initializeDatabase();
    });
  }
});

// Promisify database methods
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

function initializeDatabase() {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      accountNumber TEXT UNIQUE NOT NULL,
      fullName TEXT,
      address TEXT,
      settlement TEXT DEFAULT 'Питкяранта',
      phone TEXT,
      email TEXT,
      password TEXT,
      hasDualMeters BOOLEAN DEFAULT 0,
      isLegalEntity BOOLEAN DEFAULT 0,
      legalEntityType TEXT,
      companyName TEXT,
      inn TEXT,
      avatarUrl TEXT,
      themeColor TEXT DEFAULT 'blue',
      weatherProvider TEXT DEFAULT 'open-meteo',
      isAdmin BOOLEAN DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  // Таблица показаний
  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      coldWater REAL NOT NULL,
      hotWater REAL NOT NULL,
      coldWater2 REAL,
      hotWater2 REAL,
      submissionDate TEXT NOT NULL,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Таблица заявок
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      meterType TEXT,
      deliveryAddress TEXT,
      deliveryVolume REAL,
      contactPhone TEXT NOT NULL,
      preferredDateTime TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      plumberId TEXT,
      assignedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Таблица новостей
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      settlement TEXT,
      recoveryTime TEXT,
      createdAt TEXT
    )
  `);

  // Таблица обратной связи
  db.run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      text TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      adminReply TEXT,
      repliedAt TEXT,
      isUserRead BOOLEAN DEFAULT 0,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Таблица сантехников
  db.run(`
    CREATE TABLE IF NOT EXISTS plumbers (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      specialization TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt TEXT
    )
  `, () => {
    // После создания всех таблиц, вставить или обновить администратора
    const adminPassword = bcryptjs.hashSync('admin123', 10);
    
    // Сначала проверяем, существует ли админ пользователь
    db.get('SELECT * FROM users WHERE accountNumber = ?', ['ADMIN'], (err, existingAdmin) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }
      
      if (existingAdmin) {
        // Обновляем существующего админа
        db.run(
          `UPDATE users SET fullName = ?, address = ?, settlement = ?, phone = ?, email = ?, password = ?, isAdmin = ?, themeColor = ?, weatherProvider = ?, hasDualMeters = ?, updatedAt = ? WHERE accountNumber = ?`,
          [
            'Администратор Системы',
            'ул. Ленина, д. 13',
            'г. Питкяранта',
            '+7 921 466-82-39',
            'pitkaranta_hoz@mail.ru',
            adminPassword,
            1,
            'blue',
            'open-meteo',
            0,
            new Date().toISOString(),
            'ADMIN'
          ],
          (err) => {
            if (err) {
              console.error('Error updating admin user:', err);
            } else {
              console.log('Database tables initialized successfully (admin user updated)');
            }
          }
        );
      } else {
        // Вставляем нового админа
        db.run(
          `INSERT INTO users 
          (id, accountNumber, fullName, address, settlement, phone, email, password, isAdmin, themeColor, weatherProvider, hasDualMeters, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'admin',
            'ADMIN',
            'Администратор Системы',
            'ул. Ленина, д. 13',
            'г. Питкяранта',
            '+7 921 466-82-39',
            'pitkaranta_hoz@mail.ru',
            adminPassword,
            1,
            'blue',
            'open-meteo',
            0,
            new Date().toISOString(),
            new Date().toISOString()
          ],
          (err) => {
            if (err) {
              console.error('Error inserting admin user:', err);
            } else {
              console.log('Database tables initialized successfully (admin user created)');
            }
          }
        );
      }
    });
  });
}

export default db;
