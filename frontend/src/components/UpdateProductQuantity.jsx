"use client"

import { useState, useEffect } from "react"
import { productAPI } from "../services/api"
import toast from "react-hot-toast"

const UpdateProductQuantity = ({ onQuantityUpdated }) => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingProducts, setFetchingProducts] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setFetchingProducts(true)
    try {
      const data = await productAPI.getProducts(1, 100) // Get more products for selection
      setProducts(data)
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setFetchingProducts(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }

    if (!newQuantity || isNaN(newQuantity) || Number.parseInt(newQuantity) < 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    setLoading(true)
    try {
      await productAPI.updateQuantity(selectedProduct, Number.parseInt(newQuantity))
      toast.success("Quantity updated successfully!")

      // Reset form
      setSelectedProduct("")
      setNewQuantity("")

      // Refresh products list
      await fetchProducts()

      // Trigger refresh in parent component
      if (onQuantityUpdated) {
        onQuantityUpdated()
      }
    } catch (error) {
      toast.error(error.message || "Failed to update quantity")
    } finally {
      setLoading(false)
    }
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Product Quantity</h2>

      {fetchingProducts ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku} (Current: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          {selectedProductData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{selectedProductData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900">{selectedProductData.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-900">{selectedProductData.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Quantity:</span>
                  <span
                    className={`ml-2 font-medium ${
                      selectedProductData.quantity > 10
                        ? "text-green-600"
                        : selectedProductData.quantity > 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedProductData.quantity}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="ml-2 text-gray-900">${selectedProductData.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              New Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              min="0"
              className="input-field"
              placeholder="Enter new quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setSelectedProduct("")
                setNewQuantity("")
              }}
              className="btn-secondary"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProduct}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Quantity"
              )}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 && !fetchingProducts && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Add some products first to update their quantities.</p>
        </div>
      )}
    </div>
  )
}

export default UpdateProductQuantity
