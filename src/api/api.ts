import axios from 'axios'
import type { Product } from '../store/productStore'
import type { BlogPost } from '../store/blogStore'
import { mockProducts } from './mock/products'
import { mockBlogPosts } from './mock/blogPosts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.state?.user) {
        config.headers.Authorization = `Bearer ${authData.state.user.id}`
      }
    } catch (e) {
      // Ignore
    }
  }
  return config
})

// API Products
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    // Simulation - remplacer par un vrai appel API
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 500)
    })
  },
  getById: async (id: string): Promise<Product | null> => {
    const product = mockProducts.find((p) => p.id === id)
    return product || null
  },
  getByCategory: async (category: string): Promise<Product[]> => {
    return mockProducts.filter((p) => p.category === category)
  },
}

// API Blog
export const blogApi = {
  getAll: async (): Promise<BlogPost[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBlogPosts), 500)
    })
  },
  getById: async (id: string): Promise<BlogPost | null> => {
    const post = mockBlogPosts.find((p) => p.id === id)
    return post || null
  },
  getByCategory: async (category: string): Promise<BlogPost[]> => {
    return mockBlogPosts.filter((p) => p.category === category)
  },
}

// API Auth
export const authApi = {
  login: async (email: string, password: string) => {
    // Simulation - remplacer par un vrai appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password) {
          resolve({
            user: {
              id: '1',
              name: 'Utilisateur',
              email,
              role: 'user',
            },
            token: 'mock-token',
          })
        } else {
          resolve(null)
        }
      }, 500)
    })
  },
  register: async (name: string, email: string, password: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (name && email && password) {
          resolve({
            user: {
              id: Date.now().toString(),
              name,
              email,
              role: 'user',
            },
            token: 'mock-token',
          })
        } else {
          resolve(null)
        }
      }, 500)
    })
  },
}

export default api

