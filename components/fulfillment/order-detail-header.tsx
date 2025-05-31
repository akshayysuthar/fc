"use client"

import { ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface OrderDetailHeaderProps {
  orderId: string
  status: string
  statusTimestamps?: {
    confirmedAt?: string
    packedAt?: string
  }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
}

export default function OrderDetailHeader({ orderId, status, statusTimestamps }: OrderDetailHeaderProps) {
  const calculateTimeTaken = (confirmedAt: string, packedAt?: string) => {
    if (!confirmedAt) return null

    const startTime = new Date(confirmedAt)
    const endTime = packedAt ? new Date(packedAt) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) {
      return `${diffMins} minutes`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    }
  }

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/fulfillment">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-bold">Order #{orderId}</h1>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[status as keyof typeof statusColors]} variant="secondary">
                {status}
              </Badge>
              {statusTimestamps?.confirmedAt && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {calculateTimeTaken(statusTimestamps.confirmedAt, statusTimestamps.packedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
