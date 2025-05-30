"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
  Navigation,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

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

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [showItems, setShowItems] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [showQR, setShowQR] = useState(false);

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
      if (newStatus === "delivered") {
        setOrder({
          ...order,
          status: newStatus,
          payment: { ...order.payment, status: "paid" },
        });
      } else if (newStatus === "arriving") {
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

  const calculateChange = () => {
    const received = Number.parseFloat(cashReceived) || 0;
    const total = order?.totalPrice || 0;
    return received - total;
  };

  const handleCashPayment = () => {
    const change = calculateChange();
    if (change >= 0) {
      updateOrderStatus("delivered");
      setCashReceived("");
    }
  };

  const handleQRPayment = () => {
    updateOrderStatus("delivered");
    setShowQR(false);
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment:${order?._id}:${order?.totalPrice}`;
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [address.area, address.pinCode].filter(Boolean);
    return parts.join(", ");
  };

  const getTotalQty = (items: Array<{ count: number }>) => {
    return items.reduce((total, item) => total + item.count, 0);
  };

  if (loading || !userId || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const change = calculateChange();
  const isValidCashAmount = Number.parseFloat(cashReceived) >= order.totalPrice;

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

        <div className="p-3 sm:p-4 space-y-4">
          {/* Order Info */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center mb-4">
                <div className="font-bold text-lg">Order #{order.orderId}</div>
                <div className="text-sm text-gray-600">
                  {order.customer.name}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatAddress(order.customer.address)}
                </div>
                <div className="text-sm text-gray-600">{order.slot.label}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Qty:</span>
                  <span>{getTotalQty(order.items)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {order.totalPrice}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items by Branch */}
          <div className="space-y-3">
            <h3 className="font-medium">Items by Branch</h3>
            {order.pickupLocations?.map((location: any, index: number) => {
              const branchItems = order.items.filter(
                (item: any) =>
                  item.branch === location.branch ||
                  item.branch._id === location.branch
              );

              if (branchItems.length === 0) return null;

              const branchStats = {
                total: branchItems.length,
                pending: branchItems.filter(
                  (item: any) => item.status === "pending"
                ).length,
                packing: branchItems.filter(
                  (item: any) => item.status === "packing"
                ).length,
                packed: branchItems.filter(
                  (item: any) => item.status === "packed"
                ).length,
              };

              return (
                <Card key={index}>
                  <CardContent className="p-3 sm:p-4">
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
                          <Navigation className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>

                    {/* Branch Status */}
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">
                        Branch Progress:
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-yellow-600">
                          Pending: {branchStats.pending}
                        </span>
                        <span className="text-orange-600">
                          Packing: {branchStats.packing}
                        </span>
                        <span className="text-green-600">
                          Packed: {branchStats.packed}
                        </span>
                      </div>
                    </div>

                    {/* Branch Items */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Items ({branchItems.length}):
                      </div>
                      {branchItems.map((item: any, itemIndex: number) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2 p-2 bg-white rounded border"
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
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={cancelOrder} className="w-full">
              Cancel Order
            </Button>
            <Button
              onClick={() => updateOrderStatus("arriving")}
              className="w-full"
            >
              Picked Up - Start Delivery
            </Button>
          </div>
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
        {/* Customer Info */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-base sm:text-lg">
                  {order.customer.name}
                </div>
                <div className="text-sm text-gray-600">#{order.orderId}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      order.deliveryLocation?.latitude || 0
                    },${order.deliveryLocation?.longitude || 0}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="text-right flex-1 ml-2">
                  {formatAddress(order.customer.address)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slot:</span>
                <span>{order.slot.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Qty:</span>
                <span>{getTotalQty(order.items)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-bold flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {order.totalPrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <Badge
                  className={
                    paymentStatusColors[
                      order.payment.status as keyof typeof paymentStatusColors
                    ]
                  }
                  variant="secondary"
                >
                  {order.payment.method} - {order.payment.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 h-auto"
              onClick={() => setShowItems(!showItems)}
            >
              <span className="font-medium">
                Order Items ({order.items.length})
              </span>
              {showItems ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showItems && (
              <div className="mt-4 space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.count} ×{" "}
                        <IndianRupee className="h-3 w-3 inline" />
                        {item.price} ={" "}
                        <IndianRupee className="h-3 w-3 inline" />
                        {item.itemTotal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        {order.status === "arriving" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Collect Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
                    {order.totalPrice}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Cash
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cash Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                            <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
                            {order.totalPrice}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Amount
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cashReceived">Cash Received</Label>
                          <Input
                            id="cashReceived"
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="mt-1 text-lg"
                          />
                        </div>
                        {cashReceived && (
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-xl font-bold flex items-center justify-center">
                              Change: <IndianRupee className="h-5 w-5 mx-1" />
                              {Math.abs(change).toFixed(2)}
                              {change < 0 && " (Insufficient)"}
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={handleCashPayment}
                          disabled={!isValidCashAmount}
                          className="w-full"
                        >
                          Complete Payment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showQR} onOpenChange={setShowQR}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        UPI
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>UPI Payment</DialogTitle>
                      </DialogHeader>
                      <div className="text-center space-y-4">
                        <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                          <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
                          {order.totalPrice}
                        </div>
                        <img
                          src={generateQRCode() || "/placeholder.svg"}
                          alt="Payment QR Code"
                          className="mx-auto border rounded w-48 h-48"
                        />
                        <p className="text-sm text-gray-600">
                          Ask customer to scan QR code
                        </p>
                        <Button onClick={handleQRPayment} className="w-full">
                          Payment Received
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
