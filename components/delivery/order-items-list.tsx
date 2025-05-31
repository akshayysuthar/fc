"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, IndianRupee } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface OrderItemsListProps {
  items: Array<{
    _id: string
    name: string
    image: string
    count: number
    price: number
    itemTotal: number
  }>
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  const [showItems, setShowItems] = useState(false)

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-0 h-auto"
          onClick={() => setShowItems(!showItems)}
        >
          <span className="font-medium">Order Items ({items.length})</span>
          {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showItems && (
          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.count} × <IndianRupee className="h-3 w-3 inline" />
                    {item.price} = <IndianRupee className="h-3 w-3 inline" />
                    {item.itemTotal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
