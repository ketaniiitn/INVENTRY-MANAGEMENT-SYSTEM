from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId

from utils import token_required

product_bp = Blueprint('products', __name__)

@product_bp.route('', methods=['POST'])
@token_required
def add_product(current_user):
    """
    Add a new product
    ---
    tags:
      - Products
    security:
      - BearerAuth: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - name
            - type
            - sku
            - quantity
            - price
          properties:
            name:
              type: string
              description: Name of the product.
            type:
              type: string
              description: Type or category of the product.
            sku:
              type: string
              description: Stock Keeping Unit.
            image_url:
              type: string
              description: URL of the product image.
            description:
              type: string
              description: Description of the product.
            quantity:
              type: integer
              description: Available quantity of the product.
            price:
              type: number
              format: float
              description: Price of the product.
    responses:
      201:
        description: Product added successfully!
        schema:
          type: object
          properties:
            message:
              type: string
            product_id:
              type: string
      400:
        description: Missing product data!
    """
    db = current_app.db
    products_collection = db.products

    data = request.get_json()

    if not all(k in data for k in ['name', 'type', 'sku', 'quantity', 'price']):
        return jsonify({'message': 'Missing product data!'}), 400

    new_product = {
        "name": data["name"],
        "type": data["type"],
        "sku": data["sku"],
        "image_url": data.get("image_url", ""),
        "description": data.get("description", ""),
        "quantity": data["quantity"],
        "price": data["price"],
        "added_by": current_user['public_id']
    }

    result = products_collection.insert_one(new_product)

    return jsonify({'message': 'Product added successfully!', 'product_id': str(result.inserted_id)}), 201


@product_bp.route('', methods=['GET'])
@token_required
def get_products(current_user):
    """
    Get a list of all products
    ---
    tags:
      - Products
    security:
      - BearerAuth: []
    responses:
      200:
        description: A list of products.
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              name:
                type: string
              type:
                type: string
              sku:
                type: string
              image_url:
                type: string
              description:
                type: string
              quantity:
                type: integer
              price:
                type: number
                format: float
      400:
        description: Invalid page or per_page parameter.
    """
    db = current_app.db
    products_collection = db.products

    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'message': 'Invalid page or per_page parameter.'}), 400

    skip = (page - 1) * per_page
    products_cursor = products_collection.find({}).skip(skip).limit(per_page)

    output = []
    for product in products_cursor:
        output.append({
            'id': str(product['_id']),
            'name': product['name'],
            'type': product['type'],
            'sku': product['sku'],
            'image_url': product.get('image_url'),
            'description': product.get('description'),
            'quantity': product['quantity'],
            'price': product['price']
        })

    return jsonify(output)


@product_bp.route('/<id>/quantity', methods=['PUT'])
@token_required
def update_product_quantity(current_user, id):
    """
    Update the quantity of a product
    ---
    tags:
      - Products
    security:
      - BearerAuth: []
    parameters:
      - name: id
        in: path
        type: string
        required: true
        description: ID of the product to update.
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - quantity
          properties:
            quantity:
              type: integer
              description: The new quantity for the product.
    responses:
      200:
        description: Quantity updated successfully.
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            quantity:
              type: integer
            message:
              type: string
      400:
        description: Invalid product ID format or quantity is required and must be an integer!
      404:
        description: Product not found!
    """
    db = current_app.db
    products_collection = db.products

    try:
        product_id = ObjectId(id)
    except Exception:
        return jsonify({'message': 'Invalid product ID format!'}), 400

    data = request.get_json()

    if 'quantity' not in data or not isinstance(data['quantity'], int):
        return jsonify({'message': 'Quantity is required and must be an integer!'}), 400

    result = products_collection.update_one(
        {'_id': product_id},
        {'$set': {'quantity': data['quantity']}}
    )

    if result.matched_count == 0:
        return jsonify({'message': 'Product not found!'}), 404

    updated_product = products_collection.find_one({'_id': product_id})

    return jsonify({
        'id': str(updated_product['_id']),
        'name': updated_product['name'],
        'quantity': updated_product['quantity'],
        'message': 'Quantity updated successfully'
    }), 200
