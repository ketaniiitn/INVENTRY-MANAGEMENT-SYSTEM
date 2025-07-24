from flask import Blueprint, request, jsonify, make_response, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from bson import ObjectId
from flasgger import swag_from

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Register a new user',
    'parameters': [
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'id': 'UserRegistration',
                'required': ['username', 'password'],
                'properties': {
                    'username': {
                        'type': 'string',
                        'description': 'The username for the new user.'
                    },
                    'password': {
                        'type': 'string',
                        'description': 'The password for the new user.'
                    }
                }
            }
        }
    ],
    'responses': {
        '201': {'description': 'New user created!'},
        '400': {'description': 'Username and password required!'},
        '409': {'description': 'User already exists!'}
    }
})
def register_user():
    db = current_app.db
    users_collection = db.users
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return make_response('Could not verify', 400, {'WWW-Authenticate': 'Basic realm="Username and password required!"'})

    if users_collection.find_one({'username': data['username']}):
        return jsonify({'message': 'User already exists!'}), 409

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    users_collection.insert_one({
        'public_id': str(ObjectId()),
        'username': data['username'],
        'password': hashed_password
    })

    return jsonify({'message': 'New user created!'}), 201


@auth_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Log in a user',
    'parameters': [
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'id': 'UserLogin',
                'required': ['username', 'password'],
                'properties': {
                    'username': {
                        'type': 'string',
                        'description': 'The user\'s registered username.'
                    },
                    'password': {
                        'type': 'string',
                        'description': 'The user\'s password.'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Login successful, returns access token.',
            'schema': {
                'properties': {
                    'access_token': {'type': 'string'}
                }
            }
        },
        '401': {'description': 'Could not verify login details.'}
    }
})
def login():
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
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'access_token': token})

    return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Wrong password!"'})
