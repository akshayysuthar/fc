"use client"

import { Clock, IndianRupee, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

interface OrderCardProps {
  order: Order
  branchId: string
  onRefresh: () => void
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
}

export default function OrderCard({ order, branchId, onRefresh }: OrderCardProps) {
  const calculateTimeTaken = (createdAt: string, packedAt?: string) => {
    if (!createdAt) return null

    const startTime = new Date(createdAt)
    const endTime = packedAt ? new Date(packedAt) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) {
      return `${diffMins}m`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    }
  }

  const getMyBranchItems = (items: Order["items"]) => {
    return items.filter((item) => item.branch === branchId)
  }

  const getBranchItemStats = (items: Order["items"]) => {
    const myItems = getMyBranchItems(items)
    return {
      total: myItems.length,
      pending: myItems.filter((item) => item.status === "pending").length,
      packing: myItems.filter((item) => item.status === "packing").length,
      packed: myItems.filter((item) => item.status === "packed").length,
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      // Refresh the data
      onRefresh()
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return "N/A"
    const parts = [
      address.houseNo,
      address.streetAddress,
      address.area,
      address.city,
      address.state,
      address.pinCode,
    ].filter(Boolean)
    return parts.join(", ")
  }

  const branchStats = getBranchItemStats(order.items)
  const remainingItems = branchStats.pending + branchStats.packing

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className={statusColors[order.status as keyof typeof statusColors]} variant="secondary">
              {order.status}
            </Badge>
            <span className="font-medium text-xs sm:text-sm">#{order.orderId}</span>
          </div>
          <div className="text-right">
            <div className="font-bold flex items-center text-sm sm:text-base">
              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
              {order.totalPrice}
            </div>
            {order.statusTimestamps?.confirmedAt && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {calculateTimeTaken(order.statusTimestamps.confirmedAt, order.statusTimestamps.packedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="font-medium text-sm">{order.customer.name}</div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatAddress(order.customer.address)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Items: {branchStats.total}</div>
            <div className="text-xs text-gray-600">{order.slot.label}</div>
          </div>
        </div>

        {/* Slot Details */}
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-600">Delivery Slot:</div>
          <div className="font-bold text-sm">
            {new Date(order.slot.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-600">
            {order.slot.startTime} - {order.slot.endTime} • {order.slot.label}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {order.status === "ready" ? (
            <div className="w-full p-2 text-center bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium">
              ✓ Order Ready for Pickup
            </div>
          ) : order.status === "packed" ? (
            <div className="space-y-2">
              <div className="w-full p-2 text-center bg-purple-50 border border-purple-200 rounded text-purple-700 text-sm font-medium">
                ✓ All Items Packed
              </div>
              <Button onClick={() => updateOrderStatus("ready")} className="w-full" size="sm" variant="outline">
                Mark as Ready
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full" size="sm">
              <Link href={`/fulfillment/orders/${order._id}`}>Process Items ({remainingItems} remaining)</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
