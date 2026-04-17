import { Prisma } from '@prisma/client'

// Product with all relations
export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true
    variants: true
    images: true
    reviews: {
      include: {
        user: {
          select: {
            firstName: true
            lastName: true
          }
        }
      }
    }
  }
}>

// Product for listing pages
export type ProductListItem = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        name: true
        slug: true
      }
    }
    images: {
      take: 1
      orderBy: {
        sortOrder: 'asc'
      }
    }
    variants: {
      select: {
        id: true
        size: true
        color: true
        colorHex: true
        stock: true
      }
    }
  }
}>

// Cart with items
export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: {
              take: 1
            }
          }
        }
        variant: true
      }
    }
  }
}>

// Order with items
export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: {
              take: 1
            }
          }
        }
      }
    }
    address: true
    user: {
      select: {
        email: true
        firstName: true
        lastName: true
      }
    }
  }
}>

// Category with children
export type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: {
    children: true
    _count: {
      select: {
        products: true
      }
    }
  }
}>

// User profile
export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true
    email: true
    firstName: true
    lastName: true
    phone: true
    role: true
    createdAt: true
    addresses: true
  }
}>

// Cart item for display
export interface CartItemDisplay {
  id: string
  productId: string
  variantId: string
  name: string
  image: string
  size: string
  color: string
  price: number
  quantity: number
  stock: number
}

// Filter options for product listing
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular'
  page?: number
  limit?: number
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Session user type
export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

// Dashboard stats
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  recentOrders: OrderWithDetails[]
  ordersByStatus: { status: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}
