"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.login(formData)
      login(response.access_token)
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* ✅ Glowing Header INSIDE background and at top */}
      <header className="absolute top-0 left-0 w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 text-white z-50 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400 after:shadow-[0_0_10px_#22d3ee]">
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
          </div>
        </div>
      </header>

      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Form */}
      <div className="max-w-md w-full space-y-8 relative z-10 pt-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 text-lg">Sign in to your inventory dashboard</p>
        </div>

        <div className="card-glow">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="gradient-text font-semibold hover:underline">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
