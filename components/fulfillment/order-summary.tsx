"use client"

import { IndianRupee, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OrderSummaryProps {
  order: {
    _id: string
    status: string
    customer: {
      name: string
      address: {
        area: string
        pinCode: string
      }
    }
    slot: {
      label: string
    }
    totalPrice: number
  }
  onUpdateStatus: (status: string) => void
  loading: boolean
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
}

export default function OrderSummary({ order, onUpdateStatus, loading }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={statusColors[order.status as keyof typeof statusColors]} variant="secondary">
            {order.status}
          </Badge>

          {order.status === "packed" && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("ready")} disabled={loading}>
              Mark as Ready
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Customer</div>
            <div className="font-medium">{order.customer.name}</div>
          </div>
          <div>
            <div className="text-gray-600">Delivery Area</div>
            <div className="font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {order.customer.address.area}
            </div>
          </div>
          <div>
            <div className="text-gray-600">PIN Code</div>
            <div className="font-medium">{order.customer.address.pinCode}</div>
          </div>
          <div>
            <div className="text-gray-600">Slot</div>
            <div className="font-medium">{order.slot.label}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-600">Total Order Value</div>
            <div className="font-bold text-base sm:text-lg flex items-center">
              <IndianRupee className="h-4 w-4" />
              {order.totalPrice}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
