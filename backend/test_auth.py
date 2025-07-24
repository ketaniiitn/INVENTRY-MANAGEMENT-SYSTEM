import pytest
import json
import jwt
from flask import Flask, current_app
from mongomock import MongoClient
from auth import auth_bp # Assuming your blueprint is in auth.py

# --- Test Fixtures: Setting up a test environment ---

@pytest.fixture(scope='module')
def app():
    """
    A pytest fixture to initialize the Flask application for testing.
    It sets up a mock database and registers the authentication blueprint.
    """
    # Create a Flask application instance
    flask_app = Flask(__name__)
    
    # Configuration for testing
    flask_app.config['TESTING'] = True
    flask_app.config['SECRET_KEY'] = 'test-secret-key-for-jwt' # A consistent key for testing JWT
    
    # Use mongomock for an in-memory MongoDB instance
    # This prevents tests from affecting a real database
    client = MongoClient()
    flask_app.db = client.testdb
    
    # Register the authentication blueprint
    flask_app.register_blueprint(auth_bp)
    
    yield flask_app
    
    # Teardown: close the client after tests are done
    client.close()


@pytest.fixture
def client(app):
    """
    A pytest fixture that provides a test client for the Flask application.
    It also cleans the users collection before each test to ensure isolation.
    """
    # Clean up the database before each test to ensure independence
    with app.app_context():
        current_app.db.users.delete_many({})

    # Return the test client
    return app.test_client()

# --- Test Cases ---

# --- Tests for the /register Endpoint ---

def test_register_user_success(client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/register' endpoint is posted to with a new username and password
    THEN check for a 201 status code and a success message.
    """
    response = client.post('/register', 
                           data=json.dumps(dict(username='testuser', password='password123')),
                           content_type='application/json')
    
    data = response.get_json()
    assert response.status_code == 201
    assert data['message'] == 'New user created!'

def test_register_user_already_exists(client):
    """
    GIVEN a user already exists in the database
    WHEN the '/register' endpoint is posted to with the same username
    THEN check for a 409 (Conflict) status code.
    """
    # First, create a user
    client.post('/register', 
                data=json.dumps(dict(username='existinguser', password='password123')),
                content_type='application/json')
                
    # Now, try to create the same user again
    response = client.post('/register', 
                           data=json.dumps(dict(username='existinguser', password='password123')),
                           content_type='application/json')
                           
    data = response.get_json()
    assert response.status_code == 409
    assert data['message'] == 'User already exists!'

def test_register_missing_username(client):
    """
    GIVEN a request to '/register'
    WHEN the payload is missing the 'username' field
    THEN check for a 400 (Bad Request) status code.
    """
    response = client.post('/register', 
                           data=json.dumps(dict(password='password123')),
                           content_type='application/json')
    assert response.status_code == 400

def test_register_missing_password(client):
    """
    GIVEN a request to '/register'
    WHEN the payload is missing the 'password' field
    THEN check for a 400 (Bad Request) status code.
    """
    response = client.post('/register', 
                           data=json.dumps(dict(username='testuser')),
                           content_type='application/json')
    assert response.status_code == 400

def test_register_empty_payload(client):
    """
    GIVEN a request to '/register'
    WHEN the payload is an empty JSON object
    THEN check for a 400 (Bad Request) status code.
    """
    response = client.post('/register', 
                           data=json.dumps({}),
                           content_type='application/json')
    assert response.status_code == 400


# --- Tests for the /login Endpoint ---

def test_login_success(client, app):
    """
    GIVEN a registered user
    WHEN the '/login' endpoint is posted to with correct credentials
    THEN check for a 200 status code and a valid JWT access token.
    """
    # First, register the user
    client.post('/register', 
                data=json.dumps(dict(username='loginuser', password='password123')),
                content_type='application/json')

    # Then, attempt to log in
    response = client.post('/login', 
                           data=json.dumps(dict(username='loginuser', password='password123')),
                           content_type='application/json')
    
    data = response.get_json()
    assert response.status_code == 200
    assert 'access_token' in data

    # Verify the token is a valid JWT and contains the correct public_id
    with app.app_context():
        user = current_app.db.users.find_one({'username': 'loginuser'})
        decoded_token = jwt.decode(data['access_token'], app.config['SECRET_KEY'], algorithms=["HS256"])
        assert decoded_token['public_id'] == user['public_id']


def test_login_wrong_password(client):
    """
    GIVEN a registered user
    WHEN the '/login' endpoint is posted to with an incorrect password
    THEN check for a 401 (Unauthorized) status code.
    """
    # Register user
    client.post('/register', 
                data=json.dumps(dict(username='testuser', password='correct_password')),
                content_type='application/json')
    
    # Attempt login with wrong password
    response = client.post('/login', 
                           data=json.dumps(dict(username='testuser', password='wrong_password')),
                           content_type='application/json')
    
    assert response.status_code == 401

def test_login_user_not_found(client):
    """
    GIVEN a user that is not registered
    WHEN the '/login' endpoint is posted to with their credentials
    THEN check for a 401 (Unauthorized) status code.
    """
    response = client.post('/login', 
                           data=json.dumps(dict(username='nonexistentuser', password='password123')),
                           content_type='application/json')
    
    assert response.status_code == 401

def test_login_missing_username(client):
    """
    GIVEN a request to '/login'
    WHEN the payload is missing the 'username' field
    THEN check for a 401 (Unauthorized) status code.
    """
    response = client.post('/login', 
                           data=json.dumps(dict(password='password123')),
                           content_type='application/json')
    assert response.status_code == 401
    
def test_login_missing_password(client):
    """
    GIVEN a request to '/login'
    WHEN the payload is missing the 'password' field
    THEN check for a 401 (Unauthorized) status code.
    """
    response = client.post('/login', 
                           data=json.dumps(dict(username='testuser')),
                           content_type='application/json')
    assert response.status_code == 401