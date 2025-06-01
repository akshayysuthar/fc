"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/fulfillment/header"
import StatsCards from "@/components/fulfillment/stats-cards"
import OrderCard from "@/components/fulfillment/order-card"

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
    name: string
    count: number
    price: number
    branch: string
    status: string
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

  const getStats = () => {
    if (!branchId) return { pending: 0, packing: 0, packed: 0, total: 0 }

    const myItems = orders.flatMap((order) => order.items.filter((item) => item.branch === branchId))

    return {
      pending: myItems.filter((item) => item.status === "pending").length,
      packing: myItems.filter((item) => item.status === "packing").length,
      packed: myItems.filter((item) => item.status === "packed").length,
      total: orders.length,
    }
  }

  const getSlotStats = () => {
    if (!branchId) return {}

    const slotStats: { [key: string]: { pending: number; packing: number; packed: number; total: number } } = {}

    orders.forEach((order) => {
      const slotKey = `${order.slot.label} (${new Date(order.slot.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })})`

      if (!slotStats[slotKey]) {
        slotStats[slotKey] = { pending: 0, packing: 0, packed: 0, total: 0 }
      }

      const myItems = order.items.filter((item) => item.branch === branchId)
      slotStats[slotKey].total += 1
      slotStats[slotKey].pending += myItems.filter((item) => item.status === "pending").length
      slotStats[slotKey].packing += myItems.filter((item) => item.status === "packing").length
      slotStats[slotKey].packed += myItems.filter((item) => item.status === "packed").length
    })

    return slotStats
  }

  const stats = getStats()
  const slotStats = getSlotStats()

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
        <StatsCards stats={stats} slotStats={slotStats} />

        <div className="mt-4 sm:mt-6">
          <h2 className="text-lg font-semibold mb-4">Pending Orders</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending orders</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} branchId={branchId} onRefresh={() => fetchOrders(branchId)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
