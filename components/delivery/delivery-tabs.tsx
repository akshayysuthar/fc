"use client"

import { Button } from "@/components/ui/button"

interface DeliveryTabsProps {
  selectedTab: "available" | "assigned" | "delivered"
  onTabChange: (tab: "available" | "assigned" | "delivered") => void
  counts: {
    available: number
    assigned: number
    delivered: number
  }
}

export default function DeliveryTabs({ selectedTab, onTabChange, counts }: DeliveryTabsProps) {
  const tabs = [
    { key: "available" as const, label: "Available", count: counts.available },
    { key: "assigned" as const, label: "Assigned", count: counts.assigned },
    { key: "delivered" as const, label: "Delivered", count: counts.delivered },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={selectedTab === tab.key ? "default" : "outline"}
          onClick={() => onTabChange(tab.key)}
          className="text-xs sm:text-sm"
        >
          {tab.label} ({tab.count})
        </Button>
      ))}
    </div>
  )
}
