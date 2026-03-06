# RentalHub Platform - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [User Manual](#user-manual)
5. [Technical Stack](#technical-stack)
6. [Deployment Guide](#deployment-guide)

---

## Overview

RentalHub is a comprehensive rental property management platform that connects tenants with landlords through a secure, transparent, and user-friendly system. The platform features property listings, user verification, rating systems, and rental management capabilities.

### Key Features
- Property listing and management
- User authentication and authorization
- ID verification system
- Rating and review system
- Rental request management
- Real-time notifications
- Multi-language support
- Dark/light theme support
- Mobile-responsive design

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('tenant', 'landlord', 'admin') DEFAULT 'tenant',
  id_image LONGTEXT,
  profile_image LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Houses Table
```sql
CREATE TABLE houses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  price DECIMAL(10,2) NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  area_sqft INT,
  furnished BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  pet_friendly BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  landlord_id INT NOT NULL,
  images LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES users(id)
);
```

### Rental_Requests Table
```sql
CREATE TABLE rental_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  house_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (house_id) REFERENCES houses(id)
);
```

### Rental_Agreements Table
```sql
CREATE TABLE rental_agreements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  house_id INT NOT NULL,
  landlord_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  status ENUM('active', 'terminated', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (landlord_id) REFERENCES users(id)
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  house_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (house_id) REFERENCES houses(id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user
**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "tenant",
  "id_image": "base64_image_data"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "tenant"
  }
}
```

#### POST /api/auth/login
**Description**: User login
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "tenant"
  }
}
```

#### POST /api/auth/logout
**Description**: User logout
**Headers**: Authorization: Bearer {token}
**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### House Management Endpoints

#### GET /api/houses
**Description**: Get all houses with optional filters
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `city`: Filter by city
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `bedrooms`: Number of bedrooms filter
- `bathrooms`: Number of bathrooms filter

**Response**:
```json
{
  "success": true,
  "houses": [
    {
      "id": 1,
      "title": "Modern Apartment",
      "description": "Beautiful modern apartment...",
      "price": 1200.00,
      "bedrooms": 2,
      "bathrooms": 2,
      "city": "New York",
      "state": "NY",
      "images": ["image1.jpg", "image2.jpg"],
      "landlord": {
        "id": 2,
        "username": "landlord_jane"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50
  }
}
```

#### POST /api/houses
**Description**: Create a new house listing (landlord only)
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "title": "Cozy Studio",
  "description": "Perfect for students...",
  "address": "123 Main St",
  "city": "Boston",
  "state": "MA",
  "price": 800.00,
  "bedrooms": 1,
  "bathrooms": 1,
  "furnished": true,
  "parking": false,
  "pet_friendly": true,
  "images": ["base64_image1", "base64_image2"]
}
```

#### GET /api/houses/:id
**Description**: Get specific house details
**Response**:
```json
{
  "success": true,
  "house": {
    "id": 1,
    "title": "Modern Apartment",
    "description": "Beautiful modern apartment...",
    "price": 1200.00,
    "bedrooms": 2,
    "bathrooms": 2,
    "city": "New York",
    "state": "NY",
    "images": ["image1.jpg", "image2.jpg"],
    "landlord": {
      "id": 2,
      "username": "landlord_jane",
      "email": "jane@example.com"
    },
    "average_rating": 4.5,
    "total_ratings": 12
  }
}
```

#### PUT /api/houses/:id
**Description**: Update house listing (landlord only)
**Headers**: Authorization: Bearer {token}
**Request Body**: Same as POST /api/houses

#### DELETE /api/houses/:id
**Description**: Delete house listing (landlord only)
**Headers**: Authorization: Bearer {token}

### Rental Management Endpoints

#### POST /api/rental-requests
**Description**: Send rental request
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "house_id": 1,
  "message": "I am interested in this property..."
}
```

#### GET /api/rental-requests
**Description**: Get rental requests (landlord/tenant specific)
**Headers**: Authorization: Bearer {token}

#### PUT /api/rental-requests/:id
**Description**: Update rental request status (landlord only)
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "status": "approved"
}
```

#### GET /api/rental-agreements
**Description**: Get rental agreements
**Headers**: Authorization: Bearer {token}

#### PUT /api/rental-agreements/:id/terminate
**Description**: Terminate rental agreement
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "rating": 5,
  "comment": "Great experience!"
}
```

### Rating Endpoints

#### GET /api/houses/:id/ratings
**Description**: Get ratings for a specific house
**Response**:
```json
{
  "success": true,
  "ratings": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent property!",
      "tenant": {
        "username": "john_doe"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "average_rating": 4.5,
  "total_ratings": 12
}
```

#### POST /api/houses/:id/ratings
**Description**: Add rating for a house (tenant only)
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "rating": 5,
  "comment": "Great place to live!"
}
```

### User Management Endpoints

#### GET /api/users/profile
**Description**: Get user profile
**Headers**: Authorization: Bearer {token}

#### PUT /api/users/profile
**Description**: Update user profile
**Headers**: Authorization: Bearer {token}
**Request Body**:
```json
{
  "full_name": "John Smith",
  "phone": "+1234567890",
  "profile_image": "base64_image_data"
}
```

#### GET /api/users/:id
**Description**: Get user details (public)
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe",
    "profile_image": "profile.jpg"
  }
}
```

### Notification Endpoints

#### GET /api/notifications
**Description**: Get user notifications
**Headers**: Authorization: Bearer {token}
**Response**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "title": "New Rental Request",
      "message": "Someone requested your property",
      "type": "info",
      "read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### PUT /api/notifications/:id/read
**Description**: Mark notification as read
**Headers**: Authorization: Bearer {token}

---

## User Manual

### For Tenants

#### 1. Registration and Login
1. Visit the RentalHub website
2. Click "Register" in the top navigation
3. Fill in your details:
   - Username (unique)
   - Email address
   - Password
   - Full name
   - Phone number
   - Upload ID verification image
4. Click "Register"
5. Check your email for verification
6. Login with your credentials

#### 2. Finding Properties
1. Browse the homepage to see available properties
2. Use the search bar to find specific locations
3. Apply filters:
   - Price range
   - Number of bedrooms
   - Number of bathrooms
   - City/State
4. Click on any property to view details

#### 3. Viewing Property Details
1. Click on a property card to view full details
2. Review:
   - High-quality images
   - Detailed description
   - Amenities (furnished, parking, pet-friendly)
   - Location information
   - Landlord information
   - Previous ratings and reviews

#### 4. Making Rental Requests
1. On the property details page, click "Request Rental"
2. Write a message to the landlord
3. Submit your request
4. Wait for landlord approval (you'll receive notifications)

#### 5. Managing Rental Agreements
1. Go to "Rental History" in your dashboard
2. View active and past rental agreements
3. See agreement details:
   - Start and end dates
   - Monthly rent
   - Security deposit
4. Terminate agreements when needed

#### 6. Rating and Reviews
1. After your rental ends, rate the property
2. Give a star rating (1-5)
3. Write a detailed review
4. Your review helps other tenants

### For Landlords

#### 1. Registration and Profile Setup
1. Register as a landlord (select "Landlord" role)
2. Complete your profile with:
   - Contact information
   - Profile picture
   - Verification documents

#### 2. Adding Properties
1. Click "Add Property" in your dashboard
2. Fill in property details:
   - Title and description
   - Full address
   - Price (monthly rent)
   - Bedrooms and bathrooms
   - Square footage
   - Amenities (furnished, parking, pets)
3. Upload high-quality images
4. Set availability status
5. Publish the listing

#### 3. Managing Properties
1. View all your properties in the dashboard
2. Edit property details anytime
3. Update availability status
4. Delete listings when no longer available
5. View property statistics

#### 4. Handling Rental Requests
1. Receive notifications for new requests
2. Review tenant information
3. Read their message
4. Approve or reject requests
5. Communicate with potential tenants

#### 5. Managing Rental Agreements
1. Create formal agreements with approved tenants
2. Set terms:
   - Rental period
   - Monthly rent
   - Security deposit
3. Monitor active agreements
4. Handle terminations professionally

### For Administrators

#### 1. System Overview
1. Access admin dashboard
2. Monitor platform statistics
3. View user activity
4. Manage system settings

#### 2. User Management
1. View all registered users
2. Verify user identities
3. Handle user disputes
4. Suspend/ban problematic users
5. Manage user roles

#### 3. Content Moderation
1. Review property listings
2. Remove inappropriate content
3. Handle fake listings
4. Monitor user-generated content

#### 4. System Maintenance
1. Monitor server performance
2. Backup database regularly
3. Update system software
4. Handle technical issues

### General Features

#### 1. Notifications
- Real-time notifications for:
  - New rental requests
  - Request status changes
  - Agreement updates
  - System announcements

#### 2. Search and Filters
- Advanced search functionality
- Multiple filter options
- Save search preferences
- Sort results by relevance, price, date

#### 3. Theme and Language
- Switch between light and dark themes
- Multiple language support
- Accessibility features

#### 4. Mobile Responsiveness
- Full functionality on mobile devices
- Touch-friendly interface
- Optimized performance

---

## Technical Stack

### Frontend
- **React 18**: Modern JavaScript framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls
- **React Context**: State management
- **i18next**: Internationalization

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MySQL**: Database management
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Development Tools
- **NPM**: Package management
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

---

## Deployment Guide

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ installed
- Domain name (optional)
- SSL certificate (recommended)

### Backend Deployment

1. **Server Setup**:
```bash
# Clone repository
git clone <repository-url>
cd rental-hub-platform

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Build and start
npm run build
npm start
```

2. **Database Setup**:
```sql
-- Create database
CREATE DATABASE rentalhub;

-- Import schema
mysql -u username -p rentalhub < database/schema.sql

-- Create admin user
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@example.com', '$2b$10$...', 'Administrator', 'admin');
```

3. **Process Manager**:
```bash
# Install PM2 for production
npm install -g pm2

# Start application
pm2 start server.js --name "rentalhub-api"

# Monitor
pm2 monit
```

### Frontend Deployment

1. **Build for Production**:
```bash
cd frontend
npm run build
```

2. **Web Server Configuration** (Nginx example):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

**Backend (.env)**:
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=rentalhub_user
DB_PASSWORD=your_password
DB_NAME=rentalhub
JWT_SECRET=your_jwt_secret_key
UPLOAD_PATH=./uploads
```

**Frontend (.env)**:
```
REACT_APP_API_URL=http://yourdomain.com/api
REACT_APP_UPLOAD_URL=http://yourdomain.com/uploads
```

### Security Considerations

1. **SSL/TLS**: Enable HTTPS
2. **Firewall**: Configure properly
3. **Database Security**: Use strong passwords
4. **API Security**: Rate limiting, input validation
5. **Regular Updates**: Keep dependencies updated

### Monitoring and Maintenance

1. **Logs**: Monitor application logs
2. **Backups**: Regular database backups
3. **Performance**: Monitor server metrics
4. **Uptime**: Use monitoring services

---

## Support and Contact

For technical support, feature requests, or bug reports:
- Email: support@rentalhub.com
- Documentation: docs.rentalhub.com
- GitHub: github.com/rentalhub/issues

---

*This documentation covers all aspects of the RentalHub platform. For specific technical questions or implementation details, refer to the code comments or contact the development team.*
