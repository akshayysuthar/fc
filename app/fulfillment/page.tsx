"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Clock } from "lucide-react";
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
  };
  status: string;
  createdAt: string;
  totalPrice: number;
  items: Array<{
    name: string;
    count: number;
    price: number;
  }>;
  slot: {
    label: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  statusTimestamps: {
    confirmedAt?: string;
    packedAt?: string;
  };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
};

export default function FulfillmentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState<string | null>(null);
  const router = useRouter();

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

  const calculateTimeTaken = (confirmedAt: string, packedAt?: string) => {
    if (!confirmedAt) return null;

    const startTime = new Date(confirmedAt);
    const endTime = packedAt ? new Date(packedAt) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const getTotalQty = (items: Array<{ count: number }>) => {
    return items.reduce((total, item) => total + item.count, 0);
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Fulfillment Center
              </h1>
              <p className="text-sm text-gray-600">Branch: {branchId}</p>
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
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
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

        {/* Orders */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders</div>
          ) : (
            orders.map((order) => (
              <Card
                key={order._id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          statusColors[
                            order.status as keyof typeof statusColors
                          ]
                        }
                        variant="secondary"
                      >
                        {order.status}
                      </Badge>
                      <span className="font-medium text-sm">
                        #{order.orderId}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${order.totalPrice}</div>
                      {order.statusTimestamps?.confirmedAt && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateTimeTaken(
                            order.statusTimestamps.confirmedAt,
                            order.statusTimestamps.packedAt
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="font-medium text-sm">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.customer.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Qty: {getTotalQty(order.items)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.slot.label}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(order.slot.date).toLocaleDateString()} •{" "}
                      {order.slot.startTime} - {order.slot.endTime}
                    </div>
                  </div>

                  <Button asChild className="w-full" size="sm">
                    <Link href={`/fulfillment/orders/${order._id}`}>
                      Process Order
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
