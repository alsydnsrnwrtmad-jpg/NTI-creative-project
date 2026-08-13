# Sofra — Full Stack Restaurant Web Application

Sofra is a Full Stack restaurant web application that allows users to browse meals, view product details, manage their shopping cart, and place orders online.

The system is built using:

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- PHP
- REST APIs
- MySQL

## Front-End

The Front-End is designed to provide a responsive and user-friendly interface for the restaurant application.

It includes the main pages and user interfaces such as:

- Home
- Login / Register
- Menu
- Product Details
- Shopping Cart
- Orders
- Contact
- About

The project uses a reusable structure where the Navbar and Footer are created once and dynamically loaded across the application using the Fetch API, reducing code duplication and making the project easier to maintain.

The Front-End is organized into separate HTML, CSS, JavaScript, and assets directories to keep the project clean and scalable.

## Project Structure

```text
Sofra/
│
├── partials/
│   ├── navbar.html
│   └── footer.html
│
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
│
├── pages/
│   ├── index.html
│   ├── login.html
│   ├── menu.html
│   ├── about.html
│   ├── contact.html
│   ├── cart.html
│   └── _page-template.html
│
├── package.json
├── package-lock.json
└── start.bat