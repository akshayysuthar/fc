"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DeliveryHeader from "@/components/delivery/delivery-header"
import DeliveryTabs from "@/components/delivery/delivery-tabs"
import AvailableOrderCard from "@/components/delivery/available-order-card"
import AssignedOrderCard from "@/components/delivery/assigned-order-card"

interface Order {
  _id: string
  orderId: string
  customer: {
    name: string
    phone: string
    address: {
      houseNo: string
      streetAddress: string
      city: string
      state: string
      pinCode: string
    }
  }
  items: Array<{
    name: string
    count: number
    price: number
    branch: {
      _id: string
      name: string
    }
    status?: string
  }>
  slot: {
    label: string
    date: string
    startTime: string
    endTime: string
  }
  totalPrice: number
  status: string
  payment: {
    method: string
    status: string
  }
  pickupLocations: Array<{
    branch: {
      _id: string
      name: string
    }
    address: string
    latitude: number
    longitude: number
  }>
}

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([])
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([])
  const [selectedTab, setSelectedTab] = useState<"available" | "assigned" | "delivered">("available")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryPartnerId")
    if (!storedUserId) {
      router.push("/delivery/login")
      return
    }
    setUserId(storedUserId)
    fetchAvailableOrders(storedUserId)
  }, [router])

  const fetchAvailableOrders = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/available?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setAvailableOrders(data.available || [])
      setAssignedOrders(data.assigned || [])
      setDeliveredOrders(data.delivered || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmOrder = async (orderId: string) => {
    if (!userId) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) throw new Error("Failed to confirm order")
      const order = availableOrders.find((o) => o._id === orderId)
      if (order) {
        setAvailableOrders(availableOrders.filter((o) => o._id !== orderId))
        setAssignedOrders([...assignedOrders, { ...order, status: "assigned" }])
        setSelectedTab("assigned")
      }
    } catch (error) {
      console.error("Failed to confirm order:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("deliveryPartnerId")
    router.push("/delivery/login")
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-8 text-gray-500">Loading...</div>
    }

    switch (selectedTab) {
      case "available":
        return availableOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders available</div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <AvailableOrderCard key={order._id} order={order} onAccept={confirmOrder} />
            ))}
          </div>
        )

      case "assigned":
        return assignedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No assigned orders</div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map((order) => (
              <AssignedOrderCard key={order._id} order={order} />
            ))}
          </div>
        )

      case "delivered":
        return deliveredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No delivered orders</div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map((order) => (
              <AssignedOrderCard key={order._id} order={order} />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (!userId) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DeliveryHeader userId={userId} onRefresh={() => fetchAvailableOrders(userId)} onLogout={handleLogout} />

      <div className="p-4 space-y-4">
        <DeliveryTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          counts={{
            available: availableOrders.length,
            assigned: assignedOrders.length,
            delivered: deliveredOrders.length,
          }}
        />
        {renderContent()}
      </div>
    </div>
  )
}
