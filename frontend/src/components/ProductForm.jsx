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

      // Reset form
      setFormData({
        name: "",
        type: "",
        sku: "",
        quantity: "",
        price: "",
        image_url: "",
        description: "",
      })

      // Trigger refresh in parent component
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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="input-field"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Product Type *
            </label>
            <input
              type="text"
              id="type"
              name="type"
              required
              className="input-field"
              placeholder="e.g., Electronics, Clothing"
              value={formData.type}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              required
              className="input-field"
              placeholder="e.g., PHN-001"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="0"
              className="input-field"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              className="input-field"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              className="input-field"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="input-field resize-none"
            placeholder="Enter product description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
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
            className="btn-secondary"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
