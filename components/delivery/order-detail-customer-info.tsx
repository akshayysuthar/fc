"use client"

import { IndianRupee, Navigation, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CustomerInfoProps {
  order: {
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
    orderId: string
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
    items: Array<{ count: number }>
  }
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}

export default function OrderDetailCustomerInfo({ order }: CustomerInfoProps) {
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

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-base sm:text-lg">{order.customer.name}</div>
            <div className="text-sm text-gray-600">#{order.orderId}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCall}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${
                  order.deliveryLocation?.latitude || 0
                },${order.deliveryLocation?.longitude || 0}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            {/* <span>{order.customer.phone}</span> */}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Address:</span>
            <span className="text-right flex-1 ml-2">{formatAddress(order.customer.address)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Slot:</span>
            <div className="text-right">
              <div className="font-bold">
                {new Date(order.slot.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="text-xs text-gray-600">
                {order.slot.startTime} - {order.slot.endTime}
              </div>
              <div className="text-xs text-gray-600">{order.slot.label}</div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Qty:</span>
            <span>{getTotalQty(order.items)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-bold flex items-center">
              <IndianRupee className="h-4 w-4" />
              {order.totalPrice}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment:</span>
            <Badge
              className={paymentStatusColors[order.payment.status as keyof typeof paymentStatusColors]}
              variant="secondary"
            >
              {order.payment.method} - {order.payment.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
