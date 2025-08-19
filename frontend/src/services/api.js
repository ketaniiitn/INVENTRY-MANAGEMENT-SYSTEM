import axios from "axios"

const API_BASE_URL = "https://inventry-management-system-cijl.onrender.com/"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post("/register", userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" }
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/login", credentials)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Login failed" }
    }
  },
}

// Product API calls
export const productAPI = {
  getProducts: async (page = 1, perPage = 10) => {
    try {
      const response = await api.get(`/products?page=${page}&per_page=${perPage}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch products" }
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post("/products", productData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to add product" }
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const response = await api.put(`/products/${productId}/quantity`, { quantity })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to update quantity" }
    }
  },
}

export default api
