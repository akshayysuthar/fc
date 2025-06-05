"use client"

import { Button } from "@/components/ui/button"

interface OrderTabsProps {
  selectedTab: "available" | "ready"
  onTabChange: (tab: "available" | "ready") => void
  counts: {
    available: number
    ready: number
  }
}

export default function OrderTabs({ selectedTab, onTabChange, counts }: OrderTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-center mb-4">
      <Button
        variant={selectedTab === "available" ? "default" : "outline"}
        onClick={() => onTabChange("available")}
        className="text-xs sm:text-sm"
      >
        Available Orders ({counts.available})
      </Button>
      <Button
        variant={selectedTab === "ready" ? "default" : "outline"}
        onClick={() => onTabChange("ready")}
        className="text-xs sm:text-sm"
      >
        Ready Orders ({counts.ready})
      </Button>
    </div>
  )
}
