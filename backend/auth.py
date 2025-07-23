from flask import Blueprint, request, jsonify, make_response, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register_user():
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
