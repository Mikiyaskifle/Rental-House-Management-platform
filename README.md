# Rental House Management Platform

A full-stack web application that enables tenants to find rental houses easily and allows landlords to manage property listings transparently. The system aims to reduce housing search difficulties, prevent scams, and improve rental management.

## Features

### Core Features
- **User Authentication & Authorization**: Secure login/registration with role-based access control
- **House Listings**: Landlords can add, edit, and delete property listings with multiple images
- **Search & Filters**: Search by location, filter by price range and number of rooms
- **Rental Requests**: Tenants can send requests, landlords can approve/reject
- **Rental History**: Track past and active rentals
- **Admin Panel**: Monitor platform activity and manage users

### User Roles
- **Tenant**: Search properties, send rental requests, view rental history
- **Landlord**: Manage properties, handle rental requests, track tenants
- **Admin**: Monitor platform, manage users, view statistics

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React.js** with React Router
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hook Form** for form handling
- **Lucide React** for icons

## Prerequisites

- Node.js (v14 or higher)
- MySQL or XAMPP with MySQL
- npm or yarn

## Installation & Setup

### 1. Database Setup

1. Start your MySQL server (via XAMPP or standalone MySQL)
2. Open MySQL Workbench or command line
3. Execute the provided SQL script:

```sql
-- Run the database_schema.sql file in your MySQL client
-- This will create the database and all necessary tables
```

Or use the command line:
```bash
mysql -u root -p < database_schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env` file and update database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rental_house_platform
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Accounts

After setting up the database, you can use these default accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

### Tenant Account
- **Username**: `john_tenant`
- **Password**: `password`
- **Role**: Tenant

### Landlord Account
- **Username**: `jane_landlord`
- **Password**: `password`
- **Role**: Landlord

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Houses
- `GET /api/houses` - Get all houses with filters
- `GET /api/houses/:id` - Get house details
- `POST /api/houses` - Add new house (Landlord/Admin)
- `PUT /api/houses/:id` - Update house (Landlord/Admin)
- `DELETE /api/houses/:id` - Delete house (Landlord/Admin)

### Rental Requests
- `POST /api/rental-requests` - Send rental request (Tenant)
- `GET /api/rental-requests` - Get rental requests
- `PUT /api/rental-requests/:id` - Respond to request (Landlord)

### Rental History
- `GET /api/rental-history` - Get rental history

### Admin
- `GET /api/admin/statistics` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status

## Database Schema

### Tables
1. **users** - User information and authentication
2. **houses** - Property listings
3. **rental_requests** - Rental request management
4. **rental_history** - Historical rental data

## Project Structure

```
Rental House Management Platform/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
├── database_schema.sql        # MySQL database schema
└── README.md                  # This file
```

## Features Implementation

### Real-World Scenarios

#### Scenario 1: Tenant Finds a House
1. Tenant registers/logs in
2. Searches for houses by location and budget
3. Views available houses with details
4. Sends rental request
5. System records request as "Pending"

#### Scenario 2: Landlord Manages Requests
1. Landlord views incoming requests
2. Approves or rejects requests
3. Approved requests update house status to "Unavailable"
4. Creates rental history entry

#### Scenario 3: Admin Monitoring
1. Admin reviews platform statistics
2. Manages user accounts
3. Monitors fraudulent activity

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- File upload restrictions

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check database credentials in .env file
   - Verify database exists

2. **CORS Issues**
   - Backend should be running on port 5000
   - Frontend proxy is configured in package.json

3. **Image Upload Issues**
   - Ensure uploads directory exists in backend
   - Check file size limits (max 5MB per image)

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret in .env file

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
