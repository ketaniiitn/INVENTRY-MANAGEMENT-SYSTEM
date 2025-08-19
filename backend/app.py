from flask import Flask, jsonify
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
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://taupe-dango-df2abe.netlify.app"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
}, supports_credentials=True)

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
    db = None

# --- Health Route ---
@app.route("/health", methods=["GET"])
def health_check():
    try:
        # Check MongoDB connection
        if db is not None:
            db_status = "connected"
            db_name = db.name
        else:
            db_status = "disconnected"
            db_name = None

        return jsonify({
            "status": "ok",
            "service": "Inventory Management API",
            "database": db_status,
            "database_name": db_name
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# --- Register Blueprints ---
app.register_blueprint(auth_bp, url_prefix='/')
app.register_blueprint(product_bp, url_prefix='/products')

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)





# from flask import Flask
# from flask_cors import CORS
# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os
# from flasgger import Swagger

# from auth import auth_bp
# from products import product_bp

# # --- Load environment variables ---
# load_dotenv()
# app = Flask(__name__)

# # --- Configuration ---
# app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# mongo_uri = os.getenv('MONGO_URI')

# # --- Enable CORS ---
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# # --- Swagger Configuration ---
# swagger_template = {
#     "swagger": "2.0",
#     "info": {
#         "title": "📦 Inventory Management API",
#         "description": """
# Welcome to the **Inventory Management API**! 🚀

# This API provides endpoints for managing products and authenticating users.

# ---

# ### 🔐 Authentication Steps

# 1. Register a new user via the **POST /register** endpoint.  
# 2. Log in with your credentials using **POST /login** to receive a **JWT access token**.  
# 3. Click the green **Authorize** button and enter your token in this format: **Bearer <your_token>**
# 4. You can now access all **protected product endpoints**.

# ---

# ### 📘 General Rules

# - All request and response bodies use **JSON format**.  
# - Refer to the **Models section** below for required schema formats.
# """,
#      "version": "1.0.0"
#  },
#  "host": "localhost:8080",
#  "basePath": "/",
#  "schemes": [
#      "http"
#  ],
#  "securityDefinitions": {
#      "bearerAuth": {
#          "type": "apiKey",
#          "name": "Authorization",
#          "in": "header",
#          "description": "Enter your bearer token in the format: `Bearer <token>`"
#      }
#  }
# }

# swagger = Swagger(app, template=swagger_template)

# # --- MongoDB Setup ---
# try:
#  client = MongoClient(mongo_uri)
#  db = client.inventory_db
#  app.db = db
#  print("✅ Connected to MongoDB:", db.name)
# except Exception as e:
#  print(f"❌ Could not connect to MongoDB: {e}")

# # --- Register Blueprints ---
# app.register_blueprint(auth_bp, url_prefix='/')
# app.register_blueprint(product_bp, url_prefix='/products')

# # --- Run App ---
# if __name__ == '__main__':
#  app.run(debug=True, host='0.0.0.0', port=8080)
