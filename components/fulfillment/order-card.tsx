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
      area: string
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

  const branchStats = getBranchItemStats(order.items)

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
              {order.customer.address.area}, {order.customer.address.pinCode}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">My Items: {branchStats.total}</div>
            <div className="text-xs text-gray-600">{order.slot.label}</div>
          </div>
        </div>

        {/* Branch Item Status */}
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-600 mb-1">My Branch Progress:</div>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-600">Pending: {branchStats.pending}</span>
            <span className="text-orange-600">Packing: {branchStats.packing}</span>
            <span className="text-green-600">Packed: {branchStats.packed}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">
            {new Date(order.slot.date).toLocaleDateString()} • {order.slot.startTime} - {order.slot.endTime}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {order.status === "ready" ? (
            <div className="w-full p-2 text-center bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium">
              ✓ Order Ready for Pickup
            </div>
          ) : (
            <Button asChild className="w-full" size="sm">
              <Link href={`/fulfillment/orders/${order._id}`}>
                Process Items ({branchStats.pending + branchStats.packing} remaining)
              </Link>
            </Button>
          )}

          {order.status === "packed" && (
            <Button onClick={() => updateOrderStatus("ready")} className="w-full" size="sm" variant="outline">
              Mark as Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
