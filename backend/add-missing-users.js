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
    
    // Недостающие абоненты от 100100 до 100128
    const missingUsers = [
      { accountNumber: '100100', fullName: 'Иванов Иван Иванович', address: 'г. Питкяранта, ул. Ленина, 1', phone: '+7 921 111-11-11', email: 'ivanov100@example.com' },
      { accountNumber: '100101', fullName: 'Сидоров Петр Петрович', address: 'г. Питкяранта, ул. Ленина, 2', phone: '+7 921 111-11-12', email: 'sidorov101@example.com' },
      { accountNumber: '100102', fullName: 'Федоров Сергей Сергеевич', address: 'г. Питкяранта, ул. Ленина, 3', phone: '+7 921 111-11-13', email: 'fedorov102@example.com' },
      { accountNumber: '100104', fullName: 'Алексеев Алексей Алексеевич', address: 'г. Питкяранта, ул. Советская, 4', phone: '+7 921 111-11-14', email: 'alex104@example.com' },
      { accountNumber: '100105', fullName: 'Васильев Василий Васильевич', address: 'г. Питкяранта, ул. Советская, 5', phone: '+7 921 111-11-15', email: 'vasil105@example.com' },
      { accountNumber: '100106', fullName: 'Дмитриев Дмитрий Дмитриевич', address: 'г. Питкяранта, ул. Советская, 6', phone: '+7 921 111-11-16', email: 'dmitri106@example.com' },
      { accountNumber: '100107', fullName: 'Еремин Евгений Евгеньевич', address: 'г. Питкяранта, ул. Советская, 7', phone: '+7 921 111-11-17', email: 'eremin107@example.com' },
      { accountNumber: '100108', fullName: 'Филипов Филипп Филипповский', address: 'г. Питкяранта, ул. Советская, 8', phone: '+7 921 111-11-18', email: 'filipov108@example.com' },
      { accountNumber: '100109', fullName: 'Геращенко Геннадий Геннадьевич', address: 'г. Питкяранта, ул. Советская, 9', phone: '+7 921 111-11-19', email: 'gerash109@example.com' },
      { accountNumber: '100110', fullName: 'Харитонов Харитон Харитонович', address: 'г. Питкяранта, ул. Советская, 10', phone: '+7 921 111-11-20', email: 'khariton110@example.com' },
      { accountNumber: '100111', fullName: 'Иванушкин Иван Иванушкинич', address: 'г. Питкяранта, ул. Советская, 11', phone: '+7 921 111-11-21', email: 'ivanushkin111@example.com' },
      { accountNumber: '100112', fullName: 'Яковлев Яков Яковлевич', address: 'г. Питкяранта, ул. Советская, 12', phone: '+7 921 111-11-22', email: 'yakovlev112@example.com' },
      { accountNumber: '100113', fullName: 'Константинов Константин Константинович', address: 'г. Питкяранта, ул. Советская, 13', phone: '+7 921 111-11-23', email: 'konstantinov113@example.com' },
      { accountNumber: '100114', fullName: 'Леонтьев Леонтий Леонтьевич', address: 'г. Питкяранта, ул. Советская, 14', phone: '+7 921 111-11-24', email: 'leontiev114@example.com' },
      { accountNumber: '100115', fullName: 'Мартынов Мартын Мартынович', address: 'г. Питкяранта, ул. Советская, 15', phone: '+7 921 111-11-25', email: 'martynov115@example.com' },
      { accountNumber: '100117', fullName: 'Никифоров Никифор Никифорович', address: 'г. Питкяранта, ул. Советская, 17', phone: '+7 921 111-11-27', email: 'nikiforov117@example.com' },
      { accountNumber: '100118', fullName: 'Октябрьский Октябрь Октябринович', address: 'г. Питкяранта, ул. Советская, 18', phone: '+7 921 111-11-28', email: 'oktyabrski118@example.com' },
      { accountNumber: '100119', fullName: 'Панов Павел Павлович', address: 'г. Питкяранта, ул. Советская, 19', phone: '+7 921 111-11-29', email: 'panov119@example.com' },
      { accountNumber: '100120', fullName: 'Радушкин Радий Радиевич', address: 'г. Питкяранта, ул. Советская, 20', phone: '+7 921 111-11-30', email: 'radushkin120@example.com' },
      { accountNumber: '100121', fullName: 'Сафронов Сафроний Сафроньевич', address: 'г. Питкяранта, ул. Советская, 21', phone: '+7 921 111-11-31', email: 'safronov121@example.com' },
      { accountNumber: '100122', fullName: 'Тарасов Тарас Тарасович', address: 'г. Питкяранта, ул. Советская, 22', phone: '+7 921 111-11-32', email: 'tarasov122@example.com' },
      { accountNumber: '100123', fullName: 'Ульянов Ульян Ульянович', address: 'г. Питкяранта, ул. Советская, 23', phone: '+7 921 111-11-33', email: 'ulyanov123@example.com' },
      { accountNumber: '100124', fullName: 'Федоров Федор Федорович', address: 'г. Питкяранта, ул. Советская, 24', phone: '+7 921 111-11-34', email: 'fedorov124@example.com' },
      { accountNumber: '100125', fullName: 'Хромов Хром Хромович', address: 'г. Питкяранта, ул. Советская, 25', phone: '+7 921 111-11-35', email: 'khromov125@example.com' },
      { accountNumber: '100126', fullName: 'Цветков Цветан Цветанович', address: 'г. Питкяранта, ул. Советская, 26', phone: '+7 921 111-11-36', email: 'tsvetkov126@example.com' },
      { accountNumber: '100127', fullName: 'Чистяков Чистяк Чистяков', address: 'г. Питкяранта, ул. Советская, 27', phone: '+7 921 111-11-37', email: 'chistyakov127@example.com' },
      { accountNumber: '100128', fullName: 'Шишкин Шишка Шишкин', address: 'г. Питкяранта, ул. Советская, 28', phone: '+7 921 111-11-38', email: 'shishkin128@example.com' }
    ];

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    missingUsers.forEach((user, idx) => {
      // Check if user exists
      db.get('SELECT id FROM users WHERE accountNumber = ?', [user.accountNumber], (err, row) => {
        if (err) {
          console.error(`✗ Error checking user ${user.accountNumber}:`, err.message);
          failed++;
        } else if (row) {
          console.log(`⊘ Skipped ${user.accountNumber} (already exists)`);
          skipped++;
        } else {
          // User doesn't exist, insert it
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
              'NOTSET',
              new Date().toISOString(),
              new Date().toISOString()
            ],
            (err) => {
              if (err) {
                console.error(`✗ Failed to import user ${user.accountNumber}:`, err.message);
                failed++;
              } else {
                console.log(`✓ Imported user ${user.accountNumber} - ${user.fullName}`);
                imported++;
              }

              if (imported + skipped + failed === missingUsers.length) {
                console.log(`\n✓ Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed`);
                db.close();
                process.exit(0);
              }
            }
          );
        }

        if (imported + skipped + failed === missingUsers.length) {
          console.log(`\n✓ Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed`);
          db.close();
          process.exit(0);
        }
      });
    });
  }
});
