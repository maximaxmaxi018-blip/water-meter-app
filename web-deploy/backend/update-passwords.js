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
    
    // Обновить пароли для импортированных пользователей на "NOTSET" для первого входа
    db.run(`UPDATE users SET password = 'NOTSET' WHERE accountNumber IN ('100129', '100130', '100132')`, function(err) {
      if (err) {
        console.error('Error updating passwords:', err);
      } else {
        console.log(`✓ Updated ${this.changes} users - set password to NOTSET for first login`);
      }
      db.close();
      process.exit(0);
    });
  }
});
