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
      const data = await productAPI.getProducts(1, 100)
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
      setSelectedProduct("")
      setNewQuantity("")
      await fetchProducts()

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
    <div className="p-8 bg-[#0e101c] min-h-screen text-white">
      <div className="max-w-6xl mx-auto bg-[#121624] rounded-2xl shadow-lg border border-gray-800 p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Update Stock Quantity</h2>
          <p className="text-gray-400">Adjust inventory levels for existing products</p>
        </div>

        {fetchingProducts ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="product" className="block text-sm font-semibold text-gray-300 mb-2">
                    Select Product *
                  </label>
                  <select
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="bg-white text-black rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a product to update...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.sku} (Current: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-2">
                    New Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="0"
                    className="bg-white text-black text-xl rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    placeholder="Enter new quantity"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                {selectedProductData ? (
                  <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <span className="mr-2">📋</span> Product Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {selectedProductData.image_url ? (
                          <img
                            className="h-20 w-20 rounded-xl object-cover border border-gray-600"
                            src={selectedProductData.image_url}
                            alt={selectedProductData.name}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                            <span className="text-gray-400 text-xl">📦</span>
                          </div>
                        )}

                        <div>
                          <h4 className="text-lg font-semibold">{selectedProductData.name}</h4>
                          <p className="text-gray-400 text-sm">{selectedProductData.type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-900/50 rounded-lg p-3">
                          <span className="text-gray-400 block">SKU</span>
                          <span className="text-white font-mono font-semibold">{selectedProductData.sku}</span>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3">
                          <span className="text-gray-400 block">Price</span>
                          <span className="text-white font-semibold">${selectedProductData.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <span className="text-gray-400 block mb-2">Current Stock</span>
                        <span
                          className={`inline-flex px-4 py-2 text-lg font-bold rounded-lg ${
                            selectedProductData.quantity > 10
                              ? "bg-green-400/20 text-green-400 border border-green-400/30"
                              : selectedProductData.quantity > 0
                              ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                              : "bg-red-400/20 text-red-400 border border-red-400/30"
                          }`}
                        >
                          {selectedProductData.quantity} units
                        </span>
                      </div>

                      {selectedProductData.description && (
                        <div className="bg-gray-900/50 rounded-lg p-3">
                          <span className="text-gray-400 block mb-1">Description</span>
                          <p className="text-white text-sm">{selectedProductData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/20 rounded-2xl p-8 border border-gray-700 border-dashed text-center">
                    <div className="text-gray-500 text-6xl mb-4">📦</div>
                    <p className="text-gray-400">Select a product to view details</p>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct("")
                  setNewQuantity("")
                }}
                className="bg-gray-600 hover:bg-gray-700 transition text-white py-2 px-6 rounded-lg font-medium"
              >
                Clear Selection
              </button>

              <button
                type="submit"
                disabled={loading || !selectedProduct}
                className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-6 rounded-lg shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Updating Stock...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📝</span>
                    Update Stock Quantity
                  </div>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default UpdateProductQuantity
