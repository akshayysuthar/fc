"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Package, Clock, IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderDetailHeader from "@/components/fulfillment/order-detail-header"
import BranchProgress from "@/components/fulfillment/branch-progress"
import OrderSummary from "@/components/fulfillment/order-summary"

interface OrderDetail {
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
    _id: string
    name: string
    image: string
    count: number
    price: number
    itemTotal: number
    variantId: string
    branch: { _id: string }
    status: string
    product: {
      _id: string
      name: string
      image: string
    }
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
  pickupLocations: Array<{
    branch: string
    address: string
    latitude: number
    longitude: number
  }>
}

const itemStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-green-100 text-green-800",
}

export default function FulfillmentOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const storedBranchId = localStorage.getItem("branchId")
    if (!storedBranchId) {
      router.push("/fulfillment/login")
      return
    }
    setBranchId(storedBranchId)
  }, [router])

  useEffect(() => {
    if (orderId && branchId) {
      fetchOrderDetails()
    }
  }, [orderId, branchId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}`)
      if (!response.ok) throw new Error("Failed to fetch order")
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    if (!branchId) return

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/items/${itemId}/packing-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            newStatus,
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to update item status")

      const result = await response.json()

      // Refresh the order data
      await fetchOrderDetails()

      if (result.message) {
        console.log(result.message)
      }
    } catch (error) {
      console.error("Failed to update item status:", error)
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!branchId) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update order status")

      // Refresh the order data
      await fetchOrderDetails()
    } catch (error) {
      console.error("Failed to update order status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Order not found</div>
      </div>
    )
  }

  // Filter items for current branch
  const myBranchItems = order?.items.filter((item) => item.branch._id.toString() === branchId) || []

  const otherBranchItems = order?.items.filter((item) => item.branch._id.toString() !== branchId) || []

  // Get branch-specific stats
  const myBranchStats = {
    total: myBranchItems.length,
    pending: myBranchItems.filter((item) => item.status === "pending").length,
    packing: myBranchItems.filter((item) => item.status === "packing").length,
    packed: myBranchItems.filter((item) => item.status === "packed").length,
  }

  const getItemActions = (item: any) => {
    if (item.branch._id !== branchId) return []

    switch (item.status) {
      case "pending":
        return [{ label: "Start Packing", status: "packing" }]
      case "packing":
        return [{ label: "Mark as Packed", status: "packed" }]
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderDetailHeader orderId={order.orderId} status={order.status} statusTimestamps={order.statusTimestamps} />

      <div className="p-3 sm:p-4 space-y-4">
        <BranchProgress stats={myBranchStats} />

        <OrderSummary order={order} onUpdateStatus={updateOrderStatus} loading={loading} />

        {/* My Branch Items */}
        {myBranchItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Branch Items ({myBranchItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {myBranchItems.map((item) => {
                  const actions = getItemActions(item)
                  const isUpdating = updatingItems.has(item._id)

                  return (
                    <div key={item._id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.count} × <IndianRupee className="h-3 w-3 inline" />
                            {item.price} = <IndianRupee className="h-3 w-3 inline" />
                            {item.itemTotal}
                          </div>
                        </div>
                        <Badge
                          className={itemStatusColors[item.status as keyof typeof itemStatusColors]}
                          variant="secondary"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      {actions.length > 0 && (
                        <div className="flex gap-2">
                          {actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              onClick={() => updateItemStatus(item._id, action.status)}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              {isUpdating ? "Updating..." : action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Branch Items */}
        {otherBranchItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Other Branch Items ({otherBranchItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {otherBranchItems.map((item) => (
                  <div key={item._id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          Qty: {item.count} × <IndianRupee className="h-3 w-3 inline" />
                          {item.price} = <IndianRupee className="h-3 w-3 inline" />
                          {item.itemTotal}
                        </div>
                        <div className="text-xs text-gray-500">Handled by other branch</div>
                      </div>
                      <Badge
                        className={itemStatusColors[item.status as keyof typeof itemStatusColors]}
                        variant="secondary"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Slot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="font-medium">{order.slot.label}</div>
              <div className="text-sm text-gray-600">
                {new Date(order.slot.date).toLocaleDateString()} • {order.slot.startTime} - {order.slot.endTime}
              </div>
              <div className="text-sm text-gray-600">
                Order placed: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
