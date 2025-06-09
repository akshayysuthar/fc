"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import OrderDetailCustomerInfo from "@/components/delivery/order-detail-customer-info";
import OrderItemsList from "@/components/delivery/order-items-list";
import PaymentCollection from "@/components/delivery/payment-collection";
import LocationVerification from "@/components/delivery/location-verification";

const statusColors = {
  ready: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  arriving: "bg-orange-100 text-orange-800",
  delivered: "bg-gray-100 text-gray-800",
};

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "pickup" | "delivery" | "verification"
  >("pickup");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryPartnerId");
    if (!storedUserId) {
      router.push("/delivery/login");
      return;
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (orderId && userId) {
      fetchOrderDetails();
    }
  }, [orderId, userId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}`
      );
      const data = await response.json();
      setOrder(data);

      // Determine current step based on status
      if (data.status === "assigned") {
        setCurrentStep("pickup");
      } else if (data.status === "arriving") {
        setCurrentStep("delivery");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
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

      setOrder({ ...order, status: newStatus });
      if (newStatus === "arriving") {
        setCurrentStep("delivery");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const cancelOrder = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled", userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel order");

      router.push("/delivery");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const handleCashPayment = async (amount: number) => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "payment_collected",
            userId,
            paymentMethod: "cash",
            amount,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update payment status");
      setOrder({ ...order, status: "payment_collected" });
      setCurrentStep("verification");
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const handleUPIPayment = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "delivered",
            userId,
            paymentMethod: "upi",
            paymentStatus: "paid",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update payment status");
      setOrder({ ...order, status: "payment_collected" });
      setCurrentStep("verification");
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const handleLocationVerification = async (
    isCorrect: boolean,
    actualLocation?: { latitude: number; longitude: number; notes?: string }
  ) => {
    try {
      // Log location verification (you can add API call here later)
      console.log("Location verification:", { isCorrect, actualLocation });

      // Update order status to delivered
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "delivered", userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      // Navigate back to delivery dashboard
      router.push("/delivery");
    } catch (error) {
      console.error("Failed to complete delivery:", error);
    }
  };

  if (loading || !userId || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Pickup Step
  if (currentStep === "pickup" && order.status === "assigned") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/delivery">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-base sm:text-lg font-bold">Pickup Order</h1>
                <Badge
                  className={
                    statusColors[order.status as keyof typeof statusColors]
                  }
                  variant="secondary"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-4 pb-24">
          <OrderDetailCustomerInfo order={order} />

          {/* Items by Branch */}
          <div className="space-y-3">
            <h3 className="font-medium">Items by Branch</h3>
            {order.pickupLocations?.map((location: any, index: number) => {
              const branchItems = order.items.filter(
                (item: any) => item.branch._id === location.branch._id
              );

              return (
                <div key={index} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">Branch {index + 1}</div>
                      <div className="text-sm text-gray-600">
                        {location.address}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Navigate
                      </a>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Items ({branchItems.length}):
                    </div>
                    {branchItems.map((item: any, itemIndex: number) => (
                      <div
                        key={itemIndex}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.count}
                          </div>
                        </div>
                        <Badge
                          className={
                            item.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "packing"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }
                          variant="secondary"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="grid grid-cols-2 gap-4">
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                  Do you really want to cancel this order? This action cannot be
                  undone.
                </p>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    No, go back
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      cancelOrder();
                      setCancelDialogOpen(false);
                    }}
                  >
                    Yes, Cancel Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => updateOrderStatus("arriving")}
            >
              👉 Start Delivery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Location Verification Step
  if (currentStep === "verification") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/delivery">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-base sm:text-lg font-bold">
                  Complete Delivery
                </h1>
                <Badge
                  className="bg-green-100 text-green-800"
                  variant="secondary"
                >
                  Payment Collected
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-4">
          <OrderDetailCustomerInfo order={order} />
          <LocationVerification onVerify={handleLocationVerification} />
        </div>
      </div>
    );
  }

  // Delivery Step
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/delivery">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-bold">Delivery Order</h1>
              <Badge
                className={
                  statusColors[order.status as keyof typeof statusColors]
                }
                variant="secondary"
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        <OrderDetailCustomerInfo order={order} />
        <OrderItemsList items={order.items} />

        {/* Payment Section */}
        {order.status === "arriving" && (
          <PaymentCollection
            totalPrice={order.totalPrice}
            onCashPayment={handleCashPayment}
            onUPIPayment={handleUPIPayment}
            orderId={order._id}
          />
        )}
      </div>
    </div>
  );
}
