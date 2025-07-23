from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

from auth import auth_bp
from products import product_bp
load_dotenv()

# --- Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)


# --- Configuration ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
mongo_uri = os.getenv('MONGO_URI')

# MongoDB Setup
client = MongoClient(mongo_uri)
db = client.inventory_db
print("Connected to MongoDB:", db.name)
app.db = db  

# --- Register Blueprints ---
app.register_blueprint(auth_bp, url_prefix='/')
app.register_blueprint(product_bp, url_prefix='/products')

# --- Main ---
if __name__ == '__main__':
    app.run(debug=True, port=8080)
