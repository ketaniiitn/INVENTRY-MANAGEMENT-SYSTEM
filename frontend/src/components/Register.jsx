"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      await authAPI.register({
        username: formData.username,
        password: formData.password,
      })
      toast.success("Registration successful! Please login.")
      navigate("/login")
    } catch (error) {
      toast.error(error.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  // Optional: if Logout is needed later
  const handleLogout = () => {
    // dummy placeholder
    toast("Logout clicked (not implemented here)")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* ✅ Glowing header inside background */}
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

      {/* Background blur decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Register Form */}
      <div className="max-w-md w-full space-y-8 relative z-10 pt-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-lg">Join our inventory management platform</p>
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
                  placeholder="Choose a username"
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="gradient-text font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
