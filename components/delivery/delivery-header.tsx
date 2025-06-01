"use client";

import { LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryHeaderProps {
  userId: string;
  onRefresh: () => void;
  onLogout: () => void;
  deliveredCount?: number;
}

export default function DeliveryHeader({
  userId,
  onRefresh,
  deliveredCount,
  onLogout,
}: DeliveryHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="p-3 sm:p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            Delivery Partner
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Partner: {userId}</p>
          {deliveredCount !== undefined && (
            <p className="text-sm text-gray-500">
              Orders Delivered:{" "}
              <span className="font-medium">{deliveredCount}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
