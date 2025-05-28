"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, QrCode, Phone } from "lucide-react";
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
  arriving: "bg-blue-100 text-blue-800",
  delivered: "bg-gray-100 text-gray-800",
};

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

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
      fetchOrderHistory();
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

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery/${orderId}/history`
      );
      if (!response.ok) throw new Error("Failed to fetch order history");
      const data = await response.json();
      setOrderHistory(data);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
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
    } catch (error) {
      console.error("Failed to update order status:", error);
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

  if (loading || !userId || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const change = calculateChange();
  const isValidCashAmount = Number.parseFloat(cashReceived) >= order.totalPrice;

  const fullAddress = order.customer?.address
    ? `${order.customer.address.houseNo}, ${order.customer.address.streetAddress}, ${order.customer.address.city}`
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/delivery">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Order #{order._id.slice(-6)}</h1>
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

        <div className="space-y-4">
          {/* Order History */}
          {orderHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  {orderHistory.map((h, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="font-semibold">{h.status}</span>
                      <span className="text-gray-500">{h.updatedBy || h.user || ''}</span>
                      <span className="text-xs text-gray-400">{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Customer Info - now first */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="font-medium">{order.customer.name}</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${order.customer.phone}`} className="text-blue-600">
                    {order.customer.phone}
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  {order.customer.address?.houseNo}, {order.customer.address?.streetAddress}, {order.customer.address?.landmark && `${order.customer.address.landmark}, `}{order.customer.address?.city}, {order.customer.address?.state} - {order.customer.address?.pinCode}
                </div>
                {order.customer.address?.location?.latitude && order.customer.address?.location?.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${order.customer.address.location.latitude},${order.customer.address.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    View on Map
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info - slot timing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="font-medium">{order.slot?.label || "No slot"}</div>
                <div className="text-sm text-gray-600">
                  {order.slot?.startTime && order.slot?.endTime && (
                    <span>
                      {order.slot.startTime} - {order.slot.endTime}
                    </span>
                  )}
                  {order.slot?.date && (
                    <span> on {new Date(order.slot.date).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Ordered: {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items with images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.count}</div>
                    </div>
                    <div className="font-bold">${(item.price * item.count).toFixed(2)}</div>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>${order.totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions - now last */}
          {order.status === "assigned" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
                          <div className="text-2xl font-bold">${order.totalPrice}</div>
                          <div className="text-sm text-gray-600">Total Amount</div>
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
                            className="mt-1"
                          />
                        </div>
                        {cashReceived && (
                          <div className="p-3 bg-gray-50 rounded text-center">
                            <div className="text-lg font-bold">
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
                        <div className="text-2xl font-bold">${order.totalPrice}</div>
                        <img
                          src={generateQRCode() || "/placeholder.svg"}
                          alt="Payment QR Code"
                          className="mx-auto border rounded"
                        />
                        <p className="text-sm text-gray-600">Ask customer to scan QR code</p>
                        <Button onClick={handleQRPayment} className="w-full">
                          Payment Received
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Delivery */}
          {order.status === "ready" && (
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={() => updateOrderStatus("arriving")}
                  className="w-full"
                >
                  Start Delivery
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
