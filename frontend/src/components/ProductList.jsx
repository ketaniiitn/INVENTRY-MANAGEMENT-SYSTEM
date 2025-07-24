"use client"

import { useState, useEffect } from "react"
import { productAPI } from "../services/api"
import toast from "react-hot-toast"

// --- Edit Icon SVG ---
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-square-pen"
  >
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
)

// --- Product Detail Modal Component ---
const ProductDetailModal = ({ product, onClose, onQuantityUpdated }) => {
  if (!product) return null

  const [isEditing, setIsEditing] = useState(false)
  const [newQuantity, setNewQuantity] = useState(product.quantity)
  const [loading, setLoading] = useState(false)

  const handleUpdateStock = async () => {
    if (newQuantity === "" || isNaN(newQuantity) || Number(newQuantity) < 0) {
      toast.error("Please enter a valid quantity.")
      return
    }

    setLoading(true)
    try {
      await productAPI.updateQuantity(product.id, Number(newQuantity))
      toast.success("Stock updated successfully!")
      onQuantityUpdated() // This will refresh the list in the parent
      setIsEditing(false)
      onClose() // Close the modal on successful update
    } catch (error) {
      toast.error(error.message || "Failed to update stock.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121624] rounded-2xl shadow-lg border border-gray-800 w-full max-w-2xl text-white transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="flex justify-center items-center">
            <img
              src={product.image_url || 'https://placehold.co/600x400/121624/FFFFFF?text=No+Image'}
              alt={product.name}
              className="w-full h-auto max-h-80 object-contain rounded-xl border border-gray-700"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/121624/FFFFFF?text=No+Image'; }}
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Description</h3>
              <p className="text-gray-300">{product.description || "No description available."}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Category</h3>
              <p className="text-gray-300">{product.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">SKU</h3>
              <p className="font-mono text-teal-400">{product.sku}</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Price</h3>
                <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Stock</h3>
                <p className={`text-2xl font-bold ${
                  product.quantity > 10 ? "text-green-400" : product.quantity > 0 ? "text-yellow-400" : "text-red-400"
                }`}>{product.quantity} units</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 bg-gray-900/30 border-t border-gray-800 rounded-b-2xl flex flex-col sm:flex-row justify-end items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full sm:w-28 bg-white text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="New Qty"
                autoFocus
              />
              <button
                onClick={handleUpdateStock}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 transition text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 text-teal-400 py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <EditIcon />
              Update Stock
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 transition text-white py-2 px-6 rounded-lg font-medium w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


// --- Main Product List Component ---
const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)

  // State for the modal
  const [selectedProduct, setSelectedProduct] = useState(null)

const fetchProducts = async () => {
  setLoading(true) // Always set loading to true when fetching starts
  try {
    const data = await productAPI.getProducts(currentPage, perPage)
    setProducts(data)
  } catch (error) {
    toast.error(error.message || "Failed to fetch products")
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const handleOpenModal = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleQuantityUpdated = () => {
    fetchProducts() // Re-fetch products to show updated data
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Product Inventory</h2>
          <p className="text-gray-400">Manage and track your product stock</p>
        </div>
        <button onClick={fetchProducts} className="btn-secondary flex items-center space-x-2">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-teal-400 text-8xl mb-6 animate-float">📦</div>
          <h3 className="text-2xl font-bold text-white mb-4">No products found</h3>
          <p className="text-gray-400 text-lg mb-8">Start building your inventory by adding your first product.</p>
          <div className="inline-flex px-6 py-3 bg-teal-400/10 border border-teal-400/20 rounded-xl text-teal-400">
            💡 Tip: Use the "Add Product" tab to get started
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((product) => (
                  <tr key={product.id} onClick={() => handleOpenModal(product)} className="hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img
                            className="h-12 w-12 rounded-xl object-cover mr-4 border border-gray-700"
                            src={product.image_url}
                            alt={product.name}
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/121624/FFFFFF?text=Img'; }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mr-4 border border-gray-600">
                            <span className="text-gray-400 text-lg">📦</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-white">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-400 truncate max-w-xs">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-lg border border-gray-700">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                          product.quantity > 10
                            ? "bg-green-400/20 text-green-400 border border-green-400/30"
                            : product.quantity > 0
                              ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                              : "bg-red-400/20 text-red-400 border border-red-400/30"
                        }`}
                      >
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">${product.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenModal(product)}
                className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700 hover:border-teal-400/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  {product.image_url ? (
                    <img
                      className="h-16 w-16 rounded-xl object-cover border border-gray-600"
                      src={product.image_url}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100/121624/FFFFFF?text=Img'; }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                      <span className="text-gray-400 text-xl">📦</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{product.type}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
                        <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                            product.quantity > 10
                              ? "bg-green-400/20 text-green-400 border border-green-400/30"
                              : product.quantity > 0
                                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                                : "bg-red-400/20 text-red-400 border border-red-400/30"
                          }`}
                        >
                          Stock: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Page</span>
              <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-lg font-semibold">{currentPage}</span>
            </div>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={products.length < perPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Render the Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onQuantityUpdated={handleQuantityUpdated}
        />
      )}
    </div>
  )
}

export default ProductList