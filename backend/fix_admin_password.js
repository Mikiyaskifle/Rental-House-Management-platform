const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'rental_house_platform'
    });
    
    // Hash the password correctly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('New password hash:', hashedPassword);
    
    // Update admin password
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    console.log('Password updated for admin user. Rows affected:', result.affectedRows);
    
    // Verify the update
    const [users] = await db.execute('SELECT username, role, is_active FROM users WHERE username = "admin"');
    console.log('Updated user:', users[0]);
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdminPassword();
