"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Calendar,
  Clock,
  Package,
  IndianRupee,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";

interface AdminDashboardData {
  orderCounts: {
    currentMonth: number;
    currentDay: number;
    previousMonth: number;
    previousDay: number;
  };
  onTimeStatus: {
    onTime: number;
    delayed: number;
    atRisk: number;
    total: number;
  };
  slotAnalysis: Array<{
    slotLabel: string;
    slotTime: string;
    totalOrders: number;
    pendingOrders: number;
    packingOrders: number;
    packedOrders: number;
    readyOrders: number;
    onTimePercentage: number;
  }>;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    slot: {
      label: string;
      date: string;
      startTime: string;
    };
    itemCount: number;
  }>;
  revenueData: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    averageOrderValue: number;
  };
  recentActions: Array<{
    _id: string;
    action: string;
    orderId: string;
    itemName?: string;
    performedBy: string;
    timestamp: string;
    details?: string;
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function FulfillmentAdminPage() {
  const [branchId, setBranchId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && branchId) {
      fetchDashboardData();
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, branchId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId.trim()) return;
    setIsLoggedIn(true);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fulfillment/admin/dashboard/${branchId}`
      );
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      packing: "bg-orange-100 text-orange-800",
      packed: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getOnTimeStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">FC Admin Dashboard</CardTitle>
            <CardDescription>
              Enter your branch ID to access admin dashboard
            </CardDescription>
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
                Access Dashboard
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/fulfillment">← Back to Fulfillment</a>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                FC Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Branch: {branchId}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                onClick={() => setIsLoggedIn(false)}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No data available</div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Order Count Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Today's Orders
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.orderCounts.currentDay}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.orderCounts.currentDay > data.orderCounts.previousDay
                      ? "+"
                      : ""}
                    {data.orderCounts.currentDay - data.orderCounts.previousDay}{" "}
                    from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    This Month
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold">
                    {data.orderCounts.currentMonth}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.orderCounts.currentMonth >
                    data.orderCounts.previousMonth
                      ? "+"
                      : ""}
                    {data.orderCounts.currentMonth -
                      data.orderCounts.previousMonth}{" "}
                    from last month
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
                    {data.onTimeStatus.total > 0
                      ? Math.round(
                          (data.onTimeStatus.onTime / data.onTimeStatus.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.onTimeStatus.onTime}/{data.onTimeStatus.total} orders
                    on time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Today's Revenue
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-2xl font-bold flex items-center">
                    <IndianRupee className="h-3 w-3 sm:h-5 sm:w-5" />
                    {data.revenueData.todayRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(data.revenueData.averageOrderValue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* On-Time Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    On-Time Performance
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Orders packed 1 hour before slot time
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                              value: data.onTimeStatus.onTime,
                              fill: "#00C49F",
                            },
                            {
                              name: "At Risk",
                              value: data.onTimeStatus.atRisk,
                              fill: "#FFBB28",
                            },
                            {
                              name: "Delayed",
                              value: data.onTimeStatus.delayed,
                              fill: "#FF8042",
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
                              value: data.onTimeStatus.onTime,
                              fill: "#00C49F",
                            },
                            {
                              name: "At Risk",
                              value: data.onTimeStatus.atRisk,
                              fill: "#FFBB28",
                            },
                            {
                              name: "Delayed",
                              value: data.onTimeStatus.delayed,
                              fill: "#FF8042",
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Orders by Slot
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Order distribution by time slots
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
                      <BarChart data={data.slotAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="slotTime" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="totalOrders" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Slot Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-lg">
                  Slot Performance Analysis
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Detailed breakdown by delivery time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Slot</TableHead>
                        <TableHead className="text-xs">Total</TableHead>
                        <TableHead className="text-xs">Pending</TableHead>
                        <TableHead className="text-xs">Packing</TableHead>
                        <TableHead className="text-xs">Packed</TableHead>
                        <TableHead className="text-xs">Ready</TableHead>
                        <TableHead className="text-xs">On-Time %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slotAnalysis.map((slot, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-xs">
                            <div>{slot.slotLabel}</div>
                            <div className="text-gray-500">{slot.slotTime}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {slot.totalOrders}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              {slot.pendingOrders}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              {slot.packingOrders}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800"
                            >
                              {slot.packedOrders}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {slot.readyOrders}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-xs font-bold ${getOnTimeStatusColor(
                              slot.onTimePercentage
                            )}`}
                          >
                            {slot.onTimePercentage}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Latest orders and revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentOrders.slice(0, 10).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm">
                            #{order.orderId}
                          </div>
                          <div className="text-xs text-gray-600">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.slot.label} • {order.itemCount} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs sm:text-sm flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {order.totalPrice}
                          </div>
                          <Badge
                            className={getStatusColor(order.status)}
                            variant="secondary"
                          >
                            {order.status}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {formatTime(order.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <div className="text-sm font-medium">Revenue Summary</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        Today: {formatCurrency(data.revenueData.todayRevenue)}
                      </div>
                      <div>
                        Month: {formatCurrency(data.revenueData.monthRevenue)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-lg">
                    Recent Actions
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Latest system activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentActions.slice(0, 10).map((action) => (
                      <div
                        key={action._id}
                        className="flex items-start gap-3 p-2 bg-gray-50 rounded"
                      >
                        <Activity className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium">
                            {action.action}
                          </div>
                          <div className="text-xs text-gray-600">
                            Order #{action.orderId}
                            {action.itemName && ` • ${action.itemName}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            by {action.performedBy} •{" "}
                            {formatTime(action.timestamp)}
                          </div>
                          {action.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {action.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
