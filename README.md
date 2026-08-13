# Sofra 🍽️ — Integrated Restaurant Management System

Sofra is a full-stack restaurant management system that combines a **customer-facing website** with a complete **admin dashboard**. The system uses **PHP + MySQL** for authentication, database management, and backend APIs.

---

## ⚡ Quick Setup

### 1. Install and Run XAMPP

Download and install [XAMPP](https://www.apachefriends.org/).

Open the **XAMPP Control Panel** and start:

* **Apache**
* **MySQL**

### 2. Place the Project

Copy the entire project folder to:

```text
C:\xampp\htdocs\sofra
```

### 3. Set Up the Database

Open:

```text
http://localhost/phpmyadmin
```

Go to **Import** and select:

```text
backend/config/schema.sql
```

This will automatically create the `sofra_db` database and a default admin account:

* **Email:** `admin@sofra.com`
* **Password:** `admin123`

### 4. Run the Project

Open:

```text
http://localhost/sofra/
```

You will be redirected to the **Account Type Selection** page, where you can choose between **User** and **Admin**.

---

## 🧭 User Flow

1. **Account Type Selection** (`choice.html`)

   * Choose between **User** and **Admin**.

2. **Login / Registration**

   * The selected account type is displayed with a badge.

3. **Authentication**

   * **User:** redirected to the Sofra customer website, including the menu, cart, and orders.
   * **Admin:** redirected to the complete Admin Dashboard for managing the restaurant.

4. **Logout**

   * Properly clears the session and redirects the user back to the account selection page.

---

## 📁 Project Structure

```text
sofra/
│
├── index.html
│
├── Sofra_Fronten/                  # Customer Frontend
│   ├── pages/                      # choice, login, index, menu, cart, etc.
│   ├── partials/                   # Shared navbar and footer
│   └── assets/                     # CSS, JavaScript, images
│
├── architectui-html-theme-free/    # Admin Dashboard
│   ├── architectui-html-free/      # Production-ready build
│   │   ├── index
│   │   ├── orders
│   │   ├── meals-all
│   │   ├── meals-add
│   │   ├── meals-categories
│   │   ├── customers
│   │   ├── reviews
│   │   ├── reports
│   │   └── settings
│   │
│   └── src/                        # Source files for future development
│
└── backend/                        # PHP Backend / API
    ├── api/
    │   ├── login.php
    │   ├── register.php
    │   ├── validate.php
    │   └── logout.php
    │
    ├── auth/
    │   └── Auth.php
    │
    ├── config/
    │   ├── database.php
    │   └── schema.sql
    │
    └── middleware/
        └── AuthMiddleware.php
```

---

## 🔐 Database Configuration

The database connection is configured in:

```text
backend/config/database.php
```

```php
private $host = "localhost";
private $db_name = "sofra_db";
private $username = "root";
private $password = "";
```

The default XAMPP MySQL configuration uses `root` with an empty password.

---

## 🛠️ Rebuilding the Admin Dashboard

The Admin Dashboard source code is located in:

```text
architectui-html-theme-free/src
```

If you make changes to the dashboard, rebuild it using:

```bash
cd architectui-html-theme-free
npm install
npm run build
```

The updated production build will be generated in:

```text
architectui-html-free/
```

> **Note:** Node.js and npm are not required to run the already-built Admin Dashboard.

---

## ✅ Improvements & Fixes

* Built the Admin Dashboard as a **production-ready version**.
* Fixed the Admin **Logout** path.
* Fixed the Logout button in the Admin header.
* Corrected incorrect absolute paths in the `about`, `contact`, `cart`, and `index` pages.
* Added an account-type badge to the Login page.
* Removed unnecessary and duplicate files.
* Removed the `node_modules` folder to reduce project size.
* Cleaned up duplicated and outdated backend files.

---

## 💻 Technologies Used

* **PHP**
* **MySQL**
* **HTML5**
* **CSS3**
* **JavaScript**
* **Bootstrap**
* **REST API**
* **XAMPP**
* **ArchitectUI**
