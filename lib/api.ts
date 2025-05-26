// API utility functions for making requests to your backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // FC (Fulfillment Center) API methods
  async getPendingOrdersForBranch(branchId: string) {
    return this.request(`/orders/branch/${branchId}/pending`)
  }

  async getOrderByIdFC(orderId: string) {
    return this.request(`/orders/branch/${orderId}`)
  }

  async updateOrderStatusByFC(orderId: string, status: string) {
    return this.request(`/orders/branch/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  // Delivery API methods
  async getAvailableOrdersForDelivery() {
    return this.request("/orders/delivery/available")
  }

  async confirmOrder(orderId: string, userId: string) {
    return this.request(`/orders/delivery/${orderId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async updateOrderStatusByDeliveryPartner(orderId: string, status: string, userId: string) {
    return this.request(`/orders/delivery/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, userId }),
    })
  }
}

export const apiClient = new ApiClient()
