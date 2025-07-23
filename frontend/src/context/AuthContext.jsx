"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = (token) => {
    localStorage.setItem("token", token)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  const isAuthenticated = () => {
    return !!token
  }

  const value = {
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
