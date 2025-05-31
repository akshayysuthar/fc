"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import DateRangePicker from "./date-range-picker"
import Link from "next/link"

interface AnalyticsHeaderProps {
  title: string
  subtitle: string
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (range: { from: Date; to: Date }) => void
  onExport: () => void
  backLink?: string
}

export default function AnalyticsHeader({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  onExport,
  backLink = "/",
}: AnalyticsHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
            <Button onClick={onExport} className="flex items-center gap-2" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={backLink}>← Back</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
