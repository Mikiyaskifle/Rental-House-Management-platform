-- Rental House Management Platform Database Schema
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS rental_house_platform;
USE rental_house_platform;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('tenant', 'landlord', 'admin') NOT NULL DEFAULT 'tenant',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Houses table
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    price DECIMAL(10,2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    area_sqft INT,
    furnished BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    images JSON, -- Store multiple image paths as JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city),
    INDEX idx_price (price),
    INDEX idx_bedrooms (bedrooms),
    INDEX idx_available (available)
);

-- Rental Requests table
CREATE TABLE rental_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    house_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    response_message TEXT,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    INDEX idx_tenant (tenant_id),
    INDEX idx_house (house_id),
    INDEX idx_status (status)
);

-- Rental History table
CREATE TABLE rental_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    house_id INT NOT NULL,
    landlord_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tenant (tenant_id),
    INDEX idx_landlord (landlord_id),
    INDEX idx_status (status)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('admin', 'admin@rentalhouse.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');

-- Sample data for testing
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('john_tenant', 'john@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '1234567890', 'tenant'),
('jane_landlord', 'jane@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', '0987654321', 'landlord');

INSERT INTO houses (landlord_id, title, description, address, city, state, postal_code, price, bedrooms, bathrooms, area_sqft, furnished, parking, pet_friendly) VALUES
(2, 'Modern 2BR Apartment', 'Beautiful modern apartment in the heart of downtown', '123 Main St', 'New York', 'NY', '10001', 1500.00, 2, 2, 800, TRUE, TRUE, FALSE),
(2, 'Cozy 1BR Studio', 'Perfect studio for singles or couples', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 1200.00, 1, 1, 600, FALSE, FALSE, TRUE);
