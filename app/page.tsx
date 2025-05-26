import Link from "next/link"
import { Package, Truck, Users, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Management System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your fulfillment center operations and delivery management with our comprehensive platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Fulfillment Center</CardTitle>
              <CardDescription>Manage order processing, packing, and preparation for delivery</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Process Orders</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Pack Items</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Ready for Pickup</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Track Status</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/fc/login">Login to FC Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Delivery Partner</CardTitle>
              <CardDescription>Pick up orders and manage delivery to customers</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Available Orders</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Confirm Pickup</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>En Route</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Delivered</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/delivery/login">Login to Delivery Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">Monitor order status and delivery progress in real-time</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Coordination</h3>
            <p className="text-gray-600">Seamless coordination between FC and delivery teams</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Efficient Processing</h3>
            <p className="text-gray-600">Streamlined workflow from order to delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
