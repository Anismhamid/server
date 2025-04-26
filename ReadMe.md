# E-Commerce Platform - Corner Market (Server-Side)

## Overview

This is the server-side implementation of the Corner Market e-commerce platform. It serves as the backend API for managing users, products, orders, carts, receipts, business information, and discounts. It also includes real-time features powered by Socket.IO for instant updates to users and admins.

## Features

-   **RESTful API** for managing all data (users, products, carts, orders, etc.)
-   **MongoDB** for flexible and scalable data storage
-   **JWT-based Authentication** and role-based access (User, Editor, Admin)
-   **Socket.IO** for real-time communication:
    -   Order status updates
    -   New order notifications for admins
    -   Discount alerts
-   **CORS & Middleware Setup** for secure communication with the client
-   **PDF Receipt Generation**
-   **Validation & Error Handling** included for all routes

## Technologies

-   **Node.js**: JavaScript runtime for server-side logic
-   **Express.js**: Web framework for building REST APIs
-   **MongoDB (Atlas)**: NoSQL cloud database
-   **Mongoose**: ODM for MongoDB
-   **JWT (jsonwebtoken)**: Secure authentication
-   **bcryptjs**: Password hashing
-   **Socket.IO**: Real-time bidirectional communication
-   **dotenv**: For managing environment variables
-   **express-validator / Joi / Yup**: Input validation (depending on usage)
-   **multer** (optional): For file/image uploads (if used)
-   **html-pdf / pdf-lib**: For generating PDF receipts (based on implementation)

## API Routes

The API is organized using modular Express routers:

```js
app.use("/api/users", users);
app.use("/api/carts", carts);
app.use("/api/orders", orders);
app.use("/api/products", products);
app.use("/api/business-info", businessInfo);
app.use("/api/discounts", discounts);
app.use("/api/receipt", receipt);
```
