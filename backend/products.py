from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from flasgger import swag_from
from utils import token_required

product_bp = Blueprint('products', __name__)

@product_bp.route('', methods=['POST'])
@token_required
@swag_from({
    'tags': ['Products'],
    'summary': 'Add a new product to the inventory',
    'security': [{'bearerAuth': []}],
    'parameters': [
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'id': 'Product',
                'required': ['name', 'type', 'sku', 'quantity', 'price'],
                'properties': {
                    'name': {'type': 'string', 'description': 'Name of the product.'},
                    'type': {'type': 'string', 'description': 'Type or category of the product.'},
                    'sku': {'type': 'string', 'description': 'Unique Stock Keeping Unit.'},
                    'image_url': {'type': 'string', 'description': 'URL for the product image.'},
                    'description': {'type': 'string', 'description': 'Detailed description of the product.'},
                    'quantity': {'type': 'integer', 'description': 'Available quantity of the product.'},
                    'price': {'type': 'number', 'description': 'Price of the product.'}
                }
            }
        }
    ],
    'responses': {
        '201': {'description': 'Product added successfully!'},
        '400': {'description': 'Invalid or missing product data.'},
        '401': {'description': 'Authorization token is missing or invalid.'},
        '409': {'description': 'Product with this SKU already exists.'}
    }
})
def add_product(current_user):
    db = current_app.db
    data = request.get_json()

    # --- FIX: Expanded validation ---
    required_fields = ['name', 'type', 'sku', 'quantity', 'price']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'Missing product data!'}), 400

    # Validate data values
    if not data['name'] or not data['sku']:
        return jsonify({'message': 'Name and SKU cannot be empty.'}), 400
    
    if not isinstance(data.get('quantity'), int) or data['quantity'] < 0:
        return jsonify({'message': 'Quantity must be a non-negative integer.'}), 400

    if not isinstance(data.get('price'), (int, float)) or data['price'] < 0:
        return jsonify({'message': 'Price must be a non-negative number.'}), 400

    # Check for duplicate SKU
    if db.products.find_one({"sku": data['sku']}):
        return jsonify({'message': f"Product with SKU '{data['sku']}' already exists."}), 409 # 409 Conflict

    # --- End of FIX ---

    result = db.products.insert_one({
        "name": data["name"],
        "type": data["type"],
        "sku": data["sku"],
        "image_url": data.get("image_url", ""),
        "description": data.get("description", ""),
        "quantity": data["quantity"],
        "price": data["price"],
        "added_by": current_user['public_id']
    })

    return jsonify({'message': 'Product added successfully!', 'product_id': str(result.inserted_id)}), 201


@product_bp.route('', methods=['GET'])
@token_required
@swag_from({
    'tags': ['Products'],
    'summary': 'Get a paginated list of all products',
    'security': [{'bearerAuth': []}],
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'default': 1,
            'description': 'The page number for pagination.'
        },
        {
            'name': 'per_page',
            'in': 'query',
            'type': 'integer',
            'default': 10,
            'description': 'The number of products to return per page.'
        }
    ],
    'responses': {
        '200': {
            'description': 'A paginated list of products.',
            'schema': {
                'type': 'array',
                'items': {
                    'properties': {
                        'id': {'type': 'string'},
                        'name': {'type': 'string'},
                        'type': {'type': 'string'},
                        'sku': {'type': 'string'},
                        'image_url': {'type': 'string'},
                        'description': {'type': 'string'},
                        'quantity': {'type': 'integer'},
                        'price': {'type': 'number'}
                    }
                }
            }
        },
        '400': {'description': 'Invalid pagination parameters.'},
        '401': {'description': 'Authorization token is missing or invalid.'}
    }
})
def get_products(current_user):
    db = current_app.db
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'message': 'Invalid page or per_page parameter.'}), 400

    # --- FIX: Add check for non-positive page/per_page values ---
    if page <= 0 or per_page <= 0:
        return jsonify({'message': 'Page and per_page parameters must be positive integers.'}), 400
    # --- End of FIX ---

    skip = (page - 1) * per_page
    products_cursor = db.products.find({}).skip(skip).limit(per_page)
    
    output = [
        {
            'id': str(p['_id']), 'name': p['name'], 'type': p['type'], 'sku': p['sku'],
            'image_url': p.get('image_url'), 'description': p.get('description'),
            'quantity': p['quantity'], 'price': p['price']
        } for p in products_cursor
    ]
    return jsonify(output)


@product_bp.route('/<id>/quantity', methods=['PUT'])
@token_required
@swag_from({
    'tags': ['Products'],
    'summary': 'Update the quantity of a specific product',
    'security': [{'bearerAuth': []}],
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The MongoDB ObjectId of the product to update.'
        },
        {
            'in': 'body',
            'name': 'body',
            'required': True,
            'schema': {
                'id': 'ProductQuantity',
                'required': ['quantity'],
                'properties': {
                    'quantity': {
                        'type': 'integer',
                        'description': 'The new quantity for the product.'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {'description': 'Product quantity updated successfully.'},
        '400': {'description': 'Invalid product ID or quantity provided.'},
        '401': {'description': 'Authorization token is missing or invalid.'},
        '404': {'description': 'Product not found.'}
    }
})
def update_product_quantity(current_user, id):
    db = current_app.db
    try:
        product_id = ObjectId(id)
    except Exception:
        return jsonify({'message': 'Invalid product ID format!'}), 400

    data = request.get_json()

    # --- FIX: Expanded validation for quantity ---
    if 'quantity' not in data or not isinstance(data['quantity'], int):
        return jsonify({'message': 'Quantity is required and must be an integer!'}), 400

    if data['quantity'] < 0:
        return jsonify({'message': 'Quantity cannot be negative.'}), 400
    # --- End of FIX ---

    result = db.products.update_one(
        {'_id': product_id},
        {'$set': {'quantity': data['quantity']}}
    )

    if result.matched_count == 0:
        return jsonify({'message': 'Product not found!'}), 404

    updated_product = db.products.find_one({'_id': product_id})
    return jsonify({
        'id': str(updated_product['_id']),
        'name': updated_product['name'],
        'quantity': updated_product['quantity'],
        'message': 'Quantity updated successfully'
    }), 200