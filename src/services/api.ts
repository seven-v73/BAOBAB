import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, isAccessTokenExpiring, refreshSession, sessionApi } from './session'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Les routes de session gèrent elles-mêmes leurs erreurs (un mauvais mot de passe n'est pas une session expirée)
const isAuthRoute = (url?: string) => Boolean(url && /\/auth\/(login|register|refresh|logout|2fa\/verify-login)/.test(url))

// Ajoute le jeton d'accès, en le renouvelant juste avant s'il est sur le point d'expirer
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!isAuthRoute(config.url) && getAccessToken() && isAccessTokenExpiring()) {
    await refreshSession().catch(() => undefined)
  }
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Ne pas écraser Content-Type pour multipart/form-data (uploads de fichiers)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Sur 401 : un seul renouvellement puis nouvel essai ; si la session est terminée,
// le store d'authentification est prévenu (redirection douce par les routes protégées, sans rechargement)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (error.code === 'ERR_CANCELED' || !original) return Promise.reject(error)

    if (error.response?.status === 401 && !original._retry && !isAuthRoute(original.url)) {
      original._retry = true
      try {
        const session = await refreshSession()
        if (session) {
          original.headers.Authorization = `Bearer ${session.token}`
          return api(original)
        }
      } catch {
        // Réseau indisponible : on renvoie l'erreur d'origine
      }
    }
    return Promise.reject(error)
  },
)

export default api

// Services spécifiques
export const authService = {
  login: (email: string, password: string) => sessionApi.post('/auth/login', { email, password }),
  verify2FA: (challengeToken: string, code: { token?: string; backupCode?: string }) =>
    sessionApi.post('/auth/2fa/verify-login', { challengeToken, ...code }),
  register: (email: string, password: string, name: string) => sessionApi.post('/auth/register', { email, password, name }),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
  logoutAll: () => api.post('/auth/logout-all'),
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
  getAll: (params?: { category?: string; kind?: string; status?: string; published?: boolean; search?: string }) =>
    api.get('/blog', { params }),
  /** Textes de l'utilisateur connecté, quel que soit leur statut */
  getMine: () => api.get('/blog', { params: { mine: true } }),
  /** Modération (admin) : publier ou renvoyer à l'auteur avec une note */
  review: (id: string, decision: 'approve' | 'reject', note?: string) => api.patch(`/blog/${id}/review`, { decision, note }),
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
// Base de connaissances (fiches sourcées par pays, voir server/data/afrique/SCHEMA.md)
export const ficheService = {
  getAll: (params?: Record<string, string | number | undefined>) => api.get('/fiches', { params }),
  getById: (ficheId: string) => api.get(`/fiches/${ficheId}`),
  getAdmin: (params?: Record<string, string | number | undefined>) => api.get('/fiches/admin', { params }),
  getStats: () => api.get('/fiches/admin/stats'),
  setStatut: (ficheId: string, statut: string, note?: string) => api.patch(`/fiches/${ficheId}/statut`, { statut, note }),
}

export const sourceService = {
  getAll: (params?: any) => api.get('/sources', { params }),
  getById: (id: string) => api.get(`/sources/${id}`),
  create: (data: any) => api.post('/sources', data),
  update: (id: string, data: any) => api.put(`/sources/${id}`, data),
  delete: (id: string) => api.delete(`/sources/${id}`),
  cite: (id: string) => api.post(`/sources/${id}/cite`),
}

export const contributionService = {
  getAll: (params?: any) => api.get('/contributions', { params }),
  create: (data: any) => api.post('/contributions', data),
  updateStatus: (id: string, data: { status: string; reviewNote?: string }) =>
    api.put(`/contributions/${id}/status`, data),
  delete: (id: string) => api.delete(`/contributions/${id}`),
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
