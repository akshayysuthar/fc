"use client"

import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  stats: {
    pending: number
    packing: number
    packed: number
    total: number
  }
  slotStats?: {
    [slotName: string]: {
      pending: number
      packing: number
      packed: number
      total: number
    }
  }
}

export default function StatsCards({ stats, slotStats }: StatsCardsProps) {
  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
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

      {/* Slot-wise Stats */}
      {slotStats && Object.keys(slotStats).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Slot-wise Progress</h3>
          <div className="space-y-2">
            {Object.entries(slotStats).map(([slotName, slotData]) => (
              <Card key={slotName}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{slotName}</div>
                    <div className="text-xs text-gray-600">{slotData.total} orders</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{slotData.pending}</div>
                      <div className="text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{slotData.packing}</div>
                      <div className="text-gray-600">Packing</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{slotData.packed}</div>
                      <div className="text-gray-600">Packed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
