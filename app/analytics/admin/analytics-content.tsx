"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  Download,
  IndianRupee,
  CreditCard,
  Clock,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
  Legend,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";
import Link from "next/link";

interface AnalyticsData {
  ordersByDay: Array<{
    _id: { year: number; month: number; day: number };
    totalOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    totalDeliveryFee: number;
    totalHandlingFee: number;
  }>;
  ordersByMonth: Array<{
    _id: { year: number; month: number };
    totalOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    totalDeliveryFee: number;
    totalHandlingFee: number;
  }>;
  ordersBySlot: Array<{
    _id: string;
    totalOrders: number;
    totalRevenue: number;
    canceledOrders: number;
  }>;
  ordersByPaymentMethod: Array<{
    _id: string;
    totalOrders: number;
    totalRevenue: number;
    canceledOrders: number;
  }>;
  sellerProductAggregation: Array<{
    totalQuantitySold: number;
    totalRevenue: number;
    products: Array<{
      productId: string;
      productName: string;
      quantitySold: number;
      revenue: number;
    }>;
    sellerId: string;
    sellerName: string;
  }>;
  branchStats: Array<{
    totalQuantity: number;
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    avgPackingTime: number | null;
    avgDeliveryTime: number | null;
    branchId: string;
    branchName: string;
    totalDeliveryFee: number;
    totalHandlingFee: number;
  }>;
  onTimePerformance: {
    onTime: number;
    delayed: number;
    atRisk: number;
    total: number;
  };
  todayOrders: {
    total: number;
    completed: number;
    pending: number;
    change: number;
  };
  monthOrders: {
    total: number;
    completed: number;
    pending: number;
    change: number;
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AnalyticsPageContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/analytics?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/export?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `analytics-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const formatDayData = (dayData: AnalyticsData["ordersByDay"]) => {
    return dayData.map((item) => ({
      date: `${item._id.day}/${item._id.month}`,
      orders: item.totalOrders,
      revenue: item.totalRevenue,
      deliveryFee: item.totalDeliveryFee,
      handlingFee: item.totalHandlingFee,
      canceled: item.canceledOrders,
    }));
  };

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
        totalDeliveryFee: 0,
        totalHandlingFee: 0,
      };

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
        totalDeliveryFee: acc.totalDeliveryFee + branch.totalDeliveryFee,
        totalHandlingFee: acc.totalHandlingFee + branch.totalHandlingFee,
      }),
      {
        totalOrders: 0,
        totalRevenue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalProductsSold: 0,
        avgPackingTime: null as number | null,
        avgDeliveryTime: null as number | null,
        totalDeliveryFee: 0,
        totalHandlingFee: 0,
      }
    );
  };

  const stats = getTotalStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Validate onTimePerformance data
  const isValidOnTimeData = (
    onTimePerformance: AnalyticsData["onTimePerformance"] | undefined
  ) => {
    if (!onTimePerformance) return false;
    return (
      typeof onTimePerformance.onTime === "number" &&
      !isNaN(onTimePerformance.onTime) &&
      typeof onTimePerformance.atRisk === "number" &&
      !isNaN(onTimePerformance.atRisk) &&
      typeof onTimePerformance.delayed === "number" &&
      !isNaN(onTimePerformance.delayed)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Admin Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Complete system performance and insights
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal text-xs sm:text-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} -{" "}
                          {format(dateRange.to, "MMM dd, y")}
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
                        setDateRange({ from: range.from, to: range.to });
                        setShowCalendar(false);
                      }
                    }}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={exportData}
                className="flex items-center gap-2"
                size="sm"
              >
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
            {/* Today & Month Order Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Today's Orders
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.todayOrders?.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.todayOrders?.change > 0 ? "+" : ""}
                    {data.todayOrders?.change} from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Month Orders
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.monthOrders?.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.monthOrders?.change > 0 ? "+" : ""}
                    {data.monthOrders?.change} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    On-Time Rate
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.onTimePerformance?.total > 0
                      ? Math.round(
                          (data.onTimePerformance?.onTime /
                            data.onTimePerformance?.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.onTimePerformance?.onTime}/
                    {data.onTimePerformance?.total} orders on time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold flex items-center">
                    <IndianRupee className="h-3 w-3 sm:h-5 sm:w-5" />
                    {stats.totalRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg:{" "}
                    {formatCurrency(
                      stats.totalOrders > 0
                        ? stats.totalRevenue / stats.totalOrders
                        : 0
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Revenue Breakdown
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Order value, delivery & handling fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Order Value
                    </div>
                    <div className="text-xl font-bold flex items-center justify-center">
                      <IndianRupee className="h-4 w-4" />
                      {stats.totalRevenue -
                        stats.totalDeliveryFee -
                        stats.totalHandlingFee}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(
                        ((stats.totalRevenue -
                          stats.totalDeliveryFee -
                          stats.totalHandlingFee) /
                          stats.totalRevenue) *
                          100
                      )}
                      % of total
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Delivery Fees
                    </div>
                    <div className="text-xl font-bold flex items-center justify-center">
                      <IndianRupee className="h-4 w-4" />
                      {stats.totalDeliveryFee}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(
                        (stats.totalDeliveryFee / stats.totalRevenue) * 100
                      )}
                      % of total
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Handling Fees
                    </div>
                    <div className="text-xl font-bold flex items-center justify-center">
                      <IndianRupee className="h-4 w-4" />
                      {stats.totalHandlingFee}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(
                        (stats.totalHandlingFee / stats.totalRevenue) * 100
                      )}
                      % of total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* On-Time Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    On-Time Performance
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Orders packed before deadline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isValidOnTimeData(data.onTimePerformance) ? (
                    <ChartContainer
                      config={{
                        onTime: { label: "On Time", color: "#00C49F" },
                        atRisk: { label: "At Risk", color: "#FFBB28" },
                        delayed: { label: "Delayed", color: "#FF8042" },
                      }}
                      className="h-[200px] sm:h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "On Time",
                                value: data.onTimePerformance.onTime,
                              },
                              {
                                name: "At Risk",
                                value: data.onTimePerformance.atRisk,
                              },
                              {
                                name: "Delayed",
                                value: data.onTimePerformance.delayed,
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              {
                                name: "On Time",
                                value: data.onTimePerformance.onTime,
                                color: "#00C49F",
                              },
                              {
                                name: "At Risk",
                                value: data.onTimePerformance.atRisk,
                                color: "#FFBB28",
                              },
                              {
                                name: "Delayed",
                                value: data.onTimePerformance.delayed,
                                color: "#FF8042",
                              },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="text-gray-500 text-center">
                      No valid on-time performance data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Orders by Slot
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Popular delivery times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: { label: "Orders", color: "#0088FE" },
                    }}
                    className="h-[200px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.ordersBySlot}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="totalOrders"
                          fill="#0088FE"
                          name="Orders"
                        />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Components Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Revenue Components
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Daily breakdown of revenue sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: "Order Value", color: "#0088FE" },
                    deliveryFee: { label: "Delivery Fee", color: "#00C49F" },
                    handlingFee: { label: "Handling Fee", color: "#FFBB28" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatDayData(data.ordersByDay)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        stackId="a"
                        fill="#0088FE"
                        name="Order Value"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="deliveryFee"
                        stackId="a"
                        fill="#00C49F"
                        name="Delivery Fee"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="handlingFee"
                        stackId="a"
                        fill="#FFBB28"
                        name="Handling Fee"
                        radius={[0, 0, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Orders by Slot
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Orders by Time Slot
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Popular delivery times
                  </CardDescription>
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
                        <YAxis
                          dataKey="_id"
                          type="category"
                          width={60}
                          fontSize={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          // key={data.ordersBySlot._id}
                          dataKey="ordersBySlot"
                          stackId="a"
                          fill="#0088FE"
                          name="Order Value"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card> */}

              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Revenue Trend
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Daily revenue performance
                  </CardDescription>
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
                      {Array.isArray(data.ordersByDay) &&
                      data.ordersByDay.length > 0 ? (
                        <LineChart data={formatDayData(data.ordersByDay)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={10} />
                          <YAxis fontSize={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-revenue)"
                            strokeWidth={5}
                          />
                        </LineChart>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                          No revenue data available
                        </div>
                      )}
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
                  <CardTitle className="text-sm sm:text-lg">
                    Top Products
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Best selling products by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {data.sellerProductAggregation
                      .flatMap((seller) =>
                        seller.products.map((product) => ({
                          ...product,
                          sellerName: seller.sellerName,
                          sellerId: seller.sellerId,
                        }))
                      )
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={`${product.productId}-${
                            product.sellerId || index
                          }`}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">
                              {product.productName}
                            </div>
                            <div className="text-xs text-gray-600">
                              by {product.sellerName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold flex items-center text-xs sm:text-sm">
                              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                              {product.revenue}
                            </div>
                            <div className="text-xs text-gray-600">
                              {product.quantitySold} sold
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Branch Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Branch Performance
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Performance by branch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {data.branchStats.map((branch, index) => (
                      <div
                        key={branch.branchId}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {branch.branchName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders} orders •{" "}
                            {branch.deliveredOrders} delivered
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold flex items-center text-xs sm:text-sm">
                            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                            {branch.totalRevenue}
                          </div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders > 0
                              ? Math.round(
                                  (branch.deliveredOrders /
                                    branch.totalOrders) *
                                    100
                                )
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
                <CardTitle className="text-sm sm:text-lg">
                  Payment Method Breakdown
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Detailed payment analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {data.ordersByPaymentMethod.map((method, index) => (
                    <div
                      key={method._id}
                      className="p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {method._id}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Orders:</span>
                          <span className="font-medium text-xs">
                            {method.totalOrders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">
                            Revenue:
                          </span>
                          <span className="font-medium flex items-center text-xs">
                            <IndianRupee className="h-3 w-3" />
                            {method.totalRevenue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">
                            Avg Value:
                          </span>
                          <span className="font-medium flex items-center text-xs">
                            <IndianRupee className="h-3 w-3" />
                            {method.totalOrders > 0
                              ? Math.round(
                                  method.totalRevenue / method.totalOrders
                                )
                              : 0}
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
  );
}
