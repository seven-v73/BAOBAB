import { create } from 'zustand'

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  date: string
  image: string
  category: string
  tags: string[]
}

interface BlogState {
  posts: BlogPost[]
  selectedPost: BlogPost | null
  setSelectedPost: (post: BlogPost | null) => void
  getPostsByCategory: (category: string) => BlogPost[]
  searchPosts: (query: string) => BlogPost[]
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),
  getPostsByCategory: (category) => {
    return get().posts.filter((post) => post.category === category)
  },
  searchPosts: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  },
}))

