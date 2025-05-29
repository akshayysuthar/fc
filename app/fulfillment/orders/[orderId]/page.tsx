"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface OrderDetail {
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
    _id: string;
    name: string;
    image: string;
    count: number;
    price: number;
    itemTotal: number;
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

export default function FulfillmentOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const branchId = localStorage.getItem("branchId");
    if (!branchId) {
      router.push("/fulfillment/login");
      return;
    }
    fetchOrderDetails();
  }, [orderId, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}`
      );
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
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

      if (order) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const allItemsChecked = order
    ? checkedItems.size === order.items.length
    : false;

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [{ label: "Start Packing", status: "packing" }];
      case "packing":
        return [
          {
            label: "Mark as Packed",
            status: "packed",
            disabled: !allItemsChecked,
          },
        ];
      case "packed":
        return [{ label: "Ready for Pickup", status: "ready" }];
      default:
        return [];
    }
  };

  const calculateTimeTaken = (confirmedAt: string, packedAt?: string) => {
    if (!confirmedAt) return null;

    const startTime = new Date(confirmedAt);
    const endTime = packedAt ? new Date(packedAt) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Order not found</div>
      </div>
    );
  }

  const actions = getStatusActions(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/fulfillment">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Order #{order.orderId}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    statusColors[order.status as keyof typeof statusColors]
                  }
                  variant="secondary"
                >
                  {order.status}
                </Badge>
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
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Actions */}
        {actions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    className="flex-1"
                    onClick={() => updateOrderStatus(action.status)}
                    // disabled={action.}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              {order.status === "packing" && !allItemsChecked && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check all items to mark as packed
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Customer</div>
                <div className="font-medium">{order.customer.name}</div>
              </div>
              <div>
                <div className="text-gray-600">Phone</div>
                <div className="font-medium">{order.customer.phone}</div>
              </div>
              <div>
                <div className="text-gray-600">Slot</div>
                <div className="font-medium">{order.slot.label}</div>
              </div>
              <div>
                <div className="text-gray-600">Total</div>
                <div className="font-bold text-lg">${order.totalPrice}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items to Pack */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items to Pack ({checkedItems.size}/{order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={checkedItems.has(item._id)}
                    onCheckedChange={(checked) =>
                      handleItemCheck(item._id, checked as boolean)
                    }
                    className="flex-shrink-0"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.count} × ${item.price} = ${item.itemTotal}
                      </div>
                    </div>
                  </div>
                  {checkedItems.has(item._id) && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Slot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="font-medium">{order.slot.label}</div>
              <div className="text-sm text-gray-600">
                {new Date(order.slot.date).toLocaleDateString()} •{" "}
                {order.slot.startTime} - {order.slot.endTime}
              </div>
              <div className="text-sm text-gray-600">
                Order placed: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
