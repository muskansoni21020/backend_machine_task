# Inventory & Order Management API

A simple RESTful backend API built with **Node.js** and **Express.js** for managing products, user authentication, inventory, and orders.

The API provides secure user authentication using JWT, product management, stock management, order creation, search/filtering, pagination, validation, and centralized error handling.

---

## 🚀 Features

### 🔐 User Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing for secure storage
* Protected APIs using authentication middleware

### 📦 Product Management

* Create products
* Get all products
* Get a single product
* Update products
* Delete products
* Search products by name
* Filter products by category
* Filter products by availability
* Pagination support

### 🛒 Order Management

* Create orders for authenticated users
* View logged-in user's orders
* View a specific order
* Validate product existence
* Validate requested quantity
* Automatically reduce product stock
* Calculate total order amount
* Handle invalid orders properly

### 🛡️ Security & Validation

* JWT authentication
* Secure password hashing
* Request validation
* Environment variables for sensitive configuration
* Proper HTTP status codes
* Centralized error handling
* Protected routes

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MySQL / SQL**
* **JWT**
* **bcrypt**
* **dotenv**
* **REST API**
* **Postman**

---

## 📁 Project Structure

```text
inventory-order-api/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   │
│   ├── db.js
│   ├── dbquery.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── postman/
│   └── Inventory-Order-API.postman_collection.json
│
├── .gitignore
└── README.md
```

> The exact structure may vary depending on the implementation.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd inventory-order-api
```

Navigate to the backend:

```bash
cd backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventory_db

JWT_SECRET=your_super_secret_jwt_key

JWT_EXPIRES_IN=1d
```

### Environment Variables

| Variable         | Description                   |
| ---------------- | ----------------------------- |
| `PORT`           | Port on which the server runs |
| `DB_HOST`        | Database host                 |
| `DB_USER`        | Database username             |
| `DB_PASSWORD`    | Database password             |
| `DB_NAME`        | Database name                 |
| `JWT_SECRET`     | Secret key used for JWT       |
| `JWT_EXPIRES_IN` | JWT expiration time           |

**Do not upload your `.env` file to GitHub.**

Make sure your `.gitignore` contains:

```gitignore
node_modules/
.env
```

---

# 🗄️ Database Setup

Create the required database in MySQL/PostgreSQL according to your implementation.

For example, with MySQL:

```sql
CREATE DATABASE inventory_db;
```

Then configure the database credentials in the `.env` file.

The application should contain tables/entities for:

* Users
* Products
* Orders
* Order Items

---

# ▶️ Running the Application

Start the backend:

```bash
npm start
```

Or, if using nodemon:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

---

# 🔑 Authentication APIs

## Register

### POST

```text
/api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Response

```json
{
  "message": "User registered successfully"
}
```

---

## Login

### POST

```text
/api/auth/login
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Response

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}
```

Use the returned token for protected APIs.

### Authorization Header

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 📦 Product APIs

## Create Product

### POST

```text
/products
```

### Request Body

```json
{
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": 2499,
  "stock_quantity": 20,
  "category": "electronics"
}
```

Authentication may be required depending on the implemented authorization rules.

---

## Get All Products

### GET

```text
/products
```

Supports:

* Search
* Category filtering
* Availability filtering
* Pagination

### Example

```text
/products?category=electronics&inStock=true&page=1&limit=10
```

### Search Example

```text
/products?search=headphones
```

### Category Example

```text
/products?category=electronics
```

### Availability Example

```text
/products?inStock=true
```

### Pagination Example

```text
/products?page=1&limit=10
```

---

## Get Product by ID

### GET

```text
/products/:id
```

Example:

```text
/products/1
```

---

## Update Product

### PATCH

```text
/products/:id
```

### Request Body

```json
{
  "price": 2299,
  "stock_quantity": 25
}
```

Only the fields that need to be changed should be provided.

---

## Delete Product

### DELETE

```text
/products/:id
```

Example:

```text
/products/1
```

---

# 🛒 Order APIs

All order APIs require authentication.

Use:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Create Order

### POST

```text
/orders
```

### Request Body

```json
{
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

When an order is created, the API:

1. Verifies that each product exists.
2. Checks whether the requested quantity is available.
3. Calculates the total amount.
4. Creates the order.
5. Reduces the product stock.
6. Stores the order for the logged-in user.

---

## Get My Orders

### GET

```text
/orders
```

Returns orders belonging to the currently authenticated user.

---

## Get Order by ID

### GET

```text
/orders/:id
```

Returns a specific order belonging to the authenticated user.

---

# 📊 Order Status

An order can have statuses such as:

```text
pending
confirmed
cancelled
completed
```

The exact statuses depend on the implementation.

---

# ❌ Error Handling

The API returns appropriate HTTP status codes and meaningful error messages.

Common status codes:

| Status Code | Meaning                                 |
| ----------- | --------------------------------------- |
| `200`       | Request successful                      |
| `201`       | Resource created successfully           |
| `400`       | Bad request / validation error          |
| `401`       | Authentication required / invalid token |
| `403`       | Access forbidden                        |
| `404`       | Resource not found                      |
| `409`       | Conflict                                |
| `500`       | Internal server error                   |

Example:

```json
{
  "message": "Insufficient stock"
}
```

---

# 🔎 Product Search, Filtering & Pagination

The `GET /products` endpoint supports multiple query parameters.

### Search

```text
/products?search=phone
```

### Category

```text
/products?category=electronics
```

### In Stock

```text
/products?inStock=true
```

### Pagination

```text
/products?page=2&limit=10
```

### Combined Query

```text
/products?search=phone&category=electronics&inStock=true&page=1&limit=10
```

---

# 📮 Postman Collection

A Postman collection is included in this repository for testing the APIs.

Import the following file into Postman:

```text
postman/Inventory-Order-API.postman_collection.json
```

The collection contains requests for:

### Authentication

* Register
* Login

### Products

* Create Product
* Get Products
* Get Product by ID
* Update Product
* Delete Product

### Orders

* Create Order
* Get My Orders
* Get Order by ID

---

# 🔐 Testing Protected APIs

First, register a user:

```text
POST /api/auth/register
```

Then login:

```text
POST /api/auth/login
```

Copy the JWT token from the login response.

In Postman, select:

```text
Authorization → Bearer Token
```

Then enter:

```text
<JWT_TOKEN>
```

You can now test protected endpoints such as:

```text
POST /orders
GET /orders
GET /orders/:id
```

---

# ⚡ Handling Concurrent Orders

### Question

> Imagine two users try to buy the last available item at the same time. How would you make sure the stock does not become negative or both orders get confirmed?

### Answer

The stock update should be performed atomically inside a database transaction.

Instead of first checking the stock and then updating it separately, the application should perform a conditional update such as:

```sql
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id = ? AND stock_quantity >= 1;
```

Then check the number of affected rows.

* If `1` row is updated, the purchase can continue.
* If `0` rows are updated, the product is out of stock and the order should not be confirmed.

For multiple products, the complete order creation and stock updates should ideally be handled inside a **database transaction**, with rollback if any product does not have sufficient stock.

This prevents stock from becoming negative and prevents both users from successfully purchasing the same last item.

---

# 🧪 API Testing

The APIs can be tested using:

* Postman
* Thunder Client
* Insomnia
* cURL

Example:

```bash
curl http://localhost:5000/products
```

---

# 🛡️ Basic Security Practices

This project follows basic backend security practices:

* Passwords are hashed before storing them.
* JWT is used for authentication.
* Sensitive credentials are stored in environment variables.
* `.env` is excluded from Git.
* Protected routes require authentication.
* Input validation is performed.
* Proper HTTP status codes are returned.
* Database errors are handled properly.

---

# 📌 Future Improvements

Possible improvements include:

* Role-based authorization
* Admin-only product management
* Refresh tokens
* Rate limiting
* API documentation using Swagger
* Automated unit and integration tests
* Database transactions for all order operations
* Docker support
* Production deployment
* Order cancellation and refund functionality

---

# 👩‍💻 Author

**Muskan Soni**

Full Stack Developer

Built using **Node.js, Express.js, SQL, JWT, and REST APIs**.

---

## 📄 License

This project is created for learning, assessment, and demonstration purposes.
