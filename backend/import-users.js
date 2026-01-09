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
    
    // Данные пользователей для импорта
    const users = [
      {
        accountNumber: '100129',
        fullName: 'Лапина Марина Юрьевна',
        address: 'п. САЛМИ, ул. ЛЕСНАЯ, д. 12, кв. 11',
        phone: '+7 921 456-78-90',
        email: 'lapina.m@example.com'
      },
      {
        accountNumber: '100130',
        fullName: 'Иван Петров',
        address: 'г. ПИТКЯРАНТА, ул. ЛЕНИНА, 25',
        phone: '+7 921 123-45-67',
        email: 'ivan.petrov@example.com'
      },
      {
        accountNumber: '100132',
        fullName: 'Ксим Романов',
        address: 'г. ПИТКЯРАНТА, ул. ЛЕНИНА, 15',
        phone: '+7 921 234-56-78',
        email: 'ksim.romanov@example.com'
      }
    ];

    let imported = 0;
    let failed = 0;

    users.forEach(user => {
      db.run(
        `INSERT INTO users (id, accountNumber, fullName, address, settlement, phone, email, password, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
          user.accountNumber,
          user.fullName,
          user.address,
          'г. Питкяранта',
          user.phone,
          user.email,
          'NOTSET', // Special marker for first login (will be replaced by backend)
          new Date().toISOString(),
          new Date().toISOString()
        ],
        (err) => {
          if (err) {
            console.error(`Failed to import user ${user.accountNumber}:`, err.message);
            failed++;
          } else {
            console.log(`✓ Imported user ${user.accountNumber} - ${user.fullName}`);
            imported++;
          }

          if (imported + failed === users.length) {
            console.log(`\nImport complete: ${imported} users imported, ${failed} failed`);
            db.close();
            process.exit(0);
          }
        }
      );
    });
  }
});
