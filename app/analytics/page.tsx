"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, subDays } from "date-fns"

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
    totalOrders: number
    canceledOrders: number
    totalRevenue: number
    totalDeliveryFee: number
    totalHandlingFee: number
    branchId: string
    branchName: string
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
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
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin analytics (which requires password)
    router.push("/analytics/admin")
  }, [router])

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
    if (!data) return { totalOrders: 0, totalRevenue: 0, totalCanceled: 0, totalDeliveryFee: 0 }

    return data.branchStats.reduce(
      (acc, branch) => ({
        totalOrders: acc.totalOrders + branch.totalOrders,
        totalRevenue: acc.totalRevenue + branch.totalRevenue,
        totalCanceled: acc.totalCanceled + branch.canceledOrders,
        totalDeliveryFee: acc.totalDeliveryFee + branch.totalDeliveryFee,
      }),
      { totalOrders: 0, totalRevenue: 0, totalCanceled: 0, totalDeliveryFee: 0 },
    )
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div>Redirecting to analytics...</div>
    </div>
  )
}
