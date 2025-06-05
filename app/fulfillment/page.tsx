"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/fulfillment/header"
import StatsCards from "@/components/fulfillment/stats-cards"
import OrderCard from "@/components/fulfillment/order-card"
import OrderTabs from "@/components/fulfillment/order-tabs"

interface Order {
  _id: string
  orderId: string
  customer: {
    name: string
    address: {
      houseNo: string
      streetAddress: string
      area: string
      city: string
      state: string
      pinCode: string
    }
  }
  status: string
  createdAt: string
  totalPrice: number
  items: Array<{
    _id: string
    name: string
    count: number
    price: number
    branch: string
    status: string
    unit?: string
  }>
  slot: {
    label: string
    date: string
    startTime: string
    endTime: string
  }
  statusTimestamps: {
    confirmedAt?: string
    packedAt?: string
  }
}

export default function FulfillmentDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"available" | "ready">("available")
  const router = useRouter()

  useEffect(() => {
    const storedBranchId = localStorage.getItem("branchId")
    if (!storedBranchId) {
      router.push("/fulfillment/login")
      return
    }
    setBranchId(storedBranchId)
    fetchOrders(storedBranchId)
  }, [router])

  const fetchOrders = async (branchId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${branchId}/pending`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("branchId")
    router.push("/fulfillment/login")
  }

  // Sort orders by slot time
  const sortOrdersBySlot = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      // First compare by date
      const dateA = new Date(a.slot.date).getTime()
      const dateB = new Date(b.slot.date).getTime()
      if (dateA !== dateB) return dateA - dateB

      // Then compare by start time
      const timeA = a.slot.startTime
      const timeB = b.slot.startTime
      return timeA.localeCompare(timeB)
    })
  }

  const getStats = () => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => order.status === "pending" || order.status === "packing").length
    const packedOrders = orders.filter((order) => order.status === "packed").length
    const readyOrders = orders.filter((order) => order.status === "ready").length

    return {
      totalOrders,
      pendingOrders,
      packedOrders,
      readyOrders,
    }
  }

  const stats = getStats()

  const availableOrders = orders.filter((order) => order.status !== "ready")
  const readyOrders = orders.filter((order) => order.status === "ready")

  const sortedAvailableOrders = sortOrdersBySlot(availableOrders)
  const sortedReadyOrders = sortOrdersBySlot(readyOrders)

  const displayOrders = selectedTab === "available" ? sortedAvailableOrders : sortedReadyOrders

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header branchId={branchId} onRefresh={() => fetchOrders(branchId)} onLogout={handleLogout} />

      <div className="p-3 sm:p-4">
        <StatsCards stats={stats} />

        <OrderTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          counts={{
            available: availableOrders.length,
            ready: readyOrders.length,
          }}
        />

        <div className="mt-4 sm:mt-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedTab === "available" ? "Available Orders" : "Ready Orders"}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No {selectedTab} orders</div>
          ) : (
            <div className="space-y-4">
              {displayOrders.map((order) => (
                <OrderCard key={order._id} order={order} branchId={branchId} onRefresh={() => fetchOrders(branchId)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
