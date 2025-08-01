"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  Download,
  IndianRupee,
  CreditCard,
  Clock,
  Package,
  MapPin, // Added for Orders by Area
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
  LineChart,
  Line,
  Legend,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";
import Link from "next/link";

// Define the interface for the new API response structure
interface AnalyticsData {
  todayOrders: {
    _id: null;
    total: number;
    completed: number;
    pending: number;
  };
  currentOrders: number;
  totalRevenue: number;
  ordersBySlot: Array<{
    _id: string;
    totalOrders: number;
    totalValue: number;
  }>;
  ordersByArea: Array<{
    _id: string | null; // _id can be null based on the example
    totalOrders: number;
    totalValue: number;
  }>;
  ordersByDay: Array<{
    _id: string; // "YYYY-MM-DD" format
    count: number;
    revenue: number;
  }>;
  ordersByPaymentMethod: Array<{
    _id: string;
    totalOrders: number;
    totalValue: number;
  }>;
  branchStats: Array<{
    _id: string;
    name: string;
    totalOrders: number;
    totalValue: number;
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
    // Simulate API call with the provided JSON data
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // In a real application, you would fetch data based on dateRange
    // For this example, we use the provided static JSON
    const staticData = {
      success: true,
      data: {
        todayOrders: {
          _id: null,
          total: 1,
          completed: 0,
          pending: 1,
        },
        currentOrders: 2,
        totalRevenue: 9277.28,
        ordersBySlot: [
          {
            _id: "11 pm to 1 am",
            totalOrders: 1,
            totalValue: 6813.63,
          },
          {
            _id: "7 pm to 9 pm",
            totalOrders: 1,
            totalValue: 1007.2,
          },
          {
            _id: "9 pm to 11 pm",
            totalOrders: 1,
            totalValue: 1456.45,
          },
        ],
        ordersByArea: [
          {
            _id: null, // Example shows null, but usually would be an area name
            totalOrders: 3,
            totalValue: 9277.28,
          },
        ],
        ordersByDay: [
          {
            _id: "2025-07-29",
            count: 2,
            revenue: 8270.08,
          },
          {
            _id: "2025-07-30",
            count: 1,
            revenue: 1007.2,
          },
        ],
        ordersByPaymentMethod: [
          {
            _id: "upi",
            totalOrders: 1,
            totalValue: 1456.45,
          },
          {
            _id: "COD",
            totalOrders: 2,
            totalValue: 7820.83,
          },
        ],
        branchStats: [
          {
            _id: "68120a5be236fb12533da4dc",
            name: "Canal Road FC (Test )",
            totalOrders: 3,
            totalValue: 9277.28,
          },
        ],
      },
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (staticData.success) {
      setData(staticData.data);
    } else {
      console.error("Failed to fetch analytics: Static data indicates failure");
    }
    setLoading(false);
  };

  const exportData = async () => {
    // This function would typically trigger a backend export.
    // For this example, we'll just log a message.
    console.log("Export data functionality would be implemented here.");
    alert("Export functionality is not implemented in this demo.");
  };

  const formatDayDataForChart = (dayData: AnalyticsData["ordersByDay"]) => {
    return dayData.map((item) => ({
      date: format(new Date(item._id), "MMM dd"), // Format date for display
      orders: item.count,
      revenue: item.revenue,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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
                    className="justify-start text-left font-normal text-xs sm:text-sm w-full sm:w-auto"
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
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
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
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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
                    Completed: {data.todayOrders?.completed} • Pending:{" "}
                    {data.todayOrders?.pending}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Current Live Orders
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.currentOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Orders currently in progress
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
                    {formatCurrency(data.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall revenue for selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Orders by Area
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.ordersByArea?.[0]?.totalOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total orders across all areas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders by Slot Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Orders by Time Slot
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribution of orders across different time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    totalOrders: { label: "Orders", color: "#0088FE" },
                  }}
                  className="h-[200px] sm:h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.ordersBySlot.sort((a, b) =>
                        a._id.localeCompare(b._id)
                      )} // Sort by slot name for consistency
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="_id"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="totalOrders"
                        fill="#0088FE"
                        name="Orders"
                        radius={[4, 4, 0, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue Trend by Day */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Daily Revenue Trend
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Revenue performance over the selected date range
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
                      <LineChart data={formatDayDataForChart(data.ordersByDay)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        No daily revenue data available
                      </div>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Payment Method Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Payment Method Breakdown
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Detailed payment analysis by method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {data.ordersByPaymentMethod.map((method, index) => (
                    <div
                      key={method._id}
                      className="p-3 sm:p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-gray-700" />
                        <span className="font-semibold text-sm capitalize">
                          {method._id}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Orders:</span>
                          <span className="font-medium text-sm">
                            {method.totalOrders}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            Revenue:
                          </span>
                          <span className="font-medium flex items-center text-sm">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {formatCurrency(method.totalValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            Avg Value:
                          </span>
                          <span className="font-medium flex items-center text-sm">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {formatCurrency(
                              method.totalOrders > 0
                                ? Math.round(
                                    method.totalValue / method.totalOrders
                                  )
                                : 0
                            )}
                          </span>
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
                  Overview of each branch's performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {data.branchStats.map((branch) => (
                    <div
                      key={branch._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm"
                    >
                      <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                        <div className="font-medium text-sm sm:text-base truncate">
                          {branch.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Total Orders: {branch.totalOrders}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-bold flex items-center text-sm sm:text-base">
                          <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5" />
                          {formatCurrency(branch.totalValue)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Avg Order Value:{" "}
                          {formatCurrency(
                            branch.totalOrders > 0
                              ? Math.round(
                                  branch.totalValue / branch.totalOrders
                                )
                              : 0
                          )}
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
