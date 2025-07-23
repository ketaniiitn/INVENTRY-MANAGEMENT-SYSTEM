import requests
import sys

BASE_URL = "http://localhost:8080" 

def print_result(test_name, passed, expected=None, got=None, request_data=None, response_body=None):
    """
    Prints the result of a test in a formatted way.
    """
    if passed:
        print(f"✅ {test_name}: PASSED")
    else:
        print(f"❌ {test_name}: FAILED")
        if request_data:
            print(f"   Request Data: {request_data}")
        if expected is not None and got is not None:
            print(f"   Expected: {expected}, Got: {got}")
        if response_body:
            
            response_text = str(response_body)
            if len(response_text) > 250:
                response_text = response_text[:250] + "..."
            print(f"   Response Body: {response_text}")
    print("-" * 50)


def test_register_user():
    """
    Tests the user registration endpoint.
    Expected status codes are 201 (Created) or 409 (Conflict if user already exists).
    """
    print("Running: User Registration Test")

    payload = {"username": "puja", "password": "mypassword"} 
    try:
        res = requests.post(f"{BASE_URL}/register", json=payload)
        passed = res.status_code in [201, 409]
        print_result("User Registration", passed, "201 or 409", res.status_code, payload, res.text)
        return passed
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: Could not connect to the server at {BASE_URL}.")
        print("   Please ensure your Flask backend is running.")
        return False


def test_login():
    """
    Tests the user login endpoint.
    On success, expects a 200 status and an 'access_token' in the JSON response.
    Returns the token for use in subsequent authenticated requests.
    """
    print("Running: Login Test")
    payload = {"username": "puja", "password": "mypassword"}
    try:
        res = requests.post(f"{BASE_URL}/login", json=payload)
        token = None
        passed = False
        if res.status_code == 200:
            try:
                # The script expects the token to be in a key named 'access_token'
                token = res.json().get("access_token")
                passed = token is not None
            except (ValueError, AttributeError):
                passed = False
        
        print_result("Login Test", passed, "200 and a valid token", res.status_code, payload, res.text)
        return token
    except requests.exceptions.ConnectionError:
        return None


def test_add_product(token):
    """
    Tests the product addition endpoint.
    Requires an authentication token.
    Returns the product_id on success to be used in other tests.
    """
    print("Running: Add Product Test")
    payload = {
        "name": "Phone",
        "type": "Electronics",
        "sku": "PHN-001",
        "image_url": "https://example.com/phone.jpg",
        "description": "Latest Phone",
        "quantity": 5,
        "price": 999.99
    }
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
        product_id = None
        passed = res.status_code == 201
        if passed:
            try:
                
                product_id = res.json().get("product_id")
                if product_id is None:
                    passed = False 
            except (ValueError, AttributeError):
                passed = False
        
        print_result("Add Product", passed, "201 and a product_id", res.status_code, payload, res.text)
        return product_id
    except requests.exceptions.ConnectionError:
        return None


def test_update_quantity(token, product_id, new_quantity):
    """
    Tests the update quantity endpoint for a specific product.
    """
    print(f"Running: Update Quantity Test (New Quantity: {new_quantity})")
    payload = {"quantity": new_quantity}
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.put(f"{BASE_URL}/products/{product_id}/quantity", json=payload, headers=headers)
        passed = res.status_code == 200
        print_result("Update Quantity", passed, 200, res.status_code, payload, res.text)
        return passed
    except requests.exceptions.ConnectionError:
        return False


def test_get_products(token, expected_quantity):
    """
    Tests fetching the list of products and verifies the quantity of a specific product.
    """
    print("Running: Get Products Test")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.get(f"{BASE_URL}/products", headers=headers)

        if res.status_code != 200:
            print_result("Get Products (API Call)", False, 200, res.status_code, None, res.text)
            return False

        try:
            products = res.json()
        except ValueError:
            print_result("Get Products (JSON Parsing)", False, "valid JSON list", "Invalid JSON", None, res.text)
            return False
        
        
        phone_products = [p for p in products if p.get("sku") == "PHN-001"]

        if not phone_products:
            print_result("Get Products (Product Found)", False, "Product with SKU 'PHN-001' to be in list", "Not found", None, products)
            return False
        
        
        phone_quantity = phone_products[0].get("quantity")
        passed = (phone_quantity == expected_quantity)
        print_result("Get Products (Quantity Check)", passed, f"Quantity = {expected_quantity}", f"Quantity = {phone_quantity}", None, products)
        return passed
    except requests.exceptions.ConnectionError:
        return False


def run_all_tests():
    """
    Runs all tests in sequence.
    If a critical test (like login) fails, subsequent tests are skipped.
    """
    print("--- Starting Inventory Management API Test Suite ---")
    
    if not test_register_user():
        print("\nRegistration test failed or server is down. Aborting tests.")
        sys.exit(1)

    token = test_login()
    if not token:
        print("\nLogin failed. Skipping further tests.")
        sys.exit(1)

    product_id = test_add_product(token)
    if not product_id:
        print("\nProduct creation failed. Skipping further tests.")
        sys.exit(1)
    
    # The script will test updating the quantity to 15
    new_quantity = 15 
    if not test_update_quantity(token, product_id, new_quantity):
        print("\nUpdate quantity failed. Skipping final get test.")
        sys.exit(1)

    if not test_get_products(token, expected_quantity=new_quantity):
         print("\nGet products test failed.")
         sys.exit(1)

    print("\n--- All tests completed successfully! ---")


if __name__ == "__main__":
    run_all_tests()
