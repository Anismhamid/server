# E-Commerce Platform - Shok Habena Market (Server-Side)

## Overview

This is the server-side implementation of the Shok Habena Market e-commerce platform. It serves as the backend API for managing users, products, orders, carts, receipts, business information, and discounts. It also includes real-time features powered by Socket.IO for instant updates to users and admins and uses Google OAuth for googe registeration/login.

# Taple of content

-   [Users](#users)
-   [Products](#products)
-   [Orders](#orders)
-   [Receipts](#receipts)
-   [Discounts](#discounts)
-   [Carts](#cart)
-   [Business](#business)

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
<!-- -   **html-pdf / pdf-lib**: For generating PDF receipts (based on implementation) -->

# API Routes

The API is organized using modular Express routers:

# Users

### User Registration (POST /api/users)

-   To register a new user, you send a POST request to /api/users with the user's details in the request body.

#### Request:

```json
{
	"name": {
		"first": "anes",
		"last": "mhamid"
	},
	"phone": {
		"phone_1": "0538346915",
		"phone_2": ""
	},
	"address": {
		"city": "אום אל פחם",
		"street": "עין אל דרווה",
		"houseNumber": "24 א"
	},
	"email": "anes@gg.com",
	"password": "Abc123!",
	// gender = "זכר"/"נקבה"
	"gender": "זכר",
	"image": {
		"url": "",
		"alt": ""
	},
	"role": "Client",
	"registrAt": "29.4.2025, 18:05:15",
	"terms": true // Required, must have  be accepted
}
```

#### Response:

-   Success: A JWT token is returned.

-   Error: Validation or registration errors.

### User Login (POST /api/users/login)

-   To log in a user, you send a POST request to /api/users/login with exists email and password.

#### Request:

```js
axios
	.post("/api/users/login", {
		email: "user@example.com",
		password: "userpassword",
	})
	.then((response) => {
		console.log("Login successful, Token:", response.data);
	})
	.catch((error) => {
		console.error("Error logging in:", error.response.data);
	});
```

#### Response:

-   Success: A JWT token is returned.

-   Error: Invalid credentials error.

### Google OAuth Verification

-   Response:
    Success: true/false.

-   Error: If the user doesn’t exist or any other issue occurs.

### Google Login/Register

#### Response:

-   Success: A JWT token is returned.

-   Error: Validation or Google token issues.

---

### Get All Users (GET /api/users)

-   Admin-only route to retrieve a list of all users.

#### Request:

-   Authorization : AdminToken

#### Response:

-   Success: List of users without passwords.

-   Error: Unauthorized or server error.

---

### Get Single User by ID (GET /api/users/:userId)

-   To retrieve details of a specific user, you can access this route if you have the proper permissions (Admin, Moderator, or the same user)

#### Request:

-   Authorization : Admin or Moderator or same user Token

### Response:

-   Success: User details without the password.

-   Error: Unauthorized, user not found, etc.

---

### Update User Role (PATCH /api/users/role/:userEmail)

-   Admin-only route to update the role of a user by their email.

-   Authorization : AdminToken

#### Request:

```js
{
    role: "Client", // Change role as needed
},
```

#### Response:

-   Success: Updated user data.

-   Error: Unauthorized or user not found.

---

### Complete User Data (PATCH /api/users/compleate/:userId)

-   To complete a user’s information (e.g., phone number, address), send a PATCH request with the new details.

-   Authorization : Token

#### Request:

```js
axios
	.patch(
		`/api/users/compleate/${userId}`,
		{
			phone: {phone_1: "123456789", phone_2: "987654321"},
			address: {city: "City", street: "Street", houseNumber: "123"},
		},
		{
			headers: {Authorization: token}, // Include token
		},
	)
	.then((response) => {
		console.log("User data completed:", response.data);
	})
	.catch((error) => {
		console.error("Error updating user data:", error.response.data);
	});
```

### Response:

-   Success: Updated user data.

-   Error: Unauthorized or validation errors.

---

### Change User Password (PATCH /api/users/password/:userId)

-   To change the password of a user (self or Admin), send a PATCH request with the new password

-   Authorization : self or Admin Token

#### Request:

```js
axios
	.patch(
		`/api/users/password/${userId}`,
		{
			newPassword: "newStrongPassword123",
		},
		{
			headers: {Authorization: token},
		},
	)
	.then((response) => {
		console.log("Password updated:", response.data);
	})
	.catch((error) => {
		console.error("Error updating password:", error.response.data);
	});
```

### Response:

-   Success: Success message.

-   Error: Invalid password or unauthorized.

---

### Delete User (DELETE /api/users/:userId)

-   To delete a user (self or Admin), send a DELETE request.

#### Request:

```js
axios
	.delete(`/api/users/${userId}`, {
		headers: {Authorization: token},
	})
	.then((response) => {
		console.log("User deleted:", response.data);
	})
	.catch((error) => {
		console.error("Error deleting user:", error.response.data);
	});
```

### Response:

-   Success: Deleted user details.

-   Error: Unauthorized or user not found.

---

# Products

-   This section contains the API routes responsible for handling product-related actions. These routes allow for searching, creating, updating, deleting, and fetching products based on various criteria such as category or specific product name.

### Products (GET /api/products)

-   Get all products (used for searching in the home page).

-   Permissions: Public

#### Request:

```js
axios
	.get("/api/products")
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: Returns a list of all products.

-   404 Not Found: If no products are found.

---

### Products (POST /api/products)

-   Create a new product

-   Permissions: Only Admins and Moderators can access this route

-   Request: Product data in the request body (must follow the productsSchema)

-   Authorization : Admin or Moderator Token

#### Request:

```js
axios
	.post("/api/products", productData, {headers: {Authorization: userToken}})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

```json
{
	"product_name": "תות שדה",
	"category": "Fruit",
	"price": 13.5,
	"quantity_in_stock": 87,
	"description": "Fresh and sweet strawberries.",
	"image_url": "https://images.unsplash.com/photo-1592457765434-70aacc2da743?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHN0cmF3YmVycnl8ZW58MHx8MHx8fDA%3D",
	"sale": false,
	"discount": 0
}
```

#### Available Categories:

-   Fruit
-   Vegetable
-   Meat and Fish
-   Dairy
-   Spices
-   Bakery
-   Beverages
-   Frozen
-   Snacks
-   Baby
-   Cleaning
-   Pasta and Rice
-   House
-   Alcohol
-   Health

#### Response:

-   201 Created: Returns the newly created product

-   400 Bad Request: If the data validation fails or the product already exists

-   401 Unauthorized: If the user is not an Admin or Moderator

-   Authorization : Admin or Moderator Token

---

### Products (GET /api/products/spicific/:name)

-   Get a specific product by name (Admin and Moderator only)

-   Permissions: Only Admins and Moderators can access this route

-   Request: Product name in the URL parameter

-   Authorization : Admin or Moderator Token

#### Request:

```js
axios
	.get("/api/products/spicific/productName", {headers: {Authorization: userToken}})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: Returns the product details.

-   401 Unauthorized: If the user is not an Admin or Moderator.

-   404 Not Found: If the product is not found.

-   Authorization : Admin or Moderator Token

---

### Products (PUT /api/products/:productName)

-   Update a specific product by name (Admin and Moderator only)

-   Permissions: Only Admins and Moderators can access this route.

-   Request: Product data to update in the request body (must follow the productsSchema)

-   Authorization : Admin or Moderator Token

#### Request:

```js
axios
	.put("/api/products/productName", updatedProductData, {
		headers: {Authorization: userToken},
	})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: If the product is successfully deleted.

-   401 Unauthorized: If the user is not an Admin or Moderator.

-   404 Not Found: If the product does not exist.

---

### Products (DELETE /api/products/:name)

-   Delete a specific product by name (Admin and Moderator only).

-   Permissions: Only Admins and Moderators can access this route.

-   Authorization : Admin or Moderator Token

#### Request:

```js
axios
	.delete("/api/products/productName", {headers: {Authorization: userToken}})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: If the product is successfully deleted.

-   401 Unauthorized: If the user is not an Admin or Moderator.

-   404 Not Found: If the product does not exist.

---

### Products (GET /api/products/:category)

-   Get products by category

-   Permissions: Public

-   Request: Category name in the URL parameter.

#### Request:

```js
axios
	.get("/api/products/categoryName")
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: Returns a list of products in the specified category.

-   404 Not Found: If no products are found in the specified category.

---

# Cart

-   Add Product to Cart (POST /api/cart)

-   Authorization : Token

-   Adds a product to the current user's cart or updates quantity if it already exists

#### Body Request

```json
{
	"userId": "$dfsd1584sda....",
	"products": [
		{
			"product_name": "Product Name",
			"quantity": 2,
			"product_price": 50,
			"product_image": "url_to_image",
			"sale": true,
			"discount": 10
		}
	],
	"total_price": 100;
}
```

#### Example with Axios

```js
axios
	.post("/api/cart", productData, {headers: {Authorization: token}})
	.then((res) => console.log(res.data))
	.catch((err) => console.error(err.response.data));
```

#### Response:

-   Success: "Product added to cart successfully"

-   Error: 400 Bad Request: Validation error or missing data

-   404 Not Found: Product does not exist

---

### Get Current User Cart (GET /api/cart/my-cart)

-   Authorization : Token

-   Fetches the cart of the current user

#### Request:

```js
axios
	.get("/api/cart/my-cart", {headers: {Authorization: token}})
	.then((res) => console.log(res.data))
	.catch((err) => console.error(err.response.data));
```

#### Response:

-   Success

```json
[
	{
		"userId": "user_id",
		"products": [
			{
				"product_name": "Product Name",
				"quantity": 2,
				"product_price": 100,
				"product_image": "url",
				"sale": true,
				"discount": 10
			}
		]
	}
]
```

-   Error 404 Not Found: Cart not found

---

### Get All Carts (Admin Only) (GET /api/cart/admin)

-   Authorization : AdminToken

-   Success 200 OK: Returns Array of all carts

-   Error 401 Unauthorized: Non-admin access

-   404 Not Found: No carts found

---

### Delete Product from Cart (DELETE /api/cart/:product_name)

-   Authorization : Token

#### Request:

```js
axios
	.delete("/api/cart/Coca-Cola", {headers: {Authorization: token}})
	.then((res) => console.log(res.data))
	.catch((err) => console.error(err.response.data));
```

#### Response:

-   200 OK: "Product removed from cart successfully"

-   Error: 404 Not Found: Cart or product not found.

-   Error: 403 Forbidden: Authenticated user doesn't match.

---

# Business

### Get Business Info (GET /api/business-info)

-   Retrieves the business information document

#### Request:

```js
axios
	.get("/api/business-info")
	.then((res) => console.log(res.data))
	.catch((err) => console.error(err.response.data));
```

#### Response:

-   Success

```json
{
	"business_name": "Shok Habena Market",
	"phone": "03-1234567",
	"email": "info@Shok Habena-market.com",
	"address": "123 Main Street, Tel Aviv",
	"hours": "Sun-Thu: 08:00-20:00"
}
```

-   Error 400 Bad Request: Server error (invalid DB state or query issue).

---

### Update Business Info (PUT /api/business-info)

-   Authorization : AdminToken

-   Updates the business information

#### Request:

```js
axios
	.put("/api/business-info", updatedBusinessInfo, {
		headers: {Authorization: token},
	})
	.then((res) => console.log(res.data))
	.catch((err) => console.error(err.response.data));
```

#### Response:

-   Success

```json
{
	"business_name": "Shok Habena Market",
	"phone": "03-1234567",
	"email": "info@Shok Habena-market.com",
	"address": "123 Main Street, Tel Aviv",
	"hours": "Sun-Thu: 08:00-20:00"
}
```

-   200 OK: Updated business info document.

-   Error 401 Unauthorized: User is not an admin.

# **_Orders_**

### Create New Order (POST /api/orders)

-   Authorization: Token (Client)

-   Create a new order for the logged-in user

#### Request:

```js
axios.post("/api/orders", orderData, {
	headers: {
		Authorization: token,
	},
});
```

#### Response:

-   Success: The created order object.

-   Error: Validation or server error

---

### Get All Orders (GET /api/orders)

-   Retrieve all orders from all users

-   Authorization: Admin or Moderator token

#### Request:

```js
axios.get("/api/orders", {
	headers: {
		Authorization: adminToken,
	},
});
```

#### Response:

-   Success: Array of all orders

-   Unauthorized or server error

---

### Get Orders by User ID (GET /api/orders/:userId)

-   Get all orders for a specific user

-   Admin or Moderator or the owner user Token

#### Request:

```js
axios.get(`/api/orders/${userId}`, {
	headers: {
		Authorization: token,
	},
});
```

#### Response:

-   Success: Array of user's orders

-   Unauthorized or server error

---

### Get Order Details (GET /api/orders/details/:orderNumber)

-   Token (any user with access)

-   Retrieve a specific order by its number

#### Request:

```js
axios.get(`/api/orders/details/${orderNumber}`, {
	headers: {
		Authorization: token,
	},
});
```

#### Response:

-   Success: Full order data

-   Not found or server error

---

### Update Order Status (PATCH /api/orders/:orderNumber)

-   Admin or Moderator token

-   : Update the status of a specific order

#### Request:

```js
axios.patch(
	`/api/orders/${orderNumber}`,
	{status: "Delivered"},
	{headers: {Authorization: adminToken}},
);
```

#### Response:

-   Success: Updated order object

-   Real-time: Sends a socket event to the client with the updated status notifications

-   Error: Unauthorized or not found

---

# Discounts

### Get Discounted Products (GET /api/discounts)

-   Authorization: (Public)

-   Description: Retrieve up to 20 products that are currently on sale (sale: true)

#### Request:

```js
axios
	.get("/api/discounts")
	.then((response) => {
		console.log("Discounted products:", response.data);
	})
	.catch((error) => {
		console.error("Error fetching discounts:", error.response.data);
	});
```

#### Response:

-   Success: Array of up to 20 discounted products

-   404 Not Found: No discounted products available

#### Example Response:

```json
[
	{
		"_id": "product_id",
		"name": "Product Name",
		"price": 100,
		"sale": true,
		...
	}
	...
]
```

---

# receipts

### receipts (post /api/receipts)

```json
{
	"userId": "$jdsf564....",
	"orderNumber": "ORD-58362",
	"orderDate": "2025-04-14T09:13:01.357+00:00",
	"customer": {
		"name": {
			"first": "jon",
			"last": "bill"
		},
		"email": "jon@gmail.com",
		"phone": {
			"phone_1": "053835458",
			"phone_2": ""
		},
		"address": {
			"city": "Tel aviv",
			"street": "bengorion",
			"houseNumber": "29"
		}
	},
	"products": [
		{
			"product_name": "חטיפי חמאה",
			"quantity": 2,
			"product_price": 10.8
		},
		{
			"product_name": "סנדוויצ'ים מוכנים",
			"quantity": 4,
			"product_price": 48
		},
		{
			"product_name": "סוכריות גומי",
			"quantity": 2,
			"product_price": 8.8
		}
	],
	"payment": "false",
	"deliveryFee": 25,
	"discount": 0,
	 "totalAmount": 92.6,
	  "businessInfo": {
    "name": "שוק הפינה פירות ירקות ועוד",
    "phone": "0538346915",
    "email": "support@fruitsandveg.com",
    "address": "שדרות ירושלים 45, תל אביב"
  },
}
```

### receipts (GET /api/receipts)

-   Fetch all receipts

-   Permissions: Only Admins can access this route.

-   Authorization : AdminToken

#### Request:

```js
axios
	.get("/api/receipts", {headers: {Authorization: adminToken}})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 OK: Returns a list of all receipts

-   403 Forbidden: If the user is not an Admin

-   404 Not Found: If no receipts are found

---

### receipts (GET/api/receipts/:userId)

-   Fetch receipts for a specific user

-   Permissions: User can only access their own receipts or an Admin can access any user's receipts.

-   Authorization : AdminToken

#### Request:

```js
axios
	.get("/api/receipts/userId123", {headers: {Authorization: userToken}})
	.then((response) => console.log(response.data))
	.catch((error) => console.error(error.response.data));
```

#### Response:

-   200 Accepted: Returns a list of the user's receipts

-   401 Unauthorized: If the user attempts to access receipts of another user without proper authorization

-   404 Not Found: If no receipts are found for the given user

#### Security:

-   Authorization Middleware: Both routes utilize the auth middleware to ensure the user is authenticated. The admin check is done on the first route (GET /api/receipts), and the second route checks that the logged-in user is trying to access their own receipts

-   Admin Route: Only users with the role Admin can access all receipts

-   User Route: Users can only access their own receipts, and Admins can access any user's receipts
