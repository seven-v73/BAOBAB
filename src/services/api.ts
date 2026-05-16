import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Instance axios séparée pour le refresh token (sans intercepteurs)
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Variable pour éviter les boucles de refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // Ne pas écraser Content-Type pour multipart/form-data (uploads de fichiers)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

// Intercepteur pour gérer les erreurs et refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ignorer les erreurs si la requête a été annulée
    if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
      return Promise.reject(error)
    }

    const originalRequest = error.config

    // Si pas de config, c'est probablement une erreur de réseau ou d'extension
    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Si erreur 401 et pas déjà en cours de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (!originalRequest) {
              return Promise.reject(new Error('Request cancelled'))
            }
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Récupérer le refresh token
        const authStorage = localStorage.getItem('auth-storage')
        if (!authStorage) {
          throw new Error('No auth storage')
        }

        const parsed = JSON.parse(authStorage)
        const refreshToken = parsed.state?.refreshToken

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Appeler l'API de refresh avec l'instance séparée (sans intercepteurs)
        const response = await refreshApi.post('/auth/refresh', {
          refreshToken
        })

        const { token: newToken, refreshToken: newRefreshToken } = response.data

        // Mettre à jour le storage
        const updatedAuth = {
          ...parsed,
          state: {
            ...parsed.state,
            token: newToken,
            refreshToken: newRefreshToken
          }
        }
        localStorage.setItem('auth-storage', JSON.stringify(updatedAuth))

        // Mettre à jour le header de la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Traiter la queue
        processQueue(null, newToken)

        isRefreshing = false

        // Réessayer la requête originale
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh échoué, déconnecter
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.removeItem('auth-storage')
        
        // Rediriger vers login seulement si on n'est pas déjà sur la page de login
        if (window.location.pathname !== '/login') {
          const redirect = `${window.location.pathname}${window.location.search}`
          window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
        }
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Services spécifiques
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
}

export const communityService = {
  // Posts
  getAllPosts: (params?: { communityId?: string; category?: string; page?: number; limit?: number }) =>
    api.get('/communities/posts/all', { params }),
  getPostById: (id: string) =>
    api.get(`/communities/posts/${id}`),
  createPost: (data: { content: string; image?: string; video?: string; pdf?: string; tags?: string[]; category?: string; communityId?: string }) =>
    api.post('/communities/posts', data),
  updatePost: (id: string, data: { content?: string; image?: string; tags?: string[]; category?: string }) =>
    api.put(`/communities/posts/${id}`, data),
  deletePost: (id: string) =>
    api.delete(`/communities/posts/${id}`),
  likePost: (id: string) =>
    api.put(`/communities/posts/${id}/like`),
  getPostComments: (postId: string) =>
    api.get(`/communities/posts/${postId}/comments`),
  createComment: (postId: string, data: { content: string; parentId?: string }) =>
    api.post(`/communities/posts/${postId}/comments`, data),
  likeComment: (commentId: string) =>
    api.put(`/communities/comments/${commentId}/like`),
  
  // Communities
  getAllCommunities: (params?: { type?: string; culture?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/communities', { params }),
  getMyCommunities: () =>
    api.get('/communities/my/communities'),
  getCommunityById: (id: string) =>
    api.get(`/communities/${id}`),
  createCommunity: (data: { name: string; description: string; type: string; culture?: string; image?: string; coverImage?: string; tags?: string[]; settings?: any }) =>
    api.post('/communities', data),
  createCommunityRequest: (data: { name: string; description: string; type: string; culture?: string; image?: string; coverImage?: string; tags?: string[]; settings?: any }) =>
    api.post('/communities/requests', data),
  getCommunityRequests: (params?: { status?: 'pending' | 'approved' | 'rejected' | 'all'; page?: number; limit?: number }) =>
    api.get('/communities/requests', { params }),
  approveCommunityRequest: (id: string, adminNote?: string) =>
    api.put(`/communities/requests/${id}/approve`, { adminNote }),
  rejectCommunityRequest: (id: string, adminNote?: string) =>
    api.put(`/communities/requests/${id}/reject`, { adminNote }),
  updateCommunity: (id: string, data: any) =>
    api.put(`/communities/${id}`, data),
  deleteCommunity: (id: string) =>
    api.delete(`/communities/${id}`),
  joinCommunity: (id: string) =>
    api.post(`/communities/${id}/join`),
  leaveCommunity: (id: string) =>
    api.post(`/communities/${id}/leave`),
  getCommunityMembers: (id: string, params?: { role?: string; status?: string; page?: number; limit?: number }) =>
    api.get(`/communities/${id}/members`, { params }),
  updateMemberRole: (communityId: string, userId: string, role: string) =>
    api.put(`/communities/${communityId}/members/${userId}/role`, { role }),
  removeMember: (communityId: string, userId: string) =>
    api.delete(`/communities/${communityId}/members/${userId}`),
  banMember: (communityId: string, userId: string) =>
    api.put(`/communities/${communityId}/members/${userId}/ban`),
  unbanMember: (communityId: string, userId: string) =>
    api.put(`/communities/${communityId}/members/${userId}/unban`),
  
  // Invitations
  createInvitation: (communityId: string, data: { email?: string; userId?: string; message?: string }) =>
    api.post(`/communities/${communityId}/invitations`, data),
  getCommunityInvitations: (communityId: string, status?: string) =>
    api.get(`/communities/${communityId}/invitations`, { params: { status } }),
  getMyInvitations: () =>
    api.get('/communities/invitations/my'),
  acceptInvitation: (invitationId: string) =>
    api.post(`/communities/invitations/${invitationId}/accept`),
  rejectInvitation: (invitationId: string) =>
    api.post(`/communities/invitations/${invitationId}/reject`),
  cancelInvitation: (invitationId: string) =>
    api.delete(`/communities/invitations/${invitationId}`),
}

export const productService = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getSimilar: (id: string, params?: { limit?: number }) => api.get(`/products/similar/${id}`, { params }),
  getTrending: (params?: { limit?: number; period?: '24h' | '7d' | '30d' }) => api.get('/products/trending', { params }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const blogService = {
  getAll: () => api.get('/blog'),
  getById: (id: string) => api.get(`/blog/${id}`),
  create: (data: any) => api.post('/blog', data),
  update: (id: string, data: any) => api.put(`/blog/${id}`, data),
  delete: (id: string) => api.delete(`/blog/${id}`),
}

export const userService = {
  getProfile: () => api.get('/users/profile'),
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),
}

export const orderService = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, trackingNumber?: string) =>
    api.put(`/orders/${id}/status`, { status, trackingNumber }),
  getAll: (params?: any) => api.get('/orders', { params }),
}

export const paymentService = {
  createIntent: (orderId: string, amount: number, currency?: string) =>
    api.post('/payments/create-intent', { orderId, amount, currency }),
  refund: (orderId: string) => api.post(`/payments/refund/${orderId}`),
}

export const couponService = {
  validate: (code: string, subtotal: number) =>
    api.post('/coupons/validate', { code, subtotal }),
}

export const countryService = {
  getAll: (params?: any) => api.get('/countries', { params }),
  getById: (id: string) => api.get(`/countries/${id}`),
  create: (data: any) => api.post('/countries', data),
  update: (id: string, data: any) => api.put(`/countries/${id}`, data),
  delete: (id: string) => api.delete(`/countries/${id}`),
  initialize: (countries: any[]) => api.post('/countries/initialize', { countries }),
}

export const reviewService = {
  create: (data: any) => api.post('/reviews', data),
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  markHelpful: (id: string) => api.put(`/reviews/${id}/helpful`),
}

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    return api.post('/upload/image', formData, {
      headers: {
        // Ne pas définir Content-Type, laisser axios le faire automatiquement pour FormData
      },
    })
  },
  uploadPDF: async (file: File) => {
    const formData = new FormData()
    formData.append('pdf', file)

    return api.post('/upload/pdf', formData, {
      headers: {
        // Ne pas définir Content-Type, laisser axios le faire automatiquement pour FormData
      },
    })
  },
  uploadVideo: async (file: File) => {
    const formData = new FormData()
    formData.append('video', file)

    return api.post('/upload/video', formData, {
      headers: {
        // Ne pas définir Content-Type, laisser axios le faire automatiquement pour FormData
      },
    })
  },
  uploadDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('document', file)

    return api.post('/upload/document', formData, {
      headers: {
        // Ne pas définir Content-Type, laisser axios le faire automatiquement pour FormData
      },
    })
  },
}

export const commentService = {
  create: (data: any) => api.post('/comments', data),
  getBlogComments: (blogId: string) => api.get(`/comments/blog/${blogId}`),
  likeComment: (id: string) => api.put(`/comments/${id}/like`),
}

export const newsletterService = {
  subscribe: (email: string, name?: string) =>
    api.post('/newsletter/subscribe', { email, name }),
  unsubscribe: (email: string) =>
    api.post('/newsletter/unsubscribe', { email }),
  getSubscribers: (params?: any) => api.get('/newsletter/subscribers', { params }),
}

// Timeline Service
export const timelineService = {
  getAll: (params?: any) => api.get('/timeline', { params }),
  getById: (id: string) => api.get(`/timeline/${id}`),
  getPeriods: () => api.get('/timeline/periods'),
  getCategories: () => api.get('/timeline/categories'),
  create: (data: any) => api.post('/timeline', data),
  update: (id: string, data: any) => api.put(`/timeline/${id}`, data),
  delete: (id: string) => api.delete(`/timeline/${id}`),
}

// Source Service
export const sourceService = {
  getAll: (params?: any) => api.get('/sources', { params }),
  getById: (id: string) => api.get(`/sources/${id}`),
  create: (data: any) => api.post('/sources', data),
  update: (id: string, data: any) => api.put(`/sources/${id}`, data),
  delete: (id: string) => api.delete(`/sources/${id}`),
  cite: (id: string) => api.post(`/sources/${id}/cite`),
}

// Historical Figure Service
export const figureService = {
  getAll: (params?: any) => api.get('/figures', { params }),
  getById: (id: string) => api.get(`/figures/${id}`),
  create: (data: any) => api.post('/figures', data),
  update: (id: string, data: any) => api.put(`/figures/${id}`, data),
  delete: (id: string) => api.delete(`/figures/${id}`),
}

// Collection Service
export const collectionService = {
  getAll: (params?: any) => api.get('/collections', { params }),
  getById: (id: string) => api.get(`/collections/${id}`),
  create: (data: any) => api.post('/collections', data),
  update: (id: string, data: any) => api.put(`/collections/${id}`, data),
  delete: (id: string) => api.delete(`/collections/${id}`),
  complete: (id: string) => api.post(`/collections/${id}/complete`),
}

// Story Service
export const storyService = {
  getAll: (params?: any) => api.get('/stories', { params }),
  getById: (id: string) => api.get(`/stories/${id}`),
  create: (data: any) => api.post('/stories', data),
  update: (id: string, data: any) => api.put(`/stories/${id}`, data),
  delete: (id: string) => api.delete(`/stories/${id}`),
  complete: (id: string) => api.post(`/stories/${id}/complete`),
}

// Quiz Service
export const quizService = {
  getAll: (params?: any) => api.get('/quizzes', { params }),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  create: (data: any) => api.post('/quizzes', data),
  update: (id: string, data: any) => api.put(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  submit: (id: string, answers: any[]) => api.post(`/quizzes/${id}/submit`, { answers }),
}

// Proverb Service
export const proverbService = {
  getAll: (params?: any) => api.get('/proverbs', { params }),
  getById: (id: string) => api.get(`/proverbs/${id}`),
  getRandom: (params?: any) => api.get('/proverbs/random', { params }),
  create: (data: any) => api.post('/proverbs', data),
  update: (id: string, data: any) => api.put(`/proverbs/${id}`, data),
  delete: (id: string) => api.delete(`/proverbs/${id}`),
  like: (id: string) => api.post(`/proverbs/${id}/like`),
}

export const bookmarkService = {
  getAll: (params?: any) => api.get('/bookmarks', { params }),
  create: (data: any) => api.post('/bookmarks', data),
  update: (id: string, data: any) => api.put(`/bookmarks/${id}`, data),
  delete: (id: string) => api.delete(`/bookmarks/${id}`),
  deleteByItem: (itemType: string, itemId: string) => api.delete(`/bookmarks/item/${itemType}/${itemId}`),
  check: (itemType: string, itemId: string) => api.get(`/bookmarks/check/${itemType}/${itemId}`),
}

export const progressService = {
  get: () => api.get('/progress'),
  recordActivity: (data: any) => api.post('/progress/activity', data),
  getLeaderboard: (params?: any) => api.get('/progress/leaderboard', { params }),
}

// Home Service - Statistiques et contenu pour la page d'accueil
export const homeService = {
  getStats: () => api.get('/stats/home'),
  getFeatured: (params?: { limit?: number }) => api.get('/content/featured', { params }),
  getTrending: (params?: { limit?: number; period?: '24h' | '7d' | '30d' }) => api.get('/content/trending', { params }),
  getRecent: (params?: { limit?: number }) => api.get('/content/recent', { params }),
}

// Search Service - Recherche globale
export const searchService = {
  search: (params: { q: string; type?: string; limit?: number }) => api.get('/search', { params }),
  getSuggestions: (params: { q: string; limit?: number }) => api.get('/search/suggestions', { params }),
}

// Recommendation Service
export const recommendationService = {
  get: (params?: { type?: string; limit?: number }) => api.get('/recommendations', { params }),
}

// Analytics Service
export const analyticsService = {
  get: (params?: { period?: '7d' | '30d' | '90d' }) => api.get('/analytics', { params }),
  getUser: () => api.get('/analytics/user'),
}

// Notification Service
export const notificationService = {
  getAll: (params?: { unreadOnly?: boolean; limit?: number }) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}
