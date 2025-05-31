"use client"

import type React from "react"

import { useState } from "react"
import { Search, Package, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface OrderLookupResult {
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
  totalPrice: number
  items: Array<{
    name: string
    count: number
  }>
  slot: {
    label: string
    date: string
  }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  arriving: "bg-orange-100 text-orange-800",
  delivered: "bg-gray-100 text-gray-800",
}

export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<OrderLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchOrder = async () => {
    if (!orderId.trim()) return

    try {
      setLoading(true)
      setError("")
      setOrder(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId.trim()}`)

      if (!response.ok) {
        throw new Error("Order not found")
      }

      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      setError("Order not found. Please check the Order ID and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrder()
  }

  const getTotalQty = (items: Array<{ count: number }>) => {
    return items.reduce((total, item) => total + item.count, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Order Lookup</h1>
              <p className="text-xs sm:text-sm text-gray-600">Search for any order by Order ID</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 max-w-2xl mx-auto">
        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="Enter Order ID (e.g., ORD00120)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={loading || !orderId.trim()}>
                {loading ? "Searching..." : "Search Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-red-700">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Order Result */}
        {order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">#{order.orderId}</h3>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]} variant="secondary">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{order.totalPrice}</div>
                    <div className="text-sm text-gray-600">{getTotalQty(order.items)} items</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Customer</div>
                    <div className="font-medium">{order.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Delivery Area</div>
                    <div className="font-medium">
                      {order.customer.address.area}, {order.customer.address.pinCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Delivery Slot</div>
                    <div className="font-medium">{order.slot.label}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-medium">{new Date(order.slot.date).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="text-sm text-gray-600 mb-2">Order Items</div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white border rounded">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600">Qty: {item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button asChild className="flex-1">
                    <Link href={`/delivery/orders/${order._id}`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Go to Delivery
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/fulfillment/orders/${order._id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Go to Fulfillment
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
