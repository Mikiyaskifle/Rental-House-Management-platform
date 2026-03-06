const mysql = require('mysql2/promise');

async function checkUser() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'rental_house_platform'
    });
    
    const [users] = await db.execute('SELECT id, username, email, role, is_active FROM users WHERE username = "admin"');
    console.log('Admin users found:', users);
    
    if (users.length === 0) {
      console.log('No admin user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@rentalplatform.com', hashedPassword, 'System Administrator', 'admin', 1]
      );
      
      console.log('Admin user created with ID:', result.insertId);
    } else {
      console.log('Admin user exists:', users[0]);
    }
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
