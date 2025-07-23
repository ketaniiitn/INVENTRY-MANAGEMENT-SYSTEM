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
    { id: "products", label: "Products", icon: "📦", description: "View all products" },
    { id: "add-product", label: "Add Product", icon: "➕", description: "Add new product" },
    { id: "update-quantity", label: "Update Quantity", icon: "📝", description: "Update stock" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="relative bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400 after:shadow-[0_0_10px_#22d3ee]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center glow-teal">
                <span className="text-lg font-bold text-gray-900">📦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Inventory Pro</h1>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 bg-gray-900/30 p-2 rounded-2xl backdrop-blur-sm border border-gray-800 text-white shadow-[0_0_10px_#38bdf8]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id ? "tab-active" : "tab-inactive"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-70 hidden sm:block">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card-glow">
          {activeTab === "products" && <ProductList key={refreshProducts} />}
          {activeTab === "add-product" && <ProductForm onProductAdded={triggerRefresh} />}
          {activeTab === "update-quantity" && <UpdateProductQuantity onQuantityUpdated={triggerRefresh} />}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  )
}

export default Dashboard
