import Link from "next/link";
import { Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order System
          </h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}
