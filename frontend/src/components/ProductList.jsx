"use client"

import { useState, useEffect } from "react"
import { productAPI } from "../services/api"
import toast from "react-hot-toast"

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await productAPI.getProducts(currentPage, perPage)
      setProducts(data)
    } catch (error) {
      toast.error(error.message || "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <button onClick={fetchProducts} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Add your first product to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                            <span className="text-gray-400 text-xs">📦</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.quantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {product.image_url ? (
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">📦</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.type}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                      <span className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.quantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        Qty: {product.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={products.length < perPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductList
