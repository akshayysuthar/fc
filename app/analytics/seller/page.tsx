"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Store, IndianRupee } from "lucide-react"
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

interface SellerAnalyticsData {
  ordersByDay: Array<{
    _id: { year: number; month: number; day: number }
    totalOrders: number
    canceledOrders: number
    totalRevenue: number
  }>
  productStats: Array<{
    productId: string
    productName: string
    quantitySold: number
    revenue: number
    totalOrders: number
  }>
  sellerStats: {
    totalQuantitySold: number
    totalRevenue: number
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    sellerId: string
    sellerName: string
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function SellerAnalyticsPage() {
  const [sellerId, setSellerId] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState<SellerAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    if (isLoggedIn && sellerId && dateRange) {
      fetchAnalytics()
    }
  }, [isLoggedIn, sellerId, dateRange])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellerId.trim()) return
    setIsLoggedIn(true)
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/seller/${sellerId}?startDate=${startDate}&endDate=${endDate}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/seller/${sellerId}/export?startDate=${startDate}&endDate=${endDate}`,
      )

      if (!response.ok) throw new Error("Failed to export data")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `seller-${sellerId}-analytics-${startDate}-to-${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const formatDayData = (dayData: SellerAnalyticsData["ordersByDay"]) => {
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
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Seller Analytics</CardTitle>
            <CardDescription>Enter your seller ID to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="sellerId">Seller ID</Label>
                <Input
                  id="sellerId"
                  type="text"
                  placeholder="Enter seller ID"
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
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
        title={`Seller Analytics - ${data?.sellerStats?.sellerName || sellerId}`}
        subtitle="Track seller performance and product insights"
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">{data.sellerStats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{data.sellerStats.cancelledOrders} canceled</p>
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
                    {data.sellerStats.totalRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">From product sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Items Sold</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">{data.sellerStats.totalQuantitySold}</div>
                  <p className="text-xs text-muted-foreground">Total quantity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Avg Order Value</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold flex items-center">
                    <IndianRupee className="h-3 w-3 sm:h-5 sm:w-5" />
                    {data.sellerStats.totalOrders > 0
                      ? Math.round(data.sellerStats.totalRevenue / data.sellerStats.totalOrders)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per order average</p>
                </CardContent>
              </Card>
            </div>

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

              {/* Product Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Product Performance</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Revenue by product</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.productStats.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ productName, revenue }) => `${productName}: ₹${revenue}`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {data.productStats.slice(0, 6).map((entry, index) => (
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

            {/* Top Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">Top Products</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-4">
                  {data.productStats
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 10)
                    .map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{product.productName}</div>
                          <div className="text-xs text-gray-600">
                            {product.quantitySold} sold • {product.totalOrders} orders
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold flex items-center text-xs sm:text-sm">
                            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                            {product.revenue}
                          </div>
                          <div className="text-xs text-gray-600">
                            ₹{product.quantitySold > 0 ? Math.round(product.revenue / product.quantitySold) : 0} per
                            item
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
