import { dbGet } from './database.js';

async function verifyAdmin() {
  try {
    const admin = await dbGet('SELECT * FROM users WHERE accountNumber = ?', ['ADMIN']);
    
    if (!admin) {
      console.log('ERROR: Admin user not found in database');
      process.exit(1);
    }
    
    console.log('Admin user found:');
    console.log('  - ID:', admin.id);
    console.log('  - Account Number:', admin.accountNumber);
    console.log('  - Full Name:', admin.fullName);
    console.log('  - isAdmin:', admin.isAdmin, '(type:', typeof admin.isAdmin + ')');
    console.log('  - Password set:', !!admin.password);
    
    if (!admin.isAdmin) {
      console.log('\nWARNING: isAdmin flag is not set to 1!');
      console.log('This is why admin login is failing.');
    } else {
      console.log('\nSUCCESS: Admin user is properly configured');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
