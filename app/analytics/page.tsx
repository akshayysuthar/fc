"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  CreditCard,
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
    totalOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    totalDeliveryFee: number;
    totalHandlingFee: number;
    branchId: string;
    branchName: string;
  }>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AnalyticsPage() {
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
      canceled: item.canceledOrders,
    }));
  };

  const getTotalStats = () => {
    if (!data)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCanceled: 0,
        totalDeliveryFee: 0,
      };

    return data.branchStats.reduce(
      (acc, branch) => ({
        totalOrders: acc.totalOrders + branch.totalOrders,
        totalRevenue: acc.totalRevenue + branch.totalRevenue,
        totalCanceled: acc.totalCanceled + branch.canceledOrders,
        totalDeliveryFee: acc.totalDeliveryFee + branch.totalDeliveryFee,
      }),
      { totalOrders: 0, totalRevenue: 0, totalCanceled: 0, totalDeliveryFee: 0 }
    );
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Track performance and insights</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
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
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No data available</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalCanceled} canceled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +${stats.totalDeliveryFee} delivery fees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Success Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalOrders > 0
                      ? Math.round(
                          ((stats.totalOrders - stats.totalCanceled) /
                            stats.totalOrders) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Order completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Order Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {stats.totalOrders > 0
                      ? Math.round(stats.totalRevenue / stats.totalOrders)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per order average
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders by Day */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Day</CardTitle>
                  <CardDescription>Daily order trends</CardDescription>
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
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatDayData(data.ordersByDay)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
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
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Distribution by payment type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ordersByPaymentMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ _id, totalOrders }) =>
                            `${_id}: ${totalOrders}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalOrders"
                        >
                          {data.ordersByPaymentMethod.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders by Slot */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Time Slot</CardTitle>
                  <CardDescription>Popular delivery times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.ordersBySlot} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="_id" type="category" width={100} />
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
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatDayData(data.ordersByDay)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>
                    Best selling products by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.sellerProductAggregation
                      .flatMap((seller) =>
                        seller.products.map((product) => ({
                          ...product,
                          sellerName: seller.sellerName,
                        }))
                      )
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {product.productName}
                            </div>
                            <div className="text-xs text-gray-600">
                              by {product.sellerName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${product.revenue}</div>
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
                  <CardTitle>Branch Performance</CardTitle>
                  <CardDescription>Performance by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.branchStats.map((branch, index) => (
                      <div
                        key={branch.branchId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {branch.branchName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders} orders •{" "}
                            {branch.canceledOrders} canceled
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            ${branch.totalRevenue}
                          </div>
                          <div className="text-xs text-gray-600">
                            {branch.totalOrders > 0
                              ? Math.round(
                                  ((branch.totalOrders -
                                    branch.canceledOrders) /
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
                <CardTitle>Payment Method Breakdown</CardTitle>
                <CardDescription>Detailed payment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.ordersByPaymentMethod.map((method, index) => (
                    <div key={method._id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">{method._id}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Orders:</span>
                          <span className="font-medium">
                            {method.totalOrders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Revenue:
                          </span>
                          <span className="font-medium">
                            ${method.totalRevenue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Avg Value:
                          </span>
                          <span className="font-medium">
                            $
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
