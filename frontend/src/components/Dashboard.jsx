"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import ProductList from "./ProductList"
import ProductForm from "./ProductForm"
import UpdateProductQuantity from "./UpdateProductQuantity"

const Dashboard = () => {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState("products")
  const [refreshProducts, setRefreshProducts] = useState(0)

  const handleLogout = () => {
    logout()
  }

  const triggerRefresh = () => {
    setRefreshProducts((prev) => prev + 1)
  }

  const tabs = [
    { id: "products", label: "Products", icon: "📦" },
    { id: "add-product", label: "Add Product", icon: "➕" },
    { id: "update-quantity", label: "Update Quantity", icon: "📝" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Inventory Management System</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === "products" && <ProductList key={refreshProducts} />}
          {activeTab === "add-product" && <ProductForm onProductAdded={triggerRefresh} />}
          {activeTab === "update-quantity" && <UpdateProductQuantity onQuantityUpdated={triggerRefresh} />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
