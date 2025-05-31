"use client"

import { useState } from "react"
import { CreditCard, QrCode, IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PaymentCollectionProps {
  totalPrice: number
  onCashPayment: (amount: number) => void
  onUPIPayment: () => void
  orderId: string
}

export default function PaymentCollection({
  totalPrice,
  onCashPayment,
  onUPIPayment,
  orderId,
}: PaymentCollectionProps) {
  const [cashReceived, setCashReceived] = useState("")
  const [showQR, setShowQR] = useState(false)

  const calculateChange = () => {
    const received = Number.parseFloat(cashReceived) || 0
    return received - totalPrice
  }

  const handleCashPayment = () => {
    const change = calculateChange()
    if (change >= 0) {
      onCashPayment(Number.parseFloat(cashReceived))
      setCashReceived("")
    }
  }

  const handleQRPayment = () => {
    onUPIPayment()
    setShowQR(false)
  }

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment:${orderId}:${totalPrice}`
  }

  const change = calculateChange()
  const isValidCashAmount = Number.parseFloat(cashReceived) >= totalPrice

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Collect Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
              <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
              {totalPrice}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cash
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Cash Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
                      {totalPrice}
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div>
                    <Label htmlFor="cashReceived">Cash Received</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="mt-1 text-lg"
                    />
                  </div>
                  {cashReceived && (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-xl font-bold flex items-center justify-center">
                        Change: <IndianRupee className="h-5 w-5 mx-1" />
                        {Math.abs(change).toFixed(2)}
                        {change < 0 && " (Insufficient)"}
                      </div>
                    </div>
                  )}
                  <Button onClick={handleCashPayment} disabled={!isValidCashAmount} className="w-full">
                    Complete Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  UPI
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>UPI Payment</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                  <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8" />
                    {totalPrice}
                  </div>
                  <img
                    src={generateQRCode() || "/placeholder.svg"}
                    alt="Payment QR Code"
                    className="mx-auto border rounded w-48 h-48"
                  />
                  <p className="text-sm text-gray-600">Ask customer to scan QR code</p>
                  <Button onClick={handleQRPayment} className="w-full">
                    Payment Received
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
