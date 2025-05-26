"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Mock order data - replace with actual API call

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  type Order = {
    _id: string;
    status: string;
    items: {
      image: any;
      name: string;
      count: number;
      price: number;
      itemTotal: number;
    }[];
    totalPrice: number;
    customer: {
      name: string;
      phone: string;
      email: string;
    };
    branch: {
      name: string;
      address: string;
    };
    slot: {
      id: string;
      label: string;
      startTime: string;
      endTime: string;
      date: string;
    };

    createdAt: string;
    deliveryPartner?: {
      name: string;
      phone: string;
    };
  };

  const [order, setOrder] = useState<Order>({
    _id: "",
    status: "",
    items: [],
    totalPrice: 0,
    customer: { name: "", phone: "", email: "" },
    branch: { name: "", address: "" },
    slot: {
      id: "",
      label: "",
      startTime: "",
      endTime: "",
      date: "",
    },
    createdAt: "",
    deliveryPartner: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedBranchId = localStorage.getItem("fcBranchId");
    if (!storedBranchId) {
      router.push("/fc/login");
      return;
    }
    setBranchId(storedBranchId);
  }, []);

  useEffect(() => {
    if (orderId && branchId) {
      fetchOrderDetails();
    }
  }, [orderId, branchId]);

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

      const result = await response.json();
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [
          {
            label: "Start Processing",
            status: "processing",
            variant: "default" as const,
          },
        ];
      case "processing":
        return [
          {
            label: "Start Packing",
            status: "packing",
            variant: "default" as const,
          },
        ];
      case "packing":
        return [
          {
            label: "Mark as Packed",
            status: "packed",
            variant: "default" as const,
          },
        ];
      case "packed":
        return [
          {
            label: "Ready for Pickup",
            status: "ready",
            variant: "default" as const,
          },
        ];
      default:
        return [];
    }
  };

  const actions = getStatusActions(order.status);

  if (loading || !branchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/fc">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">Order ID: {order._id}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge
                    className={
                      statusColors[order.status as keyof typeof statusColors]
                    }
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant}
                      onClick={() => updateOrderStatus(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 w-full">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-gray-500">
                          <span>Quantity: {item.count}</span>
                          <span>Price: ₹{item.price}</span>
                        </div>
                      </div>
                      <div className="text-right font-medium w-full sm:w-auto">
                        ₹{item.itemTotal}
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between items-center font-medium text-lg">
                    <span>Total Amount</span>
                    <span>₹{order.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">{order.customer.name}</div>
                </div>
                {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{order.customer.email}</span>
                </div> */}
              </CardContent>
            </Card>

            {/* Branch Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Branch Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">{order.branch.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.branch.address}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Slot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delivery Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.slot ? (
                  <div className="font-medium">
                    {order.slot.label} ({order.slot.startTime} -{" "}
                    {order.slot.endTime})
                    <div className="text-sm text-gray-600 mt-1">
                      Date: {new Date(order.slot.date).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No slot selected</div>
                )}
                <div className="text-sm text-gray-600 mt-1">
                  Order placed: {new Date(order.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Partner */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner</CardTitle>
              </CardHeader>
              <CardContent>
                {order.deliveryPartner ? (
                  <div>
                    <div className="font-medium">
                      {order.deliveryPartner.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.deliveryPartner.phone}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Not assigned yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
