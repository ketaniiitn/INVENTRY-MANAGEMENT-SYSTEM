"use client"

import { useState } from "react"
import { productAPI } from "../services/api"
import toast from "react-hot-toast"

const ProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    sku: "",
    quantity: "",
    price: "",
    image_url: "",
    description: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.type || !formData.sku || !formData.quantity || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    if (isNaN(formData.quantity) || Number.parseInt(formData.quantity) < 0) {
      toast.error("Quantity must be a valid number")
      return
    }

    if (isNaN(formData.price) || Number.parseFloat(formData.price) < 0) {
      toast.error("Price must be a valid number")
      return
    }

    setLoading(true)
    try {
      const productData = {
        ...formData,
        quantity: Number.parseInt(formData.quantity),
        price: Number.parseFloat(formData.price),
      }

      await productAPI.addProduct(productData)
      toast.success("Product added successfully!")

      setFormData({
        name: "",
        type: "",
        sku: "",
        quantity: "",
        price: "",
        image_url: "",
        description: "",
      })

      if (onProductAdded) {
        onProductAdded()
      }
    } catch (error) {
      toast.error(error.message || "Failed to add product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-[#0e101c] min-h-screen text-white">
      <div className="max-w-6xl mx-auto bg-[#121624] rounded-2xl shadow-lg border border-gray-800 p-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Add New Product</h2>
          <p className="text-gray-400">Expand your inventory with new products</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-white text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-300 mb-1">
                Product Category *
              </label>
              <input
                type="text"
                id="type"
                name="type"
                required
                className="w-full bg-white text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electronics, Clothing, Books"
                value={formData.type}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-semibold text-gray-300 mb-1">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                required
                className="w-full bg-white text-black rounded-md px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PHN-001, LAP-256"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-semibold text-gray-300 mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                className="w-full bg-white text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/product-image.jpg"
                value={formData.image_url}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-1">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="0"
                className="w-full bg-white text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                className="w-full bg-white text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-1">
                Product Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                className="w-full bg-white text-black rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your product features, specifications, or any important details..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700 mt-8">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  name: "",
                  type: "",
                  sku: "",
                  quantity: "",
                  price: "",
                  image_url: "",
                  description: "",
                })
              }
              className="bg-gray-600 hover:bg-gray-700 transition text-white py-2 px-6 rounded-lg font-medium"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-6 rounded-lg shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Adding Product...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">➕</span>
                  Add Product to Inventory
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
