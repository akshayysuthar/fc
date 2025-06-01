"use client";

import { IndianRupee, Phone, MapPin } from "lucide-react";
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
      area: string;
      city: string;
      state: string;
      pinCode: string;
    };
  };
  items: Array<{
    name: string;
    count: number;
    branch: {
      _id: string;
      name: string;
    };
    status?: string;
  }>;
  totalPrice: number;
  status: string;
  slot: {
    label: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };
  pickupLocations?: Array<{
    branch: {
      _id: string;
      name: string;
    };
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

interface AssignedOrderCardProps {
  order: Order;
}

const statusColors = {
  ready: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  arriving: "bg-orange-100 text-orange-800",
  delivered: "bg-gray-100 text-gray-800",
};

export default function AssignedOrderCard({ order }: AssignedOrderCardProps) {
  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [
      address.houseNo,
      address.streetAddress,
      ` Landmark :
      ${address.landmark}`,
      address.area,
      address.city,
      address.state,
      address.pinCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleCall = () => {
    window.open(`tel:${order.customer.phone}`, "_self");
  };

  const handleOpenMap = () => {
    if (order.deliveryLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`,
        "_blank"
      );
    }
  };

  return (
    <Card>
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
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{order.customer.name}</div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={handleCall}>
                <Phone className="h-3 w-3" />
              </Button>
              {order.deliveryLocation && (
                <Button size="sm" variant="outline" onClick={handleOpenMap}>
                  <MapPin className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          {/* <div className="text-xs text-gray-600">{order.customer.phone}</div> */}
          <div className="text-xs text-gray-600">
            {formatAddress(order.customer?.address)}
          </div>
        </div>

        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-600">Delivery Slot:</div>
          <div className="font-bold text-sm">
            {new Date(order.slot.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-600">
            {order.slot.startTime} - {order.slot.endTime} • {order.slot.label}
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
}
