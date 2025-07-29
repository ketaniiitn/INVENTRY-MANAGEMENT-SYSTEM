from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flasgger import Swagger

from auth import auth_bp
from products import product_bp

# --- Load environment variables ---
load_dotenv()
app = Flask(__name__)

# --- Configuration ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
mongo_uri = os.getenv('MONGO_URI')

# --- Enable CORS ---
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# --- Swagger Configuration ---
swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "📦 Inventory Management API",
        "description": """
Welcome to the **Inventory Management API**! 🚀

This API provides endpoints for managing products and authenticating users.

---

### 🔐 Authentication Steps

1. Register a new user via the **POST /register** endpoint.  
2. Log in with your credentials using **POST /login** to receive a **JWT access token**.  
3. Click the green **Authorize** button and enter your token in this format: **Bearer <your_token>**
4. You can now access all **protected product endpoints**.

---

### 📘 General Rules

- All request and response bodies use **JSON format**.  
- Refer to the **Models section** below for required schema formats.
""",
     "version": "1.0.0"
 },
 "host": "localhost:8080",
 "basePath": "/",
 "schemes": [
     "http"
 ],
 "securityDefinitions": {
     "bearerAuth": {
         "type": "apiKey",
         "name": "Authorization",
         "in": "header",
         "description": "Enter your bearer token in the format: `Bearer <token>`"
     }
 }
}

swagger = Swagger(app, template=swagger_template)

# --- MongoDB Setup ---
try:
 client = MongoClient(mongo_uri)
 db = client.inventory_db
 app.db = db
 print("✅ Connected to MongoDB:", db.name)
except Exception as e:
 print(f"❌ Could not connect to MongoDB: {e}")

# --- Register Blueprints ---
app.register_blueprint(auth_bp, url_prefix='/')
app.register_blueprint(product_bp, url_prefix='/products')

# --- Run App ---
if __name__ == '__main__':
 app.run(debug=True, host='0.0.0.0', port=8080)
