"use client"

import { Package, IndianRupee, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsGridProps {
  stats: {
    totalOrders: number
    totalRevenue: number
    deliveredOrders: number
    cancelledOrders: number
    totalProductsSold?: number
    avgPackingTime?: number | null
    avgDeliveryTime?: number | null
  }
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const formatTime = (minutes: number | null) => {
    if (!minutes) return "N/A"
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const successRate = stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-base sm:text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">{stats.cancelledOrders} canceled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-base sm:text-2xl font-bold flex items-center">
            <IndianRupee className="h-3 w-3 sm:h-5 sm:w-5" />
            {stats.totalRevenue}
          </div>
          {stats.totalProductsSold && (
            <p className="text-xs text-muted-foreground">{stats.totalProductsSold} items sold</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-base sm:text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">{stats.deliveredOrders} delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Avg Times</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm sm:text-base font-bold">Pack: {formatTime(stats.avgPackingTime)}</div>
          <p className="text-xs text-muted-foreground">Delivery: {formatTime(stats.avgDeliveryTime)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
