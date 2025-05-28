"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  branch: {
    name: string;
    address: string;
  };
  status: string;
  createdAt: string;
  totalPrice: number;
  items: Array<{
    product: {
      name: string;
      price: number;
      image?: string; // Added image field
    };
    count: number;
  }>;
  slot:
    | string
    | {
        id: string;
        label: string;
        startTime: string;
        endTime: string;
        date: string;
      };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
};

export default function FulfillmentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState<string | null>(null);
  const router = useRouter();

  console.log(orders);

  useEffect(() => {
    const storedBranchId = localStorage.getItem("branchId");
    if (!storedBranchId) {
      router.push("/fulfillment/login");
      return;
    }
    setBranchId(storedBranchId);
    fetchOrders(storedBranchId);
  }, [router]);

  const fetchOrders = async (branchId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${branchId}/pending`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
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

      setOrders(
        orders.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [{ label: "Start Packing", status: "packing" }];
      case "packing":
        return [{ label: "Mark Packed", status: "packed" }];
      case "packed":
        return [{ label: "Ready", status: "ready" }];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("branchId");
    router.push("/fulfillment/login");
  };

  const orderStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    packing: orders.filter((o) => o.status === "packing").length,
    packed: orders.filter((o) => o.status === "packed").length,
    ready: orders.filter((o) => o.status === "ready").length,
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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Fulfillment</h1>
            <p className="text-gray-600 text-sm">Branch: {branchId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchOrders(branchId)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {orderStats.pending}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {orderStats.packing}
              </div>
              <div className="text-xs text-gray-600">Packing</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {orderStats.packed}
              </div>
              <div className="text-xs text-gray-600">Packed</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {orderStats.ready}
              </div>
              <div className="text-xs text-gray-600">Ready</div>
            </CardContent>
          </Card>
        </div>

        {/* Slot Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Orders by Slot</h2>
          <div className="flex flex-wrap gap-3">
            {Array.from(
              orders.reduce((acc, order) => {
                const label =
                  typeof order.slot === "string"
                    ? order.slot
                    : order.slot?.label || "Unassigned";
                acc.set(label, (acc.get(label) || 0) + 1);
                return acc;
              }, new Map<string, number>())
            ).map(([label, count]) => (
              <span
                key={label}
                className="px-3 py-1 rounded bg-gray-200 text-sm font-medium"
              >
                {label}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders</div>
          ) : (
            orders.map((order) => {
              const actions = getStatusActions(order.status);
              const totalQty = order.items.reduce(
                (sum, item) => sum + (item.count || 0),
                0
              );
              return (
                <Card key={order._id}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-semibold text-lg mb-1">
                        <Link href={`/fulfillment/orders/${order._id}`}>
                          Order #{order.orderId}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            statusColors[
                              order.status as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 border rounded p-1 bg-gray-50"
                          >
                            {/* Show product image if available */}
                            {item.product.image && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="text-xs">
                              <div>{item.product.name}</div>
                              <div className="text-gray-500">
                                Qty: {item.count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm font-semibold">
                        Total Qty: {totalQty}
                      </div>
                      {actions.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              onClick={() =>
                                updateOrderStatus(order._id, action.status)
                              }
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
