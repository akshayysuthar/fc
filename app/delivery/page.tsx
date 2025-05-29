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
    address: {
      houseNo: string;
      streetAddress: string;
      city: string;
      state: string;
      pinCode: string;
    };
  };
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
  totalPrice: number;
  status: string;
  payment: {
    method: string;
    status: string;
  };
}

const statusColors = {
  ready: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  arriving: "bg-orange-100 text-orange-800",
  delivered: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "available" | "assigned" | "delivered"
  >("available");
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryPartnerId");
    if (!storedUserId) {
      router.push("/delivery/login");
      return;
    }
    setUserId(storedUserId);
  }, [router]);

  useEffect(() => {
    if (userId) fetchOrders(userId);
  }, [userId]);

  const fetchOrders = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/available`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      setAvailableOrders(data.available || []);
      setAssignedOrders(data.assigned || []);
      setDeliveredOrders(data.delivered || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) throw new Error("Failed to confirm order");

      // Move order from available to assigned
      const order = availableOrders.find((o) => o._id === orderId);
      if (order) {
        setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
        setAssignedOrders((prev) => [
          ...prev,
          { ...order, status: "assigned" },
        ]);
        setActiveTab("assigned"); // optionally switch to assigned tab
      }
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const formatAddress = (address: Order["customer"]["address"]) => {
    if (!address) return "N/A";
    return [
      address.houseNo,
      address.streetAddress,
      address.city,
      address.state,
      address.pinCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getTotalQty = (items: Array<{ count: number }>) =>
    items.reduce((total, item) => total + item.count, 0);

  const handleLogout = () => {
    localStorage.removeItem("deliveryPartnerId");
    router.push("/delivery/login");
  };
  const countOrdersBySlot = (orders: Order[]) => {
    const counts: { [slotLabel: string]: number } = {};
    orders.forEach((order) => {
      const label = order.slot?.label || "Unknown";
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  };

  const renderOrders = (orders: Order[], showConfirmBtn = false) => {
    if (loading)
      return <div className="text-center py-8 text-gray-500">Loading...</div>;
    if (orders.length === 0)
      return (
        <div className="text-center py-8 text-gray-500">No orders found</div>
      );

    return (
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">#{order.orderId}</span>
                <div className="text-right">
                  <div className="font-bold">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                  <Badge
                    className={
                      paymentStatusColors[
                        order.payment
                          ?.status as keyof typeof paymentStatusColors
                      ] ?? "bg-gray-100 text-gray-800"
                    }
                    variant="secondary"
                  >
                    {order.payment?.method ?? "N/A"} -{" "}
                    {order.payment?.status ?? "unknown"}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <div className="font-medium text-sm">
                  {order.customer?.name}
                </div>
                <div className="text-xs text-gray-600">
                  {order.customer?.phone}
                </div>
                <div className="text-xs text-gray-600">
                  {formatAddress(order.customer?.address)}
                </div>
              </div>
              <div className="mb-3 flex justify-between text-xs text-gray-600">
                <span>Qty: {getTotalQty(order.items)}</span>
                <span>{order.slot.label}</span>
              </div>
              {showConfirmBtn && (
                <Button
                  onClick={() => confirmOrder(order._id)}
                  className="w-full"
                  size="sm"
                >
                  Accept Order
                </Button>
              )}
              {!showConfirmBtn && (
                <Button asChild className="w-full" size="sm">
                  <Link href={`/delivery/orders/${order._id}`}>View Order</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4 max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Delivery Partner
            </h1>
            <p className="text-sm text-gray-600">Partner: {userId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => userId && fetchOrders(userId)}
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

      {/* Stats */}
      <div className="p-4 max-w-4xl mx-auto grid grid-cols-3 gap-3 mb-6">
        <Card
          className={`text-center cursor-pointer ${
            activeTab === "available" ? "border-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("available")}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {availableOrders.length}
            </div>
            <div className="text-xs text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card
          className={`text-center cursor-pointer ${
            activeTab === "assigned" ? "border-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("assigned")}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {assignedOrders.length}
            </div>
            <div className="text-xs text-gray-600">Assigned</div>
          </CardContent>
        </Card>
        <Card
          className={`text-center cursor-pointer ${
            activeTab === "delivered" ? "border-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("delivered")}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {deliveredOrders.length}
            </div>
            <div className="text-xs text-gray-600">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Slot count summary */}
      <div className="mb-4 max-w-4xl mx-auto p-4 bg-white rounded shadow-sm">
        <h2 className="font-semibold mb-2">Orders by Slot</h2>
        <ul className="text-sm text-gray-700">
          {Object.entries(
            activeTab === "available"
              ? countOrdersBySlot(availableOrders)
              : activeTab === "assigned"
              ? countOrdersBySlot(assignedOrders)
              : countOrdersBySlot(deliveredOrders)
          ).map(([slotLabel, count]) => (
            <li key={slotLabel}>
              <strong>{slotLabel}:</strong> {count}
            </li>
          ))}
        </ul>
      </div>

      {/* Orders List by tab */}
      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === "available" && renderOrders(availableOrders, true)}
        {activeTab === "assigned" && renderOrders(assignedOrders, false)}
        {activeTab === "delivered" && renderOrders(deliveredOrders, false)}
      </div>
    </div>
  );
}
