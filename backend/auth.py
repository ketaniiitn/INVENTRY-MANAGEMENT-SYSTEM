from flask import Blueprint, request, jsonify, make_response, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register_user():
    """
    Register a new user
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: The user's username.
            password:
              type: string
              description: The user's password.
    responses:
      201:
        description: New user created!
      400:
        description: Username and password required!
      409:
        description: User already exists!
    """
    if request.method == 'OPTIONS':
        return '', 204
    db = current_app.db
    users_collection = db.users

    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return make_response('Could not verify', 400, {'WWW-Authenticate': 'Basic realm="Username and password required!"'})

    username = data.get('username')
    password = data.get('password')

    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists!'}), 409

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    public_id = str(ObjectId())

    users_collection.insert_one({
        'public_id': public_id,
        'username': username,
        'password': hashed_password
    })

    return jsonify({'message': 'New user created!'}), 201


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    Log in a user and generate an access token
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: The user's username.
            password:
              type: string
              description: The user's password.
    responses:
      200:
        description: Successfully logged in.
        schema:
          type: object
          properties:
            access_token:
              type: string
              description: JWT access token.
      401:
        description: Could not verify - login failed.
    """
    if request.method == 'OPTIONS':
        return '', 204
    db = current_app.db
    users_collection = db.users

    auth = request.get_json()

    if not auth or not auth.get('username') or not auth.get('password'):
        return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    user = users_collection.find_one({'username': auth['username']})
    if not user:
        return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="User does not exist!"'})

    if check_password_hash(user['password'], auth['password']):
        token = jwt.encode({
            'public_id': user['public_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'access_token': token})

    return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Wrong password!"'})
