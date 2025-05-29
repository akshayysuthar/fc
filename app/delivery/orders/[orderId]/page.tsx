"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
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
  const [showItems, setShowItems] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
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
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    newStatus: string,
    paymentStatus?: string,
    paymentMethod?: string
  ) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            paymentStatus,
            paymentMethod,
            userId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const updatedOrder = await response.json();
      setOrder(updatedOrder.order);
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
      updateOrderStatus("delivered", "paid", "Cash");
      setCashReceived("");
      setShowPayment(false);
    }
  };

  const handleQRPayment = () => {
    updateOrderStatus("delivered", "paid", "Online");
    setShowQR(false);
    setShowPayment(false);
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment:${order?._id}:${order?.totalPrice}`;
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [
      address.houseNo,
      address.streetAddress,
      address.city,
      address.state,
      address.pinCode,
    ].filter(Boolean);
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

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPayment(false)}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold">Payment Summary</h1>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-4">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order #{order.orderId}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-bold text-xl">${order.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <Badge variant="secondary">{order.payment?.method}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <Badge
                    className={
                      paymentStatusColors[
                        order.payment?.status as keyof typeof paymentStatusColors
                      ]
                    }
                    variant="secondary"
                  >
                    {order.payment?.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Collect Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cash Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          ${order.totalPrice}
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
                          <div className="text-xl font-bold">
                            Change: ${Math.abs(change).toFixed(2)}
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>UPI Payment</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-4">
                      <div className="text-3xl font-bold">
                        ${order.totalPrice}
                      </div>
                      <img
                        src={generateQRCode() || "/placeholder.svg"}
                        alt="Payment QR Code"
                        className="mx-auto border rounded"
                      />
                      <p className="text-sm text-gray-600">
                        Ask customer? to scan QR code
                      </p>
                      <Button onClick={handleQRPayment} className="w-full">
                        Payment Received
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/delivery">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Order Summary</h1>
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

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* customer? Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-lg">{order.customer?.name}</div>
                <div className="text-sm text-gray-600">#{order.orderId}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${order.customer?.phone}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation?.latitude},${order.deliveryLocation?.longitude}`}
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
                  {formatAddress(order.customer?.address)}
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
                <span className="font-bold">${order.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <Badge
                  className={
                    paymentStatusColors[
                      order.payment?.status as keyof typeof paymentStatusColors
                    ]
                  }
                  variant="secondary"
                >
                  {order.payment?.method} - {order.payment?.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-4">
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
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.count} × ${item.price} = ${item.itemTotal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={cancelOrder} className="w-full">
            Cancel Order
          </Button>
          <Button onClick={() => setShowPayment(true)} className="w-full">
            Start Delivery
          </Button>
        </div>
      </div>
    </div>
  );
}
