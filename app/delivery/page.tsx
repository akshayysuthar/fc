"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, IndianRupee } from "lucide-react";
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
    branch: {
      _id: string;
      name: string;
    };
    status?: string;
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
  pickupLocations: Array<{
    branch: {
      _id: string;
      name: string;
    };
    address: string;
    latitude: number;
    longitude: number;
  }>;
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
  const [selectedTab, setSelectedTab] = useState<
    "available" | "assigned" | "delivered"
  >("available");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryPartnerId");
    if (!storedUserId) {
      router.push("/delivery/login");
      return;
    }
    setUserId(storedUserId);
    fetchAvailableOrders(storedUserId);
  }, [router]);

  const fetchAvailableOrders = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/available?userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) throw new Error("Failed to confirm order");
      const order = availableOrders.find((o) => o._id === orderId);
      if (order) {
        setAvailableOrders(availableOrders.filter((o) => o._id !== orderId));
        setAssignedOrders([
          ...assignedOrders,
          { ...order, status: "assigned" },
        ]);
        setSelectedTab("assigned");
      }
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [address.houseNo, address.streetAddress, address.city].filter(
      Boolean
    );
    return parts.join(", ");
  };

  const getTotalQty = (items: Array<{ count: number }>) => {
    return items.reduce((total, item) => total + item.count, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryPartnerId");
    router.push("/delivery/login");
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order._id}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge
            className={statusColors[order.status as keyof typeof statusColors]}
            variant="secondary"
          >
            {order.status}
          </Badge>
          <h1 className="font-bold flex items-center">{order.orderId}</h1>
          <div className="font-bold flex items-center">
            <IndianRupee className="h-4 w-4" />
            {order.totalPrice}
          </div>
        </div>
        <div className="mb-3">
          <div className="font-medium text-sm">{order.customer.name}</div>
          <div className="text-xs text-gray-600">
            {formatAddress(order.customer?.address)}
          </div>
        </div>
        {/* Branch Status */}
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-600 mb-1">Branch Status:</div>
          <div className="space-y-1">
            {order.pickupLocations?.map((location: any, index: number) => {
              const branchItems = order.items.filter(
                (item: any) =>
                  item.branch === location.branch ||
                  item.branch._id === location.branch._id
              );

              if (branchItems.length === 0) return null;

              const packedItems = branchItems.filter(
                (item: any) => item.status === "packed"
              ).length;
              const totalItems = branchItems.length;

              return (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-600">Branch {index + 1}:</span>
                  <span
                    className={
                      packedItems === totalItems
                        ? "text-green-600"
                        : "text-orange-600"
                    }
                  >
                    {packedItems}/{totalItems} packed
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <Button asChild className="w-full" size="sm">
          <Link href={`/delivery/orders/${order._id}`}>View Order</Link>
        </Button>
      </CardContent>
    </Card>
  );

  const renderAvailableOrders = () =>
    availableOrders.length === 0 ? (
      <div className="text-center py-8 text-gray-500">No orders available</div>
    ) : (
      availableOrders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">#{order.orderId}</span>
              <div className="text-right">
                <div className="font-bold flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {order.totalPrice}
                </div>
                <Badge
                  className={
                    paymentStatusColors[
                      order.payment.status as keyof typeof paymentStatusColors
                    ]
                  }
                  variant="secondary"
                >
                  {order.payment.method}
                </Badge>
              </div>
            </div>
            <div className="mb-3">
              <div className="font-medium text-sm">{order.customer.name}</div>
              <div className="text-xs text-gray-600">
                {order.customer.phone}
              </div>
              <div className="text-xs text-gray-600">
                {formatAddress(order.customer.address)}
              </div>
            </div>
            <div className="mb-3 flex justify-between text-xs text-gray-600">
              <span>Qty: {getTotalQty(order.items)}</span>
              <span>{order.slot.label}</span>
            </div>
            <Button
              onClick={() => confirmOrder(order._id)}
              className="w-full"
              size="sm"
            >
              Accept Order
            </Button>
          </CardContent>
        </Card>
      ))
    );

  const tabData = {
    available: renderAvailableOrders(),
    assigned: assignedOrders.length ? (
      assignedOrders.map(renderOrderCard)
    ) : (
      <div className="text-center py-8 text-gray-500">No assigned orders</div>
    ),
    delivered: deliveredOrders.length ? (
      deliveredOrders.map(renderOrderCard)
    ) : (
      <div className="text-center py-8 text-gray-500">No delivered orders</div>
    ),
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Delivery Partner
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Partner: {userId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchAvailableOrders(userId)}
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

      {/* Tabs */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {(["available", "assigned", "delivered"] as const).map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? "default" : "outline"}
              onClick={() => setSelectedTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {tab === "available"
                ? availableOrders.length
                : tab === "assigned"
                ? assignedOrders.length
                : deliveredOrders.length}
              )
            </Button>
          ))}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            tabData[selectedTab]
          )}
        </div>
      </div>
    </div>
  );
}
