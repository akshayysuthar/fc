"use client"

import { IndianRupee, Phone, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Order {
  _id: string
  orderId: string
  customer: {
    name: string
    phone: string
    address: {
      houseNo: string
      streetAddress: string
      area: string
      city: string
      state: string
      pinCode: string
    }
  }
  items: Array<{
    count: number
  }>
  slot: {
    label: string
    date: string
    startTime: string
    endTime: string
  }
  totalPrice: number
  payment: {
    method: string
    status: string
  }
  deliveryLocation?: {
    latitude: number
    longitude: number
  }
}

interface AvailableOrderCardProps {
  order: Order
  onAccept: (orderId: string) => void
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}

export default function AvailableOrderCard({ order, onAccept }: AvailableOrderCardProps) {
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

  const getTotalQty = (items: Array<{ count: number }>) => {
    return items.reduce((total, item) => total + item.count, 0)
  }

  const handleCall = () => {
    window.open(`tel:${order.customer.phone}`, "_self")
  }

  const handleOpenMap = () => {
    if (order.deliveryLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`,
        "_blank",
      )
    }
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm">#{order.orderId}</span>
          <div className="text-right">
            <div className="font-bold flex items-center">
              <IndianRupee className="h-4 w-4" />
              {order.totalPrice}
            </div>
            <Badge
              className={paymentStatusColors[order.payment.status as keyof typeof paymentStatusColors]}
              variant="secondary"
            >
              {order.payment.method}
            </Badge>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{order.customer.name}</div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={handleCall}>
                <Phone className="h-3 w-3" />
              </Button>
              {order.deliveryLocation && (
                <Button size="sm" variant="outline" onClick={handleOpenMap}>
                  <MapPin className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-600">{order.customer.phone}</div>
          <div className="text-xs text-gray-600">{formatAddress(order.customer.address)}</div>
        </div>

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

        <div className="mb-3 flex justify-between text-xs text-gray-600">
          <span>Qty: {getTotalQty(order.items)}</span>
        </div>

        <Button onClick={() => onAccept(order._id)} className="w-full" size="sm">
          Accept Order
        </Button>
      </CardContent>
    </Card>
  )
}
