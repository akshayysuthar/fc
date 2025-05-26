"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useRouter } from "next/navigation";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: Clock,
  processing: Package,
  packing: Package,
  packed: CheckCircle,
  ready: CheckCircle,
  cancelled: AlertCircle,
};

type Order = {
  _id: string;
  customer: {
    name: string;
    phone: string;
  };
  items: {
    name: string;
    image: string;
    count: number;
    price: number;
    itemTotal: number;
  }[];
  slot: {
    label: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function FCDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchId, setBranchId] = useState<string | null>(null);

  const fetchPendingOrders = async () => {
    if (!branchId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${branchId}/pending`
      );

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const result = await response.json();
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setFilteredOrders(
        filteredOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    const storedBranchId = localStorage.getItem("fcBranchId");
    if (!storedBranchId) {
      router.push("/fc/login");
      return;
    }
    setBranchId(storedBranchId);
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchPendingOrders();
    }
  }, [branchId]);

  console.log(orders);

  type ButtonVariant =
    | "default"
    | "link"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;

  const getStatusActions = (
    currentStatus: string
  ): { label: string; status: string; variant: ButtonVariant }[] => {
    switch (currentStatus) {
      case "pending":
        return [
          {
            label: "Start Packing",
            status: "packing",
            variant: "default" as ButtonVariant,
          },
        ];
      case "packing":
        return [
          {
            label: "Mark as Packed",
            status: "packed",
            variant: "default" as ButtonVariant,
          },
        ];
      case "packed":
        return [
          {
            label: "Ready for Pickup",
            status: "ready",
            variant: "default" as ButtonVariant,
          },
        ];
      default:
        return [];
    }
  };

  const orderStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    packing: orders.filter((o) => o.status === "packing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("fcBranchId");
    router.push("/fc/login");
  };

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fulfillment Center Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Branch ID: {branchId} | Manage and process orders for delivery
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orderStats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {orderStats.processing}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Packing</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orderStats.packing}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orderStats.ready}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="packing">Packing</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Manage order processing and fulfillment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Delivery Slot</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon =
                    statusIcons[order.status as keyof typeof statusIcons];
                  const actions = getStatusActions(order.status);

                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/fc/orders/${order._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {order._id}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{order.customer.name}</div>
                        {/* <div className="text-sm text-muted-foreground">
                          {order.customer.phone}
                        </div> */}
                      </TableCell>

                      <TableCell>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            • {item.name} × {item.count}
                            {item.price === 0 && (
                              <span className="ml-1 text-green-600 font-semibold">
                                (Free)
                              </span>
                            )}
                          </div>
                        ))}
                      </TableCell>

                      <TableCell>
                        <div>{order.slot?.label || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.slot?.date}
                        </div>
                      </TableCell>

                      <TableCell>₹{order.totalPrice}</TableCell>

                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              order.status as keyof typeof statusColors
                            ]
                          }
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {order.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2">
                        {actions.map((action) => (
                          <Button
                            key={action.label}
                            variant={action.variant}
                            onClick={() =>
                              updateOrderStatus(order._id, action.status)
                            }
                          >
                            {action.label}
                          </Button>
                        ))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
