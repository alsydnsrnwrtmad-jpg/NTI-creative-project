-- Sofra Restaurant Management System - Database Schema
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS sofra_db;
USE sofra_db;

-- Users Table (Both Admin and Regular Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sessions Table (for Authentication)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Meals Table
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    badge VARCHAR(50),
    ingredients TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'preparing', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cash', 'card') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    delivery_address TEXT,
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    meal_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
);

-- Notifications Table (in-app admin notifications, e.g. new order alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    meta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin User (Password: admin123 - hashed)
INSERT INTO users (email, password, first_name, last_name, user_type) 
VALUES ('admin@sofra.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Seed Categories (matches the categories used across the menu/food-details pages)
INSERT INTO categories (id, name, description) VALUES
    (1, 'Pizza', 'Wood-fired and oven-baked pizzas'),
    (2, 'Burgers', 'Beef and chicken burgers'),
    (3, 'Asian', 'Sushi, ramen, dumplings and more'),
    (4, 'Grill', 'Charcoal-grilled meats and platters'),
    (5, 'Pasta', 'Italian pasta dishes'),
    (6, 'Salads', 'Fresh salads and healthy bowls'),
    (7, 'Desserts', 'Cakes, donuts and sweets'),
    (8, 'Seafood', 'Fresh grilled and fried seafood')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed Meals (real data, replacing what used to be hardcoded in the frontend JS)
-- Explicit IDs are used so that existing links like food-details.html?id=3 keep working.
INSERT INTO meals (id, category_id, name, description, price, image_url, badge, ingredients, is_available) VALUES
    (1, 1, 'Margherita Pizza', 'Classic Neapolitan pizza with fresh basil and mozzarella.', 149.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80', 'Best Seller', 'Fresh mozzarella,Tomato sauce,Fresh basil,Olive oil', 1),
    (2, 2, 'Double Smash Burger', 'Two juicy beef patties with cheddar, pickles and secret sauce.', 189.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80', '🔥 Hot', 'Beef patties,Cheddar cheese,Pickles,Lettuce,Secret sauce', 1),
    (3, 3, 'Salmon Sushi Set', 'Fresh Atlantic salmon sushi with avocado and sesame.', 299.00, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80', "Chef's Pick", 'Fresh salmon,Sushi rice,Avocado,Sesame', 1),
    (4, 4, 'Mixed Grill Platter', 'Kofta, chicken, tawook and lamb chops grilled over charcoal.', 249.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80', '🔥 Popular', 'Kofta,Chicken,Tawook,Lamb chops,Grilled vegetables', 1),
    (5, 5, 'Truffle Fettuccine', 'Creamy pasta sauce with parmesan and black truffle shavings.', 179.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80', '🔥 Hot', 'Fettuccine pasta,Cream sauce,Parmesan cheese,Black truffle', 1),
    (6, 1, 'Pepperoni Pizza', 'Crispy crust with mozzarella, pepperoni and tomato sauce.', 169.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80', 'Best Seller', 'Pizza dough,Mozzarella,Pepperoni,Tomato sauce', 1),
    (7, 2, 'Classic Cheese Burger', 'Beef patty with melted cheddar, lettuce and special sauce.', 159.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80', '🔥 Hot', 'Beef patty,Cheddar cheese,Lettuce,Tomato,Special sauce', 1),
    (8, 6, 'Fresh Garden Salad', 'Crispy vegetables, cherry tomatoes and homemade dressing.', 99.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80', 'Healthy', 'Lettuce,Tomatoes,Cucumber,Carrots,Homemade dressing', 1),
    (9, 3, 'Asian Dumplings', 'Steamed dumplings filled with chicken and fresh vegetables.', 129.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80', 'New', 'Chicken,Dumpling dough,Carrots,Cabbage,Soy sauce', 1),
    (10, 6, 'Power Bowl', 'Fresh greens, avocado, chickpeas and grilled vegetables.', 139.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80', 'Healthy', 'Fresh greens,Avocado,Chickpeas,Grilled vegetables', 1),
    (11, 7, 'Chocolate Donuts', 'Soft donuts covered with rich chocolate glaze.', 89.00, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=80', '🍩 Sweet', 'Donut dough,Chocolate,Sugar,Vanilla', 1),
    (12, 7, 'Chocolate Cake', 'Rich chocolate cake with creamy chocolate frosting.', 119.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80', 'Dessert', 'Chocolate cake,Cocoa,Chocolate frosting,Cream', 1),
    (13, 5, 'Creamy Alfredo Pasta', 'Classic creamy Alfredo sauce with parmesan cheese.', 159.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80', '🔥 Hot', 'Pasta,Cream,Parmesan cheese,Butter,Garlic', 1),
    (14, 4, 'Grilled Chicken', 'Juicy grilled chicken breast with herbs and vegetables.', 199.00, 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1000&q=80', "Chef's Pick", 'Chicken breast,Mixed herbs,Olive oil,Grilled vegetables', 1),
    (15, 3, 'Japanese Ramen', 'Rich broth, noodles, egg and tender sliced beef.', 219.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80', 'New', 'Ramen noodles,Beef,Egg,Japanese broth,Green onions', 1),
    (16, 7, 'Strawberry Cake', 'Soft vanilla cake with fresh strawberries and cream.', 129.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80', 'Dessert', 'Vanilla cake,Fresh strawberries,Whipped cream,Sugar', 1),
    (17, 8, 'Seafood Platter', 'Fresh grilled shrimp, fish and calamari served with lemon.', 349.00, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80', "Chef's Pick", 'Shrimp,Grilled fish,Calamari,Lemon,Herbs', 1),
    (18, 4, 'Premium Steak', 'Tender grilled steak served with roasted vegetables.', 399.00, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1000&q=80', 'Premium', 'Premium beef steak,Black pepper,Butter,Roasted vegetables', 1),
    (19, 1, 'Four Cheese Pizza', 'Mozzarella, cheddar, parmesan and blue cheese.', 179.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80', '🔥 Hot', 'Mozzarella,Cheddar,Parmesan,Blue cheese,Tomato sauce', 1),
    (20, 6, 'Chicken Avocado Bowl', 'Grilled chicken, avocado, rice and fresh vegetables.', 169.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80', 'Healthy', 'Grilled chicken,Avocado,Rice,Fresh vegetables', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
