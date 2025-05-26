"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type OrderItem = {
  product: string;
  name: string;
  image: string;
  count: number;
  price: number;
  itemTotal: number;
  _id: string;
};

type Order = {
  orderId: ReactNode;
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address?: {
      location: "...";
      houseNo: "...";
      streetAddress: "...";
      landmark: "...";
      city: "...";
      state: "...";
      pinCode: "...";
      country: "...";
      isDefault: true;
    }; // optional fallback
  };
  items: OrderItem[];
  slot: {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
    date: string;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
  branch?: { address?: string }; // optional branch info
};

const statusColors = {
  ready: "bg-green-100 text-green-800",
  arriving: "bg-blue-100 text-blue-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryUserId");
    if (!storedUserId) {
      router.push("/delivery/login");
      return;
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    let filtered = availableOrders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customer.address &&
            formatAddress(order.customer.address)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [availableOrders, searchTerm]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/available`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setAvailableOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Failed to fetch available orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  console.log(availableOrders);

  const formatAddress = (address: any) => {
    if (!address) return "N/A";

    // customize this to your preferred format
    return `${address.houseNo}, ${address.streetAddress}, ${
      address.landmark ? address.landmark + ", " : ""
    }${address.city}, ${address.state} - ${address.pinCode}`;
  };

  const confirmOrder = async (orderId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to confirm order");

      // Move order from available to my orders
      const order = availableOrders.find((o) => o._id === orderId);
      if (order) {
        setAvailableOrders(availableOrders.filter((o) => o._id !== orderId));
        setMyOrders([...myOrders, { ...order, status: "arriving" }]);
      }
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      setMyOrders(
        myOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getDeliveryActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "arriving":
        return [
          {
            label: "Mark as Delivered",
            status: "delivered",
            variant: "default" as const,
          },
        ];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryUserId");
    router.push("/delivery/login");
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Delivery Partner Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              User ID: {userId} | Manage order pickups and deliveries
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Orders
              </CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {availableOrders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Active Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {myOrders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Deliveries
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
            </CardContent>
          </Card>
        </div>

        {/* My Active Orders */}
        {myOrders.length > 0 && (
          <Card className="mb-6 overflow-x-auto">
            <CardHeader>
              <CardTitle>My Active Orders</CardTitle>
              <CardDescription>
                Orders currently assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myOrders.map((order) => {
                    const actions = getDeliveryActions(order.status);
                    const isExpanded = expandedOrderIds.includes(order._id);

                    return (
                      <React.Fragment key={order._id}>
                        <TableRow>
                          <TableCell className="break-all max-w-[100px]">
                            <Link
                              href={`/delivery/orders/${order._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.orderId}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customer.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] break-words">
                            {formatAddress(order.customer.address)}
                          </TableCell>
                          <TableCell>{order.slot.label}</TableCell>
                          <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColors[
                                  order.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandOrder(order._id)}
                              aria-label={
                                isExpanded ? "Collapse items" : "Expand items"
                              }
                              className="flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              Items ({order.items.length})
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {actions.map((action, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={action.variant}
                                  onClick={() =>
                                    updateOrderStatus(order._id, action.status)
                                  }
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-gray-50 p-4">
                              <div className="flex flex-col space-y-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item._id}
                                    className="flex items-center gap-4"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-16 h-16 rounded object-cover border"
                                    />
                                    <div>
                                      <div className="font-medium">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Quantity: {item.count} &times; $
                                        {item.price.toFixed(2)}
                                      </div>
                                      <div className="text-sm font-semibold">
                                        Total: ${item.itemTotal.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Available Orders */}
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Available Orders</CardTitle>
            <CardDescription>
              Orders available for pickup or delivery
            </CardDescription>
            <div className="mt-4 flex items-center gap-2 max-w-xs">
              <Input
                placeholder="Search by customer, order ID, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={fetchAvailableOrders}
                disabled={loading}
                aria-label="Refresh orders"
              >
                <Search size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="break-all max-w-[100px]">
                        <Link
                          href={`/delivery/orders/${order._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {order.orderId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] break-words">
                        {formatAddress(order.customer.address)}
                      </TableCell>
                      <TableCell>{order.slot.label}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => confirmOrder(order._id)}
                        >
                          Confirm Pickup
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
