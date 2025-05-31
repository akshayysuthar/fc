"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BranchProgressProps {
  stats: {
    pending: number
    packing: number
    packed: number
    total: number
  }
}

export default function BranchProgress({ stats }: BranchProgressProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">My Branch Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{stats.packing}</div>
            <div className="text-xs text-gray-600">Packing</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{stats.packed}</div>
            <div className="text-xs text-gray-600">Packed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
