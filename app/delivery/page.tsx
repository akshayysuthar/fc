"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Order {
  orderId: string;
  _id: string;
  customer: {
    name: string;
    phone: string;
    address: any;
  };
  items: Array<{
    name: string;
    count: number;
    price: number;
    image?: string;
    itemTotal?: number;
  }>;
  slot: {
    label: string;
  };
  totalPrice: number;
  status: string;
}

const statusColors = {
  ready: "bg-green-100 text-green-800",
  arriving: "bg-blue-100 text-blue-800",
  delivered: "bg-gray-100 text-gray-800",
};

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryPartnerId");
    if (!storedUserId) {
      router.push("/delivery/login");
      return;
    }
    setUserId(storedUserId);
    fetchAvailableOrders();
  }, [router]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/available`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setAvailableOrders(data);
    } catch (error) {
      console.error("Failed to fetch available orders:", error);
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
        setMyOrders([...myOrders, { ...order, status: "arriving" }]);
      }
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    return `${address.houseNo}, ${address.streetAddress}, ${address.city}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryPartnerId");
    router.push("/delivery/login");
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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Delivery</h1>
            <p className="text-gray-600 text-sm">Partner: {userId}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAvailableOrders} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {availableOrders.length}
              </div>
              <div className="text-xs text-gray-600">Available</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {myOrders.length}
              </div>
              <div className="text-xs text-gray-600">My Orders</div>
            </CardContent>
          </Card>
        </div>

        {/* My Orders */}
        {myOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">My Orders</h2>
            <div className="space-y-3">
              {myOrders.map((order) => (
                <Card key={order._id}>
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
                        <div className="font-bold">₹{order.totalPrice}</div>
                        <div className="text-xs text-gray-500">
                          {order.slot.label}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="font-medium text-sm">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.customer.phone}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-1">Items:</div>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-1"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded border"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {item.count}x {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ₹{item.price} each
                          </span>
                          <span className="text-xs text-gray-500">
                            Total: ₹{item.itemTotal}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/delivery/orders/${order._id}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Orders */}
        <div>
          <h2 className="text-lg font-bold mb-3">Available Orders</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders available
              </div>
            ) : (
              availableOrders.map((order) => (
                <Card key={order.orderId}>
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
                        <div className="font-bold">₹{order.totalPrice}</div>
                        <div className="text-xs text-gray-500">
                          {order.slot.label}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="font-medium text-sm">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.customer.phone}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-1">Items:</div>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-1"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded border"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {item.count}x {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ₹{item.price} each
                          </span>
                          <span className="text-xs text-gray-500">
                            Total: ₹{item.itemTotal}
                          </span>
                        </div>
                      ))}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
