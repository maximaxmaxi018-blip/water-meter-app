import bcryptjs from 'bcryptjs';
import { dbGet } from './database.js';

async function testAdminPassword() {
  try {
    const admin = await dbGet('SELECT * FROM users WHERE accountNumber = ?', ['ADMIN']);
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', admin.accountNumber);
    console.log('Testing password: admin123');
    
    const isValid = bcryptjs.compareSync('admin123', admin.password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Trying other common passwords...');
      const commonPasswords = ['admin', 'password', '123456', 'admin1', 'administrator'];
      
      for (const pwd of commonPasswords) {
        const valid = bcryptjs.compareSync(pwd, admin.password);
        if (valid) {
          console.log(`Password found: ${pwd}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminPassword();