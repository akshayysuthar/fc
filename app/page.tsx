import Link from "next/link";
import {
  Package,
  Truck,
  BarChart3,
  Search,
  Building2,
  Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order System
          </h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Fulfillment Center</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg">
                <Link href="/fulfillment/login">Login as FC Staff</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Delivery Partner</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/delivery/login">Login as Delivery Partner</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Admin Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href="/analytics/admin">Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Order Lookup</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/order-lookup">Search Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Branch </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/fulfillment/admin">Branch Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Seller Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/analytics/seller">Seller Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
