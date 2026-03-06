const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ADD THIS RIGHT HERE - CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));

// Your existing middleware should come after CORS
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_house_platform',
    port: process.env.DB_PORT || 3306
};

let db;

async function initDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
        
        // Create houses table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS houses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                landlord_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                bedrooms INT NOT NULL,
                bathrooms INT NOT NULL,
                area_sqft INT,
                furnished BOOLEAN DEFAULT FALSE,
                parking BOOLEAN DEFAULT FALSE,
                pet_friendly BOOLEAN DEFAULT FALSE,
                available BOOLEAN DEFAULT TRUE,
                images LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (landlord_id) REFERENCES users(id)
            )
        `);
        console.log('Houses table created successfully');
        
        // Create rental_requests table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS rental_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id INT NOT NULL,
                house_id INT NOT NULL,
                message TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES users(id),
                FOREIGN KEY (house_id) REFERENCES houses(id),
                UNIQUE KEY unique_tenant_house (tenant_id, house_id)
            )
        `);
        console.log('Rental requests table created successfully');
        
        // Create rental_history table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS rental_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id INT NOT NULL,
                house_id INT NOT NULL,
                landlord_id INT NOT NULL,
                start_date DATE,
                end_date DATE,
                rent_amount DECIMAL(10,2),
                status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES users(id),
                FOREIGN KEY (house_id) REFERENCES houses(id),
                FOREIGN KEY (landlord_id) REFERENCES users(id)
            )
        `);
        console.log('Rental history table created successfully');
        
        // Create ratings table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id INT NOT NULL,
                house_id INT NOT NULL,
                landlord_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES users(id),
                FOREIGN KEY (house_id) REFERENCES houses(id),
                FOREIGN KEY (landlord_id) REFERENCES users(id),
                UNIQUE KEY unique_tenant_house_rating (tenant_id, house_id)
            )
        `);
        console.log('Ratings table created successfully');
        
        // Verify houses table structure
        try {
            const [houseColumns] = await db.execute('DESCRIBE houses');
            console.log('Houses table columns:', houseColumns.map(col => col.Field));
        } catch (error) {
            console.error('Error checking houses table structure:', error);
        }
        
        // Check if any houses need images field
        try {
            const [housesWithoutImages] = await db.execute('SELECT id, title FROM houses WHERE images IS NULL');
            if (housesWithoutImages.length > 0) {
                console.log(`Found ${housesWithoutImages.length} houses without images`);
            }
        } catch (error) {
            console.error('Error checking house images:', error);
        }
        
        // Create tables if they don't exist
        await createTables();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

async function createTables() {
    try {
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN full_name VARCHAR(100) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Full name column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN department VARCHAR(100) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Department column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN admin_level VARCHAR(20) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Admin level column may already exist:', error.message);
            }
        }
        
        // Add ID verification columns
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN id_image LONGBLOB DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('ID image column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN id_verified BOOLEAN DEFAULT FALSE
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('ID verified column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Verification status column may already exist:', error.message);
            }
        }
        
        // Add profile_image column to users table if it doesn't exist
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN profile_image LONGTEXT DEFAULT NULL
            `);
            console.log('Profile image column added successfully');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Profile image column may already exist:', error.message);
            } else {
                console.log('Profile image column already exists');
            }
        }
        
        // Create notifications table if it doesn't exist
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type ENUM('new_registration', 'rental_request', 'approval_status') NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('Notifications table created successfully');
        } catch (error) {
            console.log('Notifications table may already exist:', error.message);
        }
        
        // Verify the users table structure
        try {
            const [columns] = await db.execute('DESCRIBE users');
            console.log('Users table columns:', columns.map(col => col.Field));
        } catch (error) {
            console.error('Error checking table structure:', error);
        }
        
        // Check if any users need profile_image field set
        try {
            const [usersWithoutProfile] = await db.execute('SELECT id, username FROM users WHERE profile_image IS NULL');
            if (usersWithoutProfile.length > 0) {
                console.log(`Found ${usersWithoutProfile.length} users without profile images`);
            }
        } catch (error) {
            console.error('Error checking profile images:', error);
        }
        
        // Add phone, address, city, state, postal_code columns to users table if they don't exist
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Phone column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN address TEXT DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Address column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN city VARCHAR(100) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('City column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN state VARCHAR(100) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('State column may already exist:', error.message);
            }
        }
        
        try {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN postal_code VARCHAR(20) DEFAULT NULL
            `);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('Postal code column may already exist:', error.message);
            }
        }
        
        // Create ratings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id INT NOT NULL,
                house_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES users(id),
                FOREIGN KEY (house_id) REFERENCES houses(id),
                UNIQUE KEY unique_tenant_house (tenant_id, house_id)
            )
        `);
        
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Role-based access middleware
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};

// Auth Routes
app.post('/api/auth/register', upload.single('id_image'), async (req, res) => {
    try {
        const { username, email, password, full_name, phone, role = 'tenant' } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Check if ID image is provided for tenant and landlord roles
        if ((role === 'tenant' || role === 'landlord') && !req.file) {
            return res.status(400).json({ message: 'ID image is required for tenant and landlord registration' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Read ID image from disk storage
        const fs = require('fs');
        let idImageData = null;
        
        if (req.file) {
            idImageData = fs.readFileSync(req.file.path);
        }
        
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, full_name, phone, role, id_image, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name || null, phone || null, role, idImageData, 'pending']
        );

        // Create notification for admin about new registration
        try {
            // Get all admin users
            const [adminUsers] = await db.execute(
                'SELECT id FROM users WHERE role = "admin" AND is_active = TRUE'
            );
            
            // Create notification for each admin
            for (const admin of adminUsers) {
                await db.execute(`
                    INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)
                `, [
                    admin.id,
                    'New User Registration',
                    `New ${role} registered: ${username} (${email}). ID verification pending.`,
                    'new_registration'
                ]);
                
                // Create separate ID verification notification
                await db.execute(`
                    INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)
                `, [
                    admin.id,
                    'ID Verification Pending',
                    `${username} has submitted ID for verification. Review required.`,
                    'id_verification'
                ]);
            }
        } catch (notificationError) {
            console.error('Error creating admin notification:', notificationError);
        }

        res.status(201).json({ 
            message: 'Registration successful! Your ID is pending verification. You will be notified once approved.',
            requiresVerification: true
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Profile Image Upload - Only for approved users
app.post('/api/user/profile-image', authenticateToken, upload.single('profile_image'), async (req, res) => {
    try {
        // Check if user is approved
        if (req.user.verification_status !== 'approved') {
            return res.status(403).json({ message: 'Your ID must be approved before uploading a profile image' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Profile image is required' });
        }

        // Convert profile image to base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;
        const profileImageData = `data:${mimeType};base64,${base64Image}`;
        
        // Clean up uploaded file after converting to base64
        fs.unlinkSync(req.file.path);
        
        // Update user's profile image in database
        await db.execute(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [profileImageData, req.user.id]
        );

        res.status(200).json({ 
            message: 'Profile image uploaded successfully!'
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user ID image for admin viewing
app.get('/api/admin/user/:userId/id-image', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id_image, username FROM users WHERE id = ?',
            [req.params.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = users[0];
        
        if (!user.id_image) {
            return res.status(404).json({ message: 'No ID image found' });
        }
        
        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `inline; filename="${user.username}_id_image.jpg"`
        });
        res.send(user.id_image);
    } catch (error) {
        console.error('Error fetching ID image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const [notifications] = await db.execute(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.user.id]);
        
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.execute(`
            UPDATE notifications SET is_read = TRUE 
            WHERE id = ? AND user_id = ?
        `, [req.params.id, req.user.id]);
        
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unread notification count
app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute(`
            SELECT COUNT(*) as count FROM notifications 
            WHERE user_id = ? AND is_read = FALSE
        `, [req.user.id]);
        
        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const [users] = await db.execute(
            'SELECT id, username, email, password, full_name, role, is_active, profile_image, phone, address, city, state, postal_code, department, admin_level, verification_status FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Check verification status for tenant and landlord
        if ((user.role === 'tenant' || user.role === 'landlord') && user.verification_status !== 'approved') {
            return res.status(401).json({ 
                message: 'Your ID verification is pending. Please wait for admin approval.',
                verificationStatus: user.verification_status
            });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                profile_image: user.profile_image,
                phone: user.phone,
                address: user.address,
                city: user.city,
                state: user.state,
                postal_code: user.postal_code,
                department: user.department,
                admin_level: user.admin_level
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, role, profile_image, phone, address, city, state, postal_code, department, admin_level FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('Verify endpoint returning user:', users[0]);
        
        res.json({ user: users[0] });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Password Update Route
app.put('/api/auth/update-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        // Find user with current password
        const [users] = await db.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// House Routes
// Get houses for tenants (only available)
app.get('/api/houses', async (req, res) => {
    try {
        const { city, min_price, max_price, bedrooms, sort_by = 'price' } = req.query;
        
        let query = 'SELECT h.*, u.full_name as landlord_name FROM houses h JOIN users u ON h.landlord_id = u.id WHERE h.available = TRUE';
        const params = [];

        if (city) {
            query += ' AND h.city LIKE ?';
            params.push(`%${city}%`);
        }

        if (min_price) {
            query += ' AND h.price >= ?';
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ' AND h.price <= ?';
            params.push(parseFloat(max_price));
        }

        if (bedrooms) {
            query += ' AND h.bedrooms = ?';
            params.push(parseInt(bedrooms));
        }

        // Sorting - available houses only, then by selected sort
        const sortOptions = {
            'price': 'h.price ASC',
            'price_desc': 'h.price DESC',
            'newest': 'h.created_at DESC'
        };
        query += ` ORDER BY ${sortOptions[sort_by] || 'h.price ASC'}`;

        const [houses] = await db.execute(query, params);
        res.json(houses);
    } catch (error) {
        console.error('Get houses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all houses for landlords (including unavailable)
app.get('/api/houses/all', authenticateToken, authorizeRole(['landlord', 'admin']), async (req, res) => {
    try {
        const { city, min_price, max_price, bedrooms, sort_by = 'price' } = req.query;
        
        let query = 'SELECT h.*, u.full_name as landlord_name FROM houses h JOIN users u ON h.landlord_id = u.id';
        const params = [];
        
        // If user is landlord, only show their houses
        if (req.user.role === 'landlord') {
            query += ' WHERE h.landlord_id = ?';
            params.push(req.user.id);
        }

        if (city) {
            query += req.user.role === 'landlord' ? ' AND h.city LIKE ?' : ' WHERE h.city LIKE ?';
            params.push(`%${city}%`);
        }

        if (min_price) {
            query += ' AND h.price >= ?';
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ' AND h.price <= ?';
            params.push(parseFloat(max_price));
        }

        if (bedrooms) {
            query += ' AND h.bedrooms = ?';
            params.push(parseInt(bedrooms));
        }

        // Sorting - unavailable houses first, then by selected sort
        const sortOptions = {
            'price': 'h.available ASC, h.price ASC',
            'price_desc': 'h.available ASC, h.price DESC',
            'newest': 'h.available ASC, h.created_at DESC'
        };
        query += ` ORDER BY ${sortOptions[sort_by] || 'h.available ASC, h.price ASC'}`;

        const [houses] = await db.execute(query, params);
        res.json(houses);
    } catch (error) {
        console.error('Get all houses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/houses/:id', async (req, res) => {
    try {
        const [houses] = await db.execute(
            'SELECT h.*, u.full_name as landlord_name, u.email as landlord_email FROM houses h JOIN users u ON h.landlord_id = u.id WHERE h.id = ?',
            [req.params.id]
        );

        if (houses.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }

        res.json(houses[0]);
    } catch (error) {
        console.error('Get house error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle house availability
app.put('/api/houses/:id/availability', authenticateToken, authorizeRole(['landlord', 'admin']), async (req, res) => {
    try {
        const houseId = req.params.id;
        const { available } = req.body;
        
        // Check if house exists and belongs to the landlord
        const [houses] = await db.execute(
            'SELECT landlord_id FROM houses WHERE id = ?',
            [houseId]
        );
        
        if (houses.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        // Check if user is the landlord or admin
        if (req.user.role !== 'admin' && houses[0].landlord_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this house' });
        }
        
        // Update availability
        await db.execute(
            'UPDATE houses SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [available, houseId]
        );
        
        res.json({ 
            message: `House marked as ${available ? 'available' : 'unavailable'}`,
            available: available
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/houses', authenticateToken, authorizeRole(['landlord', 'admin']), upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, address, city, state, postal_code, price, bedrooms, bathrooms, area_sqft, furnished, parking, pet_friendly } = req.body;
        
        // Convert uploaded files to base64
        const imageData = req.files ? req.files.map(file => {
            const imageBuffer = fs.readFileSync(file.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = file.mimetype;
            return `data:${mimeType};base64,${base64Image}`;
        }) : [];

        // Clean up uploaded files after converting to base64
        if (req.files) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }

        const [result] = await db.execute(
            'INSERT INTO houses (landlord_id, title, description, address, city, state, postal_code, price, bedrooms, bathrooms, area_sqft, furnished, parking, pet_friendly, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description, address, city, state, postal_code, parseFloat(price), parseInt(bedrooms), parseInt(bathrooms), area_sqft ? parseInt(area_sqft) : null, furnished === 'true', parking === 'true', pet_friendly === 'true', JSON.stringify(imageData)]
        );

        res.status(201).json({ message: 'House listed successfully', houseId: result.insertId });
    } catch (error) {
        console.error('Add house error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/houses/:id', authenticateToken, authorizeRole(['landlord', 'admin']), upload.array('images', 5), async (req, res) => {
    try {
        const houseId = req.params.id;
        
        // Check ownership
        const [houses] = await db.execute('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
        
        if (houses.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (req.user.role !== 'admin' && houses[0].landlord_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this house' });
        }

        const { title, description, address, city, state, postal_code, price, bedrooms, bathrooms, area_sqft, furnished, parking, pet_friendly, available } = req.body;
        
        let imageData = req.files ? req.files.map(file => {
            const imageBuffer = fs.readFileSync(file.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = file.mimetype;
            return `data:${mimeType};base64,${base64Image}`;
        }) : [];
        
        // Clean up uploaded files after converting to base64
        if (req.files) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
        
        // If new images uploaded, replace existing ones
        if (imageData.length > 0) {
            const updateQuery = 'UPDATE houses SET title = ?, description = ?, address = ?, city = ?, state = ?, postal_code = ?, price = ?, bedrooms = ?, bathrooms = ?, area_sqft = ?, furnished = ?, parking = ?, pet_friendly = ?, available = ?, images = ? WHERE id = ?';
            const [result] = await db.execute(updateQuery, [title, description, address, city, state, postal_code, parseFloat(price), parseInt(bedrooms), parseInt(bathrooms), area_sqft ? parseInt(area_sqft) : null, furnished === 'true', parking === 'true', pet_friendly === 'true', available !== 'false', JSON.stringify(imageData), houseId]);
        } else {
            const updateQuery = 'UPDATE houses SET title = ?, description = ?, address = ?, city = ?, state = ?, postal_code = ?, price = ?, bedrooms = ?, bathrooms = ?, area_sqft = ?, furnished = ?, parking = ?, pet_friendly = ?, available = ? WHERE id = ?';
            const [result] = await db.execute(updateQuery, [title, description, address, city, state, postal_code, parseFloat(price), parseInt(bedrooms), parseInt(bathrooms), area_sqft ? parseInt(area_sqft) : null, furnished === 'true', parking === 'true', pet_friendly === 'true', available !== 'false', houseId]);
        }

        res.json({ message: 'House updated successfully' });
    } catch (error) {
        console.error('Update house error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/houses/:id', authenticateToken, authorizeRole(['landlord', 'admin']), async (req, res) => {
    try {
        const houseId = req.params.id;
        
        // Check ownership
        const [houses] = await db.execute('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
        
        if (houses.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (req.user.role !== 'admin' && houses[0].landlord_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this house' });
        }

        await db.execute('DELETE FROM houses WHERE id = ?', [houseId]);
        res.json({ message: 'House deleted successfully' });
    } catch (error) {
        console.error('Delete house error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rental Request Routes
app.post('/api/rental-requests', authenticateToken, authorizeRole(['tenant']), async (req, res) => {
    try {
        const { house_id, message } = req.body;
        
        // Check if house is available
        const [houses] = await db.execute('SELECT available FROM houses WHERE id = ?', [house_id]);
        if (houses.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        if (!houses[0].available) {
            return res.status(400).json({ message: 'House is not available' });
        }

        // Check if already requested
        const [existingRequests] = await db.execute(
            'SELECT id FROM rental_requests WHERE tenant_id = ? AND house_id = ? AND status = "pending"',
            [req.user.id, house_id]
        );

        if (existingRequests.length > 0) {
            return res.status(400).json({ message: 'Rental request already sent' });
        }

        const [result] = await db.execute(
            'INSERT INTO rental_requests (tenant_id, house_id, message) VALUES (?, ?, ?)',
            [req.user.id, house_id, message]
        );

        // Create notification for landlord about new rental request
        try {
            // Get landlord info and house details
            const [houseInfo] = await db.execute(`
                SELECT h.landlord_id, h.title, u.full_name as tenant_name
                FROM houses h
                JOIN users u ON u.id = ?
                WHERE h.id = ?
            `, [req.user.id, house_id]);
            
            if (houseInfo.length > 0) {
                await db.execute(`
                    INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)
                `, [
                    houseInfo[0].landlord_id,
                    'New Rental Request',
                    `New rental request for "${houseInfo[0].title}" from ${houseInfo[0].tenant_name}`,
                    'rental_request'
                ]);
            }
        } catch (notificationError) {
            console.error('Error creating landlord notification:', notificationError);
        }

        res.status(201).json({ message: 'Rental request sent successfully', requestId: result.insertId });
    } catch (error) {
        console.error('Send rental request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/rental-requests', authenticateToken, async (req, res) => {
    try {
        let query;
        let params;

        if (req.user.role === 'landlord') {
            query = `
                SELECT rr.*, h.title as house_title, u.full_name as tenant_name, u.email as tenant_email, u.phone as tenant_phone
                FROM rental_requests rr
                JOIN houses h ON rr.house_id = h.id
                JOIN users u ON rr.tenant_id = u.id
                WHERE h.landlord_id = ?
                ORDER BY rr.requested_at DESC
            `;
            params = [req.user.id];
        } else if (req.user.role === 'tenant') {
            query = `
                SELECT rr.*, h.title as house_title, u.full_name as landlord_name, u.email as landlord_email
                FROM rental_requests rr
                JOIN houses h ON rr.house_id = h.id
                JOIN users u ON h.landlord_id = u.id
                WHERE rr.tenant_id = ?
                ORDER BY rr.requested_at DESC
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT rr.*, h.title as house_title, tenant.full_name as tenant_name, landlord.full_name as landlord_name
                FROM rental_requests rr
                JOIN houses h ON rr.house_id = h.id
                JOIN users tenant ON rr.tenant_id = tenant.id
                JOIN users landlord ON h.landlord_id = landlord.id
                ORDER BY rr.requested_at DESC
            `;
            params = [];
        }

        const [requests] = await db.execute(query, params);
        res.json(requests);
    } catch (error) {
        console.error('Get rental requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/rental-requests/:id', authenticateToken, authorizeRole(['landlord']), async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status, response_message } = req.body;

        // Verify the request belongs to landlord's property
        const [requests] = await db.execute(`
            SELECT rr.*, h.landlord_id
            FROM rental_requests rr
            JOIN houses h ON rr.house_id = h.id
            WHERE rr.id = ?
        `, [requestId]);

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        if (requests[0].landlord_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to respond to this request' });
        }

        await db.execute(
            'UPDATE rental_requests SET status = ?, response_message = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, response_message, requestId]
        );

        // If approved, update house availability and create rental history
        if (status === 'approved') {
            await db.execute('UPDATE houses SET available = FALSE WHERE id = ?', [requests[0].house_id]);
            
            // Create rental history entry
            await db.execute(`
                INSERT INTO rental_history (tenant_id, house_id, landlord_id, start_date, monthly_rent, status)
                SELECT rr.tenant_id, rr.house_id, h.landlord_id, CURDATE(), h.price, 'active'
                FROM rental_requests rr
                JOIN houses h ON rr.house_id = h.id
                WHERE rr.id = ?
            `, [requestId]);
        }

        res.json({ message: 'Rental request updated successfully' });
    } catch (error) {
        console.error('Update rental request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rental History Routes
app.get('/api/rental-history', authenticateToken, async (req, res) => {
    try {
        let query;
        let params;

        if (req.user.role === 'landlord') {
            query = `
                SELECT rh.*, h.title as house_title, u.full_name as tenant_name, u.email as tenant_email
                FROM rental_history rh
                JOIN houses h ON rh.house_id = h.id
                JOIN users u ON rh.tenant_id = u.id
                WHERE rh.landlord_id = ?
                ORDER BY rh.created_at DESC
            `;
            params = [req.user.id];
        } else if (req.user.role === 'tenant') {
            query = `
                SELECT rh.*, h.title as house_title, u.full_name as landlord_name, u.email as landlord_email
                FROM rental_history rh
                JOIN houses h ON rh.house_id = h.id
                JOIN users u ON rh.landlord_id = u.id
                WHERE rh.tenant_id = ?
                ORDER BY rh.created_at DESC
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT rh.*, h.title as house_title, tenant.full_name as tenant_name, landlord.full_name as landlord_name
                FROM rental_history rh
                JOIN houses h ON rh.house_id = h.id
                JOIN users tenant ON rh.tenant_id = tenant.id
                JOIN users landlord ON rh.landlord_id = landlord.id
                ORDER BY rh.created_at DESC
            `;
            params = [];
        }

        const [history] = await db.execute(query, params);
        res.json(history);
    } catch (error) {
        console.error('Get rental history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, phone, role, created_at, is_active, verification_status FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { is_active, role } = req.body;
        const userId = req.params.id;
        
        // Get current user info to prevent admin from changing their own role or other admins
        const [currentUser] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
        
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent changing admin roles
        if (currentUser[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin user' });
        }
        
        // Build update query dynamically based on what's provided
        let updateFields = [];
        let updateValues = [];
        
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }
        
        if (role !== undefined) {
            // Validate role
            if (!['tenant', 'landlord'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role. Must be tenant or landlord' });
            }
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        
        updateValues.push(userId);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.execute(updateQuery, updateValues);
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Terminate rental agreement
app.put('/api/rental-requests/:id/terminate', authenticateToken, async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;
        
        // Check if the rental exists and belongs to the user
        const [rental] = await db.execute(`
            SELECT rh.*, rr.tenant_id, h.landlord_id
            FROM rental_history rh
            JOIN rental_requests rr ON rh.house_id = rr.house_id
            JOIN houses h ON rh.house_id = h.id
            WHERE rh.id = ? AND rh.status = 'active'
        `, [requestId]);
        
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Active rental not found' });
        }
        
        // Check if user is authorized (tenant or landlord)
        if (rental[0].tenant_id !== userId && rental[0].landlord_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to terminate this rental' });
        }
        
        // Update rental history to terminated
        await db.execute(`
            UPDATE rental_history 
            SET status = 'terminated', end_date = CURDATE() 
            WHERE id = ?
        `, [requestId]);
        
        // Update house availability back to available
        await db.execute('UPDATE houses SET available = TRUE WHERE id = ?', [rental[0].house_id]);
        
        res.json({ message: 'Rental agreement terminated successfully' });
    } catch (error) {
        console.error('Terminate rental error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User Route
app.delete('/api/admin/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Prevent deletion of admin users
        const [userCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
        
        if (userCheck.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (userCheck[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }
        
        // Delete user (this will cascade delete related records due to foreign key constraints)
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/statistics', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [userStats] = await db.execute(`
            SELECT 
                role,
                COUNT(*) as count
            FROM users 
            GROUP BY role
        `);

        const [activeStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as blocked_users
            FROM users
        `);

        const [houseStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_houses,
                SUM(CASE WHEN available = TRUE THEN 1 ELSE 0 END) as available_houses,
                AVG(price) as avg_price
            FROM houses
        `);

        const [requestStats] = await db.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM rental_requests 
            GROUP BY status
        `);

        res.json({
            users: userStats,
            active: activeStats[0],
            houses: houseStats[0],
            requests: requestStats
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ID Verification Routes
app.get('/api/admin/verifications', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, role, verification_status, created_at FROM users WHERE role IN ("tenant", "landlord") ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/verifications/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        console.log('Fetching verification details for user:', req.params.userId);
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, role, verification_status, id_image FROM users WHERE id = ?',
            [req.params.userId]
        );
        
        if (users.length === 0) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = users[0];
        console.log('User found:', user.username, 'Has ID image:', !!user.id_image);
        
        // Convert ID image to base64 for display
        if (user.id_image) {
            const base64Image = Buffer.from(user.id_image).toString('base64');
            user.id_image = `data:image/jpeg;base64,${base64Image}`;
            console.log('ID image converted to base64');
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get verification details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/verifications/:userId/approve', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        await db.execute(
            'UPDATE users SET verification_status = "approved", is_active = TRUE WHERE id = ?',
            [req.params.userId]
        );
        res.json({ message: 'User verification approved successfully' });
    } catch (error) {
        console.error('Approve verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/verifications/:userId/reject', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        await db.execute(
            'UPDATE users SET verification_status = "rejected" WHERE id = ?',
            [req.params.userId]
        );
        res.json({ message: 'User verification rejected successfully' });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Profile Update Route
app.put('/api/auth/update-profile', authenticateToken, upload.single('profile_image'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, phone, address, city, state, postal_code, department, admin_level } = req.body;
        
        // Check if username or email already exists for another user
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        
        let updateQuery = 'UPDATE users SET username = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?';
        let updateParams = [username, email, phone, address, city, state, postal_code];
        
        if (department !== undefined) {
            updateQuery += ', department = ?';
            updateParams.push(department);
        }
        
        if (admin_level !== undefined) {
            updateQuery += ', admin_level = ?';
            updateParams.push(admin_level);
        }
        
        if (req.file) {
            // Convert profile image to base64
            const imageBuffer = fs.readFileSync(req.file.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = req.file.mimetype;
            const profileImageData = `data:${mimeType};base64,${base64Image}`;
            
            // Clean up uploaded file after converting to base64
            fs.unlinkSync(req.file.path);
            
            updateQuery += ', profile_image = ?';
            updateParams.push(profileImageData);
        }
        
        updateParams.push(userId);
        
        updateQuery += ' WHERE id = ?';
        
        await db.execute(updateQuery, updateParams);
        
        // Fetch updated user
        const [updatedUsers] = await db.execute('SELECT id, username, email, role, phone, address, city, state, postal_code, profile_image, full_name, department, admin_level FROM users WHERE id = ?', [userId]);
        
        console.log('Updated user data:', updatedUsers[0]);
        
        res.json({ 
            message: 'Profile updated successfully', 
            user: updatedUsers[0] 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rating Routes
app.get('/api/ratings', async (req, res) => {
    try {
        const [ratings] = await db.execute('SELECT * FROM ratings');
        res.json(ratings);
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/ratings', authenticateToken, authorizeRole(['tenant']), async (req, res) => {
    try {
        const { house_id, rating, review } = req.body;
        const tenant_id = req.user.id;
        
        // Check if tenant has completed rental for this house
        const [rentalCheck] = await db.execute(
            'SELECT * FROM rental_history WHERE tenant_id = ? AND house_id = ? AND status = ?',
            [tenant_id, house_id, 'completed']
        );
        
        if (rentalCheck.length === 0) {
            return res.status(403).json({ message: 'You can only rate properties you have rented and completed' });
        }
        
        // Check if rating already exists
        const [existingRating] = await db.execute(
            'SELECT * FROM ratings WHERE tenant_id = ? AND house_id = ?',
            [tenant_id, house_id]
        );
        
        if (existingRating.length > 0) {
            return res.status(400).json({ message: 'You have already rated this property' });
        }
        
        await db.execute(
            'INSERT INTO ratings (tenant_id, house_id, rating, review) VALUES (?, ?, ?, ?)',
            [tenant_id, house_id, rating, review]
        );
        
        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/ratings/:id', authenticateToken, authorizeRole(['tenant']), async (req, res) => {
    try {
        const ratingId = req.params.id;
        const { rating, review } = req.body;
        const tenant_id = req.user.id;
        
        // Check if rating belongs to this tenant
        const [ratingCheck] = await db.execute(
            'SELECT * FROM ratings WHERE id = ? AND tenant_id = ?',
            [ratingId, tenant_id]
        );
        
        if (ratingCheck.length === 0) {
            return res.status(403).json({ message: 'Not authorized to update this rating' });
        }
        
        await db.execute(
            'UPDATE ratings SET rating = ?, review = ? WHERE id = ?',
            [rating, review, ratingId]
        );
        
        res.json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ratings for a specific house
app.get('/api/houses/:houseId/ratings', async (req, res) => {
    try {
        const houseId = req.params.houseId;
        const [ratings] = await db.execute(`
            SELECT r.*, u.username, u.full_name 
            FROM ratings r 
            JOIN users u ON r.tenant_id = u.id 
            WHERE r.house_id = ? 
            ORDER BY r.created_at DESC
        `, [houseId]);
        
        // Calculate average rating
        const [avgResult] = await db.execute(
            'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE house_id = ?',
            [houseId]
        );
        
        res.json({
            ratings,
            average_rating: avgResult[0].average_rating || 0,
            total_ratings: avgResult[0].total_ratings || 0
        });
    } catch (error) {
        console.error('Get house ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user's rating for a house
app.get('/api/houses/:houseId/my-rating', authenticateToken, async (req, res) => {
    try {
        const houseId = req.params.houseId;
        const tenantId = req.user.id;
        
        const [rating] = await db.execute(
            'SELECT * FROM ratings WHERE tenant_id = ? AND house_id = ?',
            [tenantId, houseId]
        );
        
        res.json(rating[0] || null);
    } catch (error) {
        console.error('Get my rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add or update rating for a house
app.post('/api/houses/:houseId/ratings', authenticateToken, authorizeRole(['tenant']), async (req, res) => {
    try {
        const houseId = req.params.houseId;
        const { rating, comment } = req.body;
        const tenantId = req.user.id;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        
        // Get house details to check landlord
        const [houseDetails] = await db.execute('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
        if (houseDetails.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        const landlordId = houseDetails[0].landlord_id;
        
        // Check if tenant has completed rental for this house
        const [rentalCheck] = await db.execute(
            'SELECT * FROM rental_history WHERE tenant_id = ? AND house_id = ? AND status = ?',
            [tenantId, houseId, 'completed']
        );
        
        if (rentalCheck.length === 0) {
            return res.status(403).json({ message: 'You can only rate properties you have rented and completed' });
        }
        
        // Check if rating already exists
        const [existingRating] = await db.execute(
            'SELECT * FROM ratings WHERE tenant_id = ? AND house_id = ?',
            [tenantId, houseId]
        );
        
        if (existingRating.length > 0) {
            // Update existing rating
            await db.execute(
                'UPDATE ratings SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND house_id = ?',
                [rating, comment, tenantId, houseId]
            );
            res.json({ message: 'Rating updated successfully' });
        } else {
            // Insert new rating
            await db.execute(
                'INSERT INTO ratings (tenant_id, house_id, landlord_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [tenantId, houseId, landlordId, rating, comment]
            );
            res.json({ message: 'Rating submitted successfully' });
        }
        
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete rating
app.delete('/api/ratings/:id', authenticateToken, authorizeRole(['tenant']), async (req, res) => {
    try {
        const ratingId = req.params.id;
        const tenantId = req.user.id;
        
        // Check if rating belongs to this tenant
        const [ratingCheck] = await db.execute(
            'SELECT * FROM ratings WHERE id = ? AND tenant_id = ?',
            [ratingId, tenantId]
        );
        
        if (ratingCheck.length === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }
        
        await db.execute('DELETE FROM ratings WHERE id = ?', [ratingId]);
        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Delete rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add sample rental history for testing (remove in production)
app.post('/api/add-sample-rental-history', authenticateToken, async (req, res) => {
    try {
        const { houseId } = req.body;
        const tenantId = req.user.id;
        
        // Get house details
        const [houseDetails] = await db.execute('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
        if (houseDetails.length === 0) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        const landlordId = houseDetails[0].landlord_id;
        
        // Add sample rental history
        await db.execute(`
            INSERT INTO rental_history (tenant_id, house_id, landlord_id, start_date, end_date, rent_amount, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            tenantId, 
            houseId, 
            landlordId, 
            new Date('2024-01-01'), 
            new Date('2024-06-30'), 
            1000, 
            'completed'
        ]);
        
        res.json({ message: 'Sample rental history added for testing' });
    } catch (error) {
        console.error('Add sample rental history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
