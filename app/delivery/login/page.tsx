"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function DeliveryLogin() {
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryPartnerId.trim()) return

    setLoading(true)
    localStorage.setItem("deliveryPartnerId", deliveryPartnerId.trim())
    router.push("/delivery")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Delivery Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="deliveryPartnerId">Partner ID</Label>
              <Input
                id="deliveryPartnerId"
                type="text"
                placeholder="Enter partner ID"
                value={deliveryPartnerId}
                onChange={(e) => setDeliveryPartnerId(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
