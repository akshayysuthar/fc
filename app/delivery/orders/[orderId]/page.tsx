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
  CreditCard,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  cancelled: "bg-red-100 text-red-800",
};

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // or "success", "failed"
  const [paymentMethod, setPaymentMethod] = useState("COD"); // or "online"
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("deliveryUserId");
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
      setPaymentMethod("");
      setCashReceived("");
    }
  };

  const handleQRPayment = () => {
    updateOrderStatus("delivered");
    setShowQR(false);
    setPaymentMethod("");
  };

  const generateQRCode = () => {
    // In a real app, you'd generate a proper QR code for payment
    // This is a placeholder QR code
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
    ? [
        order.customer.address.houseNo,
        order.customer.address.streetAddress,
        order.customer.address.landmark,
        order.customer.address.city,
        order.customer.address.state,
        `- ${order.customer.address.pinCode}`,
      ]
        .filter(Boolean)
        .join(", ")
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/delivery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Delivery Order Details
            </h1>
            <p className="text-gray-600 mt-1">Order ID: {order._id}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Status & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Payment */}
            {/* Order Status & Payment */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status & Payment</CardTitle>
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
                <div className="space-y-4">
                  {order.status === "assigned" && (
                    <div className="flex gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setPaymentMethod("cash")}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Cash Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cash Payment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Order Total</Label>
                              <div className="text-2xl font-bold text-green-600">
                                ${order.totalPrice.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="cashReceived">
                                Cash Received
                              </Label>
                              <Input
                                id="cashReceived"
                                type="number"
                                step="0.01"
                                placeholder="Enter amount received"
                                value={cashReceived}
                                onChange={(e) =>
                                  setCashReceived(e.target.value)
                                }
                              />
                            </div>
                            {cashReceived && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span>Cash Received:</span>
                                  <span className="font-medium">
                                    $
                                    {Number.parseFloat(cashReceived).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <span>Order Total:</span>
                                  <span className="font-medium">
                                    ${order.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    Change to Return:
                                  </span>
                                  <span
                                    className={`font-bold text-lg ${
                                      change >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    ${Math.abs(change).toFixed(2)}
                                    {change < 0 && " (Insufficient)"}
                                  </span>
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={handleCashPayment}
                              disabled={!isValidCashAmount}
                              className="w-full"
                            >
                              Complete Cash Payment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showQR} onOpenChange={setShowQR}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setShowQR(true)}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code Payment</DialogTitle>
                          </DialogHeader>
                          <div className="text-center space-y-4">
                            <div>
                              <div className="text-lg font-medium">
                                Amount to Pay
                              </div>
                              <div className="text-3xl font-bold text-green-600">
                                ${order.totalPrice.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <img
                                src={generateQRCode() || "/placeholder.svg"}
                                alt="Payment QR Code"
                                className="border rounded-lg"
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              Ask customer to scan this QR code to complete
                              payment
                            </p>
                            <Button
                              onClick={handleQRPayment}
                              className="w-full"
                            >
                              Confirm Payment Received
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {order.status === "ready" && (
                    <Button onClick={() => updateOrderStatus("arriving")}>
                      Start Delivery
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items to Deliver
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Quantity: {item.quantity}</span>
                          <span>Price: ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        ${(item.price * item.count).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-medium text-lg">
                    <span>Total Amount</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Location Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-medium">{order.customer.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="hover:text-blue-600"
                  >
                    {order.customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{order.customer.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.customer.address.location.latitude},${order.customer.address.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  Map
                </a>
                <h4>{fullAddress}</h4>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.pickupLocation.latitude},${order.pickupLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  <div className="font-medium">{order.branch.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.branch.address}
                  </div>
                </a>
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
                <div>{order.slot?.label || "No slot selected"}</div>

                <div>
                  {order.slot
                    ? `${order.slot.label} (${order.slot.startTime} - ${order.slot.endTime} on ${order.slot.date})`
                    : "No slot selected"}
                </div>
              </CardContent>
            </Card>
            {/* Customer Support Info */}
            <div className="container mx-auto px-4 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-700">
                    If there's a problem with this order, please reach out to
                    customer support.
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      <strong>Phone:</strong>{" "}
                      {order.config?.supportPhone || "Not Available"}
                    </div>
                    <div>
                      <strong>Email:</strong>{" "}
                      {order.config?.supportEmail || "Not Available"}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Submit Support Issue
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit a Support Issue</DialogTitle>
                      </DialogHeader>
                      <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const storedUserId =
                            localStorage.getItem("deliveryUserId");

                          const formData = new FormData(e.currentTarget);
                          const message = formData.get("message") as string;
                          const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/support`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                user: storedUserId,
                                order: order._id,
                                message,
                              }),
                            }
                          );
                          if (res.ok) {
                            alert("Support request submitted successfully!");
                          } else {
                            alert("Failed to submit support request.");
                          }
                        }}
                      >
                        <div>
                          <Label htmlFor="message">Describe the issue</Label>
                          <textarea
                            name="message"
                            rows={4}
                            required
                            className="w-full mt-1 p-2 border rounded-md text-sm"
                            placeholder="Enter the issue or concern..."
                          ></textarea>
                        </div>
                        <Button type="submit" className="w-full">
                          Submit
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
