"use client"

import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  stats: {
    totalOrders: number
    packedOrders: number
    pendingOrders: number
    readyOrders: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-xs text-gray-600">Total Orders</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          <div className="text-xs text-gray-600">Pending Orders</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.packedOrders}</div>
          <div className="text-xs text-gray-600">Packed Orders</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.readyOrders}</div>
          <div className="text-xs text-gray-600">Ready Orders</div>
        </CardContent>
      </Card>
    </div>
  )
}
