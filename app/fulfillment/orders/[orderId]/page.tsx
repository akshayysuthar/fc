"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, Clock, IndianRupee, AlertCircle, Undo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import OrderDetailHeader from "@/components/fulfillment/order-detail-header";
import OrderSummary from "@/components/fulfillment/order-summary";
import ItemCancelDialog from "@/components/fulfillment/item-cancel-dialog";

interface OrderDetail {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    address: {
      area: string;
      pinCode: string;
    };
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
    variantId: string;
    branch: { _id: string };
    status: string;
    unit?: string;
    isCancelled?: boolean;
    cancelReason?: string;
    product: {
      _id: string;
      name: string;
      image: string;
    };
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
  pickupLocations: Array<{
    branch: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

const itemStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  packing: "bg-orange-100 text-orange-800",
  packed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function FulfillmentOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");

  useEffect(() => {
    const storedBranchId = localStorage.getItem("branchId");
    if (!storedBranchId) {
      router.push("/fulfillment/login");
      return;
    }
    setBranchId(storedBranchId);
  }, [router]);

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

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    if (!branchId) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/items/${itemId}/packing-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            newStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update item status");

      const result = await response.json();

      // Refresh the order data
      await fetchOrderDetails();

      if (result.message) {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Failed to update item status:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const updateSelectedItemsStatus = async (newStatus: string) => {
    if (!branchId || selectedItems.size === 0) return;

    try {
      setLoading(true);

      // Update each selected item
      const updatePromises = Array.from(selectedItems).map((itemId) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/items/${itemId}/packing-status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              branchId,
              newStatus,
            }),
          }
        )
      );

      await Promise.all(updatePromises);

      // Clear selection
      setSelectedItems(new Set());

      // Refresh order data
      await fetchOrderDetails();
    } catch (error) {
      console.error("Failed to update items status:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!branchId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/branch/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Failed to update order status");

      // Refresh the order data
      await fetchOrderDetails();
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelItem = async (reason: string, notes?: string) => {
    if (!itemToCancel) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/cancel-item/${orderId}/${itemToCancel.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason,
            notes,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel item");

      // Close dialog and refresh data
      setCancelDialogOpen(false);
      setItemToCancel(null);
      await fetchOrderDetails();
    } catch (error) {
      console.error("Failed to cancel item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoCancelItem = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/undo-cancel-item/${orderId}/${itemId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to undo cancel item");

      // Refresh data
      await fetchOrderDetails();
    } catch (error) {
      console.error("Failed to undo cancel item:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (
      selectedItems.size ===
      myBranchItems.filter((item) => !item.isCancelled).length
    ) {
      // If all are selected, unselect all
      setSelectedItems(new Set());
    } else {
      // Otherwise, select all non-cancelled items
      setSelectedItems(
        new Set(
          myBranchItems
            .filter((item) => !item.isCancelled)
            .map((item) => item._id)
        )
      );
    }
  };

  const openCancelDialog = (itemId: string, itemName: string) => {
    setItemToCancel({ id: itemId, name: itemName });
    setCancelDialogOpen(true);
  };

  if (loading && !order) {
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

  // Filter items for current branch
  const myBranchItems = order?.items.filter((item) => order?.items || []);

  // Get branch-specific stats
  const myBranchStats = {
    total: myBranchItems.length,
    pending: myBranchItems.filter((item) => item.status === "pending").length,
    packing: myBranchItems.filter((item) => item.status === "packing").length,
    packed: myBranchItems.filter((item) => item.status === "packed").length,
  };

  const hasSelectedItems = selectedItems.size > 0;
  const allSelected =
    selectedItems.size ===
      myBranchItems.filter((item) => !item.isCancelled).length &&
    myBranchItems.filter((item) => !item.isCancelled).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderDetailHeader
        orderId={order.orderId}
        status={order.status}
        statusTimestamps={order.statusTimestamps}
      />

      <div className="p-3 sm:p-4 space-y-4">
        <OrderSummary
          order={order}
          onUpdateStatus={updateOrderStatus}
          loading={loading}
        />

        {/* My Branch Items */}
        {myBranchItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Branch Items ({myBranchItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Select All & Bulk Actions */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      id="select-all"
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {allSelected ? "Unselect All" : "Select All"}
                    </label>
                  </div>
                  <div className="text-sm">
                    {selectedItems.size > 0 && (
                      <span className="font-medium">
                        {selectedItems.size} items selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Update Controls */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={!hasSelectedItems}
                  >
                    <option value="pending">Pending</option>
                    <option value="packing">Packing</option>
                    <option value="packed">Packed</option>
                  </select>
                  <Button
                    onClick={() => updateSelectedItemsStatus(selectedStatus)}
                    disabled={!hasSelectedItems || loading}
                    className="w-full sm:w-auto"
                  >
                    Update Selected Items
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {myBranchItems.map((item) => {
                  const isUpdating = updatingItems.has(item._id);
                  const isSelected = selectedItems.has(item._id);
                  const isCancelled = item.isCancelled === true;

                  return (
                    <div
                      key={item._id}
                      className={`border rounded-lg p-3 ${
                        isCancelled
                          ? "bg-red-50 border-red-200"
                          : isSelected
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {!isCancelled && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleItemSelection(item._id)
                            }
                            className="h-5 w-5"
                            disabled={isCancelled}
                          />
                        )}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.count} {item.unit && `(${item.unit})`} •
                            MRP: <IndianRupee className="h-3 w-3 inline" />
                            {item.price}
                          </div>
                          {isCancelled && item.cancelReason && (
                            <div className="text-xs text-red-600 mt-1">
                              Cancelled: {item.cancelReason}
                            </div>
                          )}
                        </div>
                        <Badge
                          className={
                            itemStatusColors[
                              isCancelled
                                ? "cancelled"
                                : (item.status as keyof typeof itemStatusColors)
                            ]
                          }
                          variant="secondary"
                        >
                          {isCancelled ? "Cancelled" : item.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        {isCancelled ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleUndoCancelItem(item._id)}
                            disabled={isUpdating}
                          >
                            <Undo className="h-4 w-4 mr-1" />
                            Undo Cancel
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              openCancelDialog(item._id, item.name)
                            }
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Item Cancel Dialog */}
      <ItemCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancel={handleCancelItem}
        itemName={itemToCancel?.name || ""}
      />
    </div>
  );
}
