-- Database Schema for E-commerce Platform

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Table
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert test data

-- Insert test users (password is 'password123' hashed)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@example.com', '$2a$10$rQEE5/yqD1yFQhC6E5VK3OYqBqD0O5eyPZ3XHv3HKjMFX.L.Z1ZRq', 'Admin', 'User', 'admin'),
('john@example.com', '$2a$10$rQEE5/yqD1yFQhC6E5VK3OYqBqD0O5eyPZ3XHv3HKjMFX.L.Z1ZRq', 'John', 'Doe', 'customer'),
('jane@example.com', '$2a$10$rQEE5/yqD1yFQhC6E5VK3OYqBqD0O5eyPZ3XHv3HKjMFX.L.Z1ZRq', 'Jane', 'Smith', 'customer');

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Physical and digital books'),
('Home & Garden', 'Home improvement and garden supplies');

-- Insert products
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url) 
SELECT 
    c.id,
    'Smartphone X',
    'Latest smartphone with amazing features',
    999.99,
    50,
    'https://example.com/images/smartphone-x.jpg'
FROM categories c WHERE c.name = 'Electronics'
UNION ALL
SELECT 
    c.id,
    'Laptop Pro',
    'Professional laptop for developers',
    1499.99,
    30,
    'https://example.com/images/laptop-pro.jpg'
FROM categories c WHERE c.name = 'Electronics'
UNION ALL
SELECT 
    c.id,
    'Cotton T-Shirt',
    'Comfortable cotton t-shirt',
    29.99,
    100,
    'https://example.com/images/cotton-tshirt.jpg'
FROM categories c WHERE c.name = 'Clothing'
UNION ALL
SELECT 
    c.id,
    'Jeans',
    'Classic blue jeans',
    59.99,
    75,
    'https://example.com/images/jeans.jpg'
FROM categories c WHERE c.name = 'Clothing'
UNION ALL
SELECT 
    c.id,
    'Programming 101',
    'Introduction to programming',
    39.99,
    200,
    'https://example.com/images/programming-101.jpg'
FROM categories c WHERE c.name = 'Books';

-- Create test cart for John Doe
WITH john_user AS (
    SELECT id FROM users WHERE email = 'john@example.com'
)
INSERT INTO carts (user_id)
SELECT id FROM john_user;

-- Add items to John's cart
WITH john_cart AS (
    SELECT c.id as cart_id
    FROM carts c
    JOIN users u ON c.user_id = u.id
    WHERE u.email = 'john@example.com'
),
smartphone AS (
    SELECT id, price FROM products WHERE name = 'Smartphone X'
)
INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT john_cart.cart_id, smartphone.id, 1
FROM john_cart, smartphone;

-- Create a test order for Jane Smith
WITH jane_user AS (
    SELECT id FROM users WHERE email = 'jane@example.com'
),
laptop AS (
    SELECT id, price FROM products WHERE name = 'Laptop Pro'
)
INSERT INTO orders (user_id, status, total_amount, shipping_address)
SELECT 
    jane_user.id,
    'delivered',
    1499.99,
    '123 Main St, Anytown, AT 12345'
FROM jane_user;

-- Add items to Jane's order
WITH jane_order AS (
    SELECT o.id as order_id
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.email = 'jane@example.com'
),
laptop AS (
    SELECT id, price FROM products WHERE name = 'Laptop Pro'
)
INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
SELECT jane_order.order_id, laptop.id, 1, laptop.price
FROM jane_order, laptop; 