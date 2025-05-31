"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, IndianRupee, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import Link from "next/link"
import StatsGrid from "@/components/analytics/stats-grid"

interface AnalyticsData {
  ordersByDay: Array<{
    _id: { year: number; month: number; day: number }
    totalOrders: number
    canceledOrders: number
    totalRevenue: number
    totalDeliveryFee: number
    totalHandlingFee: number
  }>
  ordersByMonth: Array<{
    _id: { year: number; month: number }
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
  sellerProductAggregation: Array<{
    totalQuantitySold: number
    totalRevenue: number
    products: Array<{
      productId: string
      productName: string
      quantitySold: number
      revenue: number
    }>
    sellerId: string
    sellerName: string
  }>
  branchStats: Array<{
    totalQuantity: number
    totalRevenue: number
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    avgPackingTime: number | null
    avgDeliveryTime: number | null
    branchId: string
    branchName: string
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPageContent() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/analytics?startDate=${startDate}&endDate=${endDate}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/export?startDate=${startDate}&endDate=${endDate}`,
      )

      if (!response.ok) throw new Error("Failed to export data")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `analytics-${startDate}-to-${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const formatDayData = (dayData: AnalyticsData["ordersByDay"]) => {
    return dayData.map((item) => ({
      date: `${item._id.day}/${item._id.month}`,
      orders: item.totalOrders,
      revenue: item.totalRevenue,
      canceled: item.canceledOrders,
    }))
  }

  const getTotalStats = () => {
    if (!data)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalProductsSold: 0,
        avgPackingTime: null,
        avgDeliveryTime: null,
      }

    return data.branchStats.reduce(
      (acc, branch) => ({
        totalOrders: acc.totalOrders + branch.totalOrders,
        totalRevenue: acc.totalRevenue + branch.totalRevenue,
        deliveredOrders: acc.deliveredOrders + branch.deliveredOrders,
        cancelledOrders: acc.cancelledOrders + branch.cancelledOrders,
        totalProductsSold: acc.totalProductsSold + branch.totalQuantity,
        avgPackingTime: branch.avgPackingTime
          ? acc.avgPackingTime
            ? (acc.avgPackingTime + branch.avgPackingTime) / 2
            : branch.avgPackingTime
          : acc.avgPackingTime,
        avgDeliveryTime: branch.avgDeliveryTime
          ? acc.avgDeliveryTime
            ? (acc.avgDeliveryTime + branch.avgDeliveryTime) / 2
            : branch.avgDeliveryTime
          : acc.avgDeliveryTime,
      }),
      {
        totalOrders: 0,
        totalRevenue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalProductsSold: 0,
        avgPackingTime: null as number | null,
        avgDeliveryTime: null as number | null,
      },
    )
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Complete system performance and insights</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal text-xs sm:text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                        setShowCalendar(false)
                      }
                    }}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={exportData} className="flex items-center gap-2" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/">← Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

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
            <StatsGrid stats={stats} />

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

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Top Products</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {data.sellerProductAggregation
                      .flatMap((seller) =>
                        seller.products.map((product) => ({
                          ...product,
                          sellerName: seller.sellerName,
                        })),
                      )
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{product.productName}</div>
                            <div className="text-xs text-gray-600">by {product.sellerName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold flex items-center text-xs sm:text-sm">
                              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                              {product.revenue}
                            </div>
                            <div className="text-xs text-gray-600">{product.quantitySold} sold</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Branch Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">Branch Performance</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Performance by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {data.branchStats.map((branch, index) => (
                      <div
                        key={branch.branchId}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{branch.branchName}</div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders} orders • {branch.deliveredOrders} delivered
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold flex items-center text-xs sm:text-sm">
                            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                            {branch.totalRevenue}
                          </div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders > 0
                              ? Math.round((branch.deliveredOrders / branch.totalOrders) * 100)
                              : 0}
                            % success
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">Payment Method Breakdown</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Detailed payment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {data.ordersByPaymentMethod.map((method, index) => (
                    <div key={method._id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium text-sm">{method._id}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Orders:</span>
                          <span className="font-medium text-xs">{method.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Revenue:</span>
                          <span className="font-medium flex items-center text-xs">
                            <IndianRupee className="h-3 w-3" />
                            {method.totalRevenue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Avg Value:</span>
                          <span className="font-medium flex items-center text-xs">
                            <IndianRupee className="h-3 w-3" />
                            {method.totalOrders > 0 ? Math.round(method.totalRevenue / method.totalOrders) : 0}
                          </span>
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
