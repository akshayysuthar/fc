"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, User, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface OrderDetail {
  _id: string;
  orderId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  deliveryFee: number;
  handlingFee: number;
  savings: number;
  __v: number;
  slot: {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
    date: string;
  };
  payment: {
    method: string;
    status: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  customer: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    address: {
      location: {
        latitude: number;
        longitude: number;
      };
      houseNo: string;
      streetAddress: string;
      landmark: string;
      city: string;
      state: string;
      pinCode: string;
      country: string;
      isDefault: boolean;
    };
  };
  branch: {
    _id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pinCode: number;
    contactNumber: string;
    email: string;
    isActive: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    operationalHours: {
      open: string;
      close: string;
    };
    serviceRadiusKm: number;
    type: string;
    updatedAt: string;
  };
  items: Array<{
    _id: string;
    name: string;
    image: string;
    count: number;
    price: number;
    itemTotal: number;
    product: null | {
      _id: string;
      name: string;
      desc: string;
      image: string;
      additionalImages: string[];
      variants: Array<{
        mrp: number;
        price: number;
        quantity: string;
        stock: number;
        available: boolean;
        sku: string;
        _id: string;
      }>;
      tags: string[];
      category: string;
      branch: string;
      seller: string;
      slug: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
      subcategory: string;
    };
  }>;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
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

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [{ label: "Start Packing", status: "packing" }];
      case "packing":
        return [{ label: "Mark Packed", status: "packed" }];
      case "packed":
        return [{ label: "Ready", status: "ready" }];
      default:
        return [];
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
      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-600 text-sm">Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[
                  order.status as keyof typeof statusColors
                ]}`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Created: {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Updated: {new Date(order.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <div>
              <span className="font-semibold">Total:</span> ₹{order.totalPrice}
            </div>
            <div>
              <span className="font-semibold">Delivery Fee:</span> ₹
              {order.deliveryFee}
            </div>
            <div>
              <span className="font-semibold">Handling Fee:</span> ₹
              {order.handlingFee}
            </div>
            <div>
              <span className="font-semibold">Savings:</span> ₹{order.savings}
            </div>
          </div>
        </div>

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
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
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
              <div className="border-t pt-3 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="font-medium">
                {order.customer.name} ({order.customer.gender})
              </div>
              <div className="text-sm text-gray-600">
                Phone: {order.customer.phone}
              </div>
              <div className="text-sm text-gray-600">
                Email: {order.customer.email}
              </div>
              <div className="text-sm text-gray-600">
                Address: {order.customer.address.houseNo},{" "}
                {order.customer.address.streetAddress},{" "}
                {order.customer.address.landmark}, {order.customer.address.city},{" "}
                {order.customer.address.state}, {order.customer.address.pinCode},{" "}
                {order.customer.address.country}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Branch
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="font-medium">{order.branch.name}</div>
              <div className="text-sm text-gray-600">
                Address: {order.branch.address}, {order.branch.city},{" "}
                {order.branch.state}, {order.branch.pinCode}
              </div>
              <div className="text-sm text-gray-600">
                Contact: {order.branch.contactNumber}
              </div>
              <div className="text-sm text-gray-600">Email: {order.branch.email}</div>
              <div className="text-sm text-gray-600">Type: {order.branch.type}</div>
              <div className="text-sm text-gray-600">
                Active: {order.branch.isActive ? "Yes" : "No"}
              </div>
              <div className="text-sm text-gray-600">
                Service Radius: {order.branch.serviceRadiusKm} km
              </div>
              <div className="text-sm text-gray-600">
                Operational Hours: {order.branch.operationalHours.open} -{" "}
                {order.branch.operationalHours.close}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slot Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Label:</span> {order.slot.label}
              </div>
              <div>
                <span className="font-semibold">Start:</span> {order.slot.startTime}
              </div>
              <div>
                <span className="font-semibold">End:</span> {order.slot.endTime}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {order.slot.date}
              </div>
              <div>
                <span className="font-semibold">ID:</span> {order.slot.id}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Method:</span> {order.payment.method}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {order.payment.status}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Pickup Locations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Delivery Location:</span> Lat{" "}
                {order.deliveryLocation.latitude}, Lng{" "}
                {order.deliveryLocation.longitude}
              </div>
              <div>
                <span className="font-semibold">Pickup Location:</span>{" "}
                {order.pickupLocation.address} (Lat{" "}
                {order.pickupLocation.latitude}, Lng{" "}
                {order.pickupLocation.longitude})
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
