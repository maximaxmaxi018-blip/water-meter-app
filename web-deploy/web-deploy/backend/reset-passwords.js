import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'water_meter.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    
    // Обнулить пароли для всех пользователей кроме админа
    db.run(`UPDATE users SET password = NULL WHERE accountNumber != 'ADMIN'`, function(err) {
      if (err) {
        console.error('Error resetting passwords:', err);
      } else {
        console.log('Passwords reset successfully for all users except ADMIN');
        console.log('Changes affected: ' + this.changes + ' rows');
      }
      db.close();
      process.exit(0);
    });
  }
});
