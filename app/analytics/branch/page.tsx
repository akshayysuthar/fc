"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { format, subDays } from "date-fns"
import AnalyticsHeader from "@/components/analytics/analytics-header"
import StatsGrid from "@/components/analytics/stats-grid"

interface BranchAnalyticsData {
  ordersByDay: Array<{
    _id: { year: number; month: number; day: number }
    totalOrders: number
    canceledOrders: number
    totalRevenue: number
    totalDeliveryFee: number
    totalHandlingFee: number
  }>
  ordersBySlot: Array<{
    _id: string
    totalOrders: number
    totalRevenue: number
    canceledOrders: number
  }>
  ordersByPaymentMethod: Array<{
    _id: string
    totalOrders: number
    totalRevenue: number
    canceledOrders: number
  }>
  branchStats: {
    totalQuantity: number
    totalRevenue: number
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    avgPackingTime: number | null
    avgDeliveryTime: number | null
    branchId: string
    branchName: string
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function BranchAnalyticsPage() {
  const [branchId, setBranchId] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState<BranchAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    if (isLoggedIn && branchId && dateRange) {
      fetchAnalytics()
    }
  }, [isLoggedIn, branchId, dateRange])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchId.trim()) return
    setIsLoggedIn(true)
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/branch/${branchId}?startDate=${startDate}&endDate=${endDate}`,
      )

      if (!response.ok) throw new Error("Failed to fetch analytics")

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/branch/${branchId}/export?startDate=${startDate}&endDate=${endDate}`,
      )

      if (!response.ok) throw new Error("Failed to export data")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `branch-${branchId}-analytics-${startDate}-to-${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const formatDayData = (dayData: BranchAnalyticsData["ordersByDay"]) => {
    return dayData.map((item) => ({
      date: `${item._id.day}/${item._id.month}`,
      orders: item.totalOrders,
      revenue: item.totalRevenue,
      canceled: item.canceledOrders,
    }))
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Branch Analytics</CardTitle>
            <CardDescription>Enter your branch ID to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="branchId">Branch ID</Label>
                <Input
                  id="branchId"
                  type="text"
                  placeholder="Enter branch ID"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                View Analytics
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsHeader
        title={`Branch Analytics - ${data?.branchStats?.branchName || branchId}`}
        subtitle="Track branch performance and insights"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={exportData}
        backLink="/"
      />

      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No data available</div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <StatsGrid
              stats={{
                totalOrders: data.branchStats.totalOrders,
                totalRevenue: data.branchStats.totalRevenue,
                deliveredOrders: data.branchStats.deliveredOrders,
                cancelledOrders: data.branchStats.cancelledOrders,
                totalProductsSold: data.branchStats.totalQuantity,
                avgPackingTime: data.branchStats.avgPackingTime,
                avgDeliveryTime: data.branchStats.avgDeliveryTime,
              }}
            />

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Orders by Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Orders by Day</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Daily order trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-1))",
                      },
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatDayData(data.ordersByDay)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="orders" fill="var(--color-orders)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Payment Methods</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Distribution by payment type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ordersByPaymentMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ _id, totalOrders }) => `${_id}: ${totalOrders}`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="totalOrders"
                        >
                          {data.ordersByPaymentMethod.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Orders by Slot */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Orders by Time Slot</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Popular delivery times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.ordersBySlot} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} />
                        <YAxis dataKey="_id" type="category" width={60} fontSize={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="totalOrders" fill="var(--color-orders)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Revenue Trend</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Daily revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatDayData(data.ordersByDay)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
