import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  origin: string
  stock: number
}

interface ProductState {
  products: Product[]
  cart: Array<{ product: Product; quantity: number }>
  setProducts: (products: Product[]) => void
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getCartItemCount: () => number
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      setProducts: (products) => set({ products }),
  addToCart: (product, quantity = 1) => {
    const cart = get().cart
    const existingItem = cart.find((item) => item.product.id === product.id)
    
    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      })
    } else {
      set({ cart: [...cart, { product, quantity }] })
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) })
  },
  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
    } else {
      set({
        cart: get().cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      })
    }
  },
  clearCart: () => set({ cart: [] }),
  getTotalPrice: () => {
    return get().cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  },
      getCartItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }), // Ne persister que le panier
    }
  )
)

