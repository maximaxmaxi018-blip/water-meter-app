const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'water_meter.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking admin users in database...');

db.all("SELECT accountNumber, isAdmin, password FROM users WHERE accountNumber LIKE '%ADMIN%' OR isAdmin = 1", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Admin users found:', rows);
    if (rows.length === 0) {
      console.log('No admin users found. Creating default admin...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(
        "INSERT INTO users (id, accountNumber, fullName, password, isAdmin, settlement, address, phone, email, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['admin_001', 'ADMIN', 'Администратор системы', hashedPassword, 1, 'г. Питкяранта', 'Офис', '+7 921 000-00-00', 'admin@example.com', new Date().toISOString()],
        function(err) {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('✓ Default admin created successfully');
            console.log('Login: ADMIN');
            console.log('Password: admin123');
          }
          db.close();
        }
      );
    } else {
      db.close();
    }
  }
});