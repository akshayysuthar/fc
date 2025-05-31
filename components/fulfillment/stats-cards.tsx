"use client"

import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  stats: {
    pending: number
    packing: number
    packed: number
    total: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-600">Pending Items</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.packing}</div>
          <div className="text-xs text-gray-600">Packing Items</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.packed}</div>
          <div className="text-xs text-gray-600">Packed Items</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-2 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Orders</div>
        </CardContent>
      </Card>
    </div>
  )
}
