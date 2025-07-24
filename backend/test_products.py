import pytest
import requests
from uuid import uuid4

BASE_URL = "http://127.0.0.1:8080"

@pytest.fixture(scope="module")
def token():
    """Fixture to get a token once for all tests."""
    username = f"testuser_{uuid4().hex}"
    password = "password123"
    requests.post(f"{BASE_URL}/register", json={"username": username, "password": password})
    res = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

# --- Tests ---

def test_add_product_success(token):
    """Tests successful product addition with a unique SKU."""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Laptop Pro", "type": "Electronics", "sku": f"LP-{uuid4().hex}",
        "description": "A powerful new laptop.", "quantity": 50, "price": 1299.99
    }
    res = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
    assert res.status_code == 201
    assert "product_id" in res.json()

def test_add_product_with_duplicate_sku(token):
    """Tests that adding a duplicate SKU returns a 409 Conflict."""
    headers = {"Authorization": f"Bearer {token}"}
    sku = f"UNIQUE-SKU-{uuid4().hex}"
    payload = {"name": "First", "type": "Test", "sku": sku, "quantity": 10, "price": 10.0}

    res1 = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
    assert res1.status_code == 201

    res2 = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
    # FIX: Assert for 409, because the app logic is now correct
    assert res2.status_code == 409

def test_add_product_with_negative_quantity(token):
    """Tests that adding a product with negative quantity fails with 400."""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Bad Product", "type": "Invalid", "sku": f"NEG-QTY-{uuid4().hex}",
        "quantity": -10, "price": 100.0
    }
    res = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
    # FIX: Assert for 400, because the app logic is now correct
    assert res.status_code == 400

def test_get_products_success(token):
    """Tests successful retrieval of paginated products."""
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/products?page=1&per_page=5", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_products_with_negative_page(token):
    """Tests that getting products with a negative page number fails with 400."""
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/products?page=-1", headers=headers)
    assert res.status_code == 400

def test_update_quantity_success(token):
    """Tests successful quantity update with a unique SKU."""
    headers = {"Authorization": f"Bearer {token}"}
    add_payload = {
        "name": "Updatable", "type": "Inventory", "sku": f"UPD-{uuid4().hex}",
        "quantity": 100, "price": 50.0
    }
    add_res = requests.post(f"{BASE_URL}/products", json=add_payload, headers=headers)
    assert add_res.status_code == 201
    product_id = add_res.json()["product_id"]

    update_payload = {"quantity": 150}
    update_res = requests.put(f"{BASE_URL}/products/{product_id}/quantity", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["quantity"] == 150

def test_update_quantity_to_negative(token):
    """Tests that updating quantity to a negative value fails with 400."""
    headers = {"Authorization": f"Bearer {token}"}
    add_payload = {
        "name": "Negative Test", "type": "Inventory", "sku": f"NEG-UPD-{uuid4().hex}",
        "quantity": 50, "price": 50.0
    }
    add_res = requests.post(f"{BASE_URL}/products", json=add_payload, headers=headers)
    assert add_res.status_code == 201
    product_id = add_res.json()["product_id"]

    update_payload = {"quantity": -5}
    update_res = requests.put(f"{BASE_URL}/products/{product_id}/quantity", json=update_payload, headers=headers)
    # FIX: Assert for 400, because the app logic is now correct
    assert update_res.status_code == 400