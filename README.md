# Inventory Management System

This project is a full-stack inventory management application built with a Python/Flask backend, a MongoDB database, and a React frontend. It provides secure, token-based REST APIs for user authentication and product inventory management.

## Features

- **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
- **Product Management**: Add, view, and update product information.
- **Unique SKU Enforcement**: Ensures every product has a unique Stock Keeping Unit (SKU).
- **Paginated API**: Efficiently retrieves product lists page by page.
- **Interactive Frontend**: A modern, responsive React UI to interact with the inventory.
- **Product Detail Modal**: Click on any product to view its full details and update stock in a pop-up modal.

## Technology Stack

- **Backend**: Python, Flask, PyJWT, Flask-Cors,Pytests,requests
- **Database**: MongoDB
- **Frontend**: React, Vite, Tailwind CSS, Axios, react-hot-toast,Shadcn/ui.

---

## Database Schema

The application uses a MongoDB database named `inventory_db` with two main collections:

### 1. `users` Collection
Stores user credentials.
- `_id`: ObjectId (Primary Key)
- `public_id`: String (Unique ID for API usage)
- `username`: String (Unique)
- `password`: String (Hashed)

### 2. `products` Collection
Stores product inventory information.
- `_id`: ObjectId (Primary Key)
- `name`: String
- `type`: String
- `sku`: String (Unique)
- `description`: String
- `image_url`: String
- `quantity`: Integer (Positive Value)
- `price`: Float (Positive Value)
- `added_by`: String (public_id of the user who added it)

---

## Setup and Installation

### Prerequisites
- Python 3.7+
- Node.js and npm
- MongoDB 

### 1. Backend Setup

#### Clone the repository
```bash
git clone <your-github-repo-link>
cd INVENTRY-MANAGEMENT-SYSTEM/backend
```
#### Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
On Windows: venv\Scripts\activate
```


# Install dependencies
```bash
pip install -r requirements.txt
```
# IMPORTANT: Database Initialization
 Connect to MongoDB 
 > use inventory_db


# Run the backend server
```bash
python app.py
```
> The backend server will be running on `http://localhost:8080`.

---


# 2. Docker Setup (Containerized Deployment)

#### 🔨 Build Docker Image

Make sure you're in the **root directory** of the project:

```bash
docker build -f Dockerfile.backend -t inventory-management .
-f Dockerfile.backend → custom Dockerfile name
-t inventory-management → name/tag for your Docker image
```

▶️ Run Docker Container
---
Option 1: Use Default Environment Variables
(Default values are defined inside Dockerfile.backend)
```bash
docker run -p 8080:8080 inventory-management
```
Option 2: Override Environment Variables at Runtime
If you want to provide your own environment variables instead of the defaults:
```bash
docker run -p 8080:8080 \
  -e SECRET_KEY="your_custom_secret_key" \
  -e MONGO_URI="your_custom_mongo_uri" \
  inventory-management
```

# 3. Frontend Setup


### Open a new terminal and navigate to the frontend folder
```bash
cd ../frontend
```
### Install dependencies
```bash
npm install
```
### Run the frontend development server
```bash
npm run dev
```
> The frontend will be running on `http://localhost:3000` (or another available port).

---

## ✅ How to Test

You can test the application in two ways:

---

### 🔹 1. Manual Testing

Open the frontend in your browser:

- Register a new user
- Log in with the created account
- Add, view, update products via the UI

---

### 🔹 2. Automated API Testing

You can run backend tests directly using the following commands:

#### ▶️ Run standalone Python test script:

```bash
# Inside the backend folder (with virtual environment activated)
python test_api.py
```
#### ▶️ Run pytest-based unit tests:

```bash
# Test authentication endpoints
pytest -v test_auth.py

# Test product-related endpoints
pytest -v test_products.py
```
## 🔐 Login Page
![Login](./frontend/src/assets/Login.png)

## 📋 Dashboard View
![Dashboard](./frontend/src/assets/Dashboard.png)

## 👁️ Product View Modal
![View](./frontend/src/assets/View.png)

## ♻️ Update Stock Modal
![Update Stock](./frontend/src/assets/UpdateStock.png)

## 🔄 Route Check Example
![Route Check](./frontend/src/assets/RouteCheck.png)

---

