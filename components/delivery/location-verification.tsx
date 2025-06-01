"use client"

import { useState } from "react"
import { MapPin, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LocationVerificationProps {
  onVerify: (isCorrect: boolean, actualLocation?: { latitude: number; longitude: number; notes?: string }) => void
}

export default function LocationVerification({ onVerify }: LocationVerificationProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")
  const [gettingLocation, setGettingLocation] = useState(false)
  const [actualLocation, setActualLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setActualLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setGettingLocation(false)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setGettingLocation(false)
    }
  }

  const handleSubmit = () => {
    if (isCorrect !== null) {
      onVerify(isCorrect, actualLocation ? { ...actualLocation, notes } : undefined)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">Was the delivery location correct as per the address provided?</div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={isCorrect === true ? "default" : "outline"}
              onClick={() => setIsCorrect(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Yes, Correct
            </Button>
            <Button
              variant={isCorrect === false ? "destructive" : "outline"}
              onClick={() => setIsCorrect(false)}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              No, Incorrect
            </Button>
          </div>

          {isCorrect === false && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the actual location or any issues..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button onClick={getCurrentLocation} disabled={gettingLocation} variant="outline" className="w-full">
                {gettingLocation ? "Getting Location..." : "Capture Current Location"}
              </Button>

              {actualLocation && (
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div>Captured Location:</div>
                  <div>Lat: {actualLocation.latitude.toFixed(6)}</div>
                  <div>Lng: {actualLocation.longitude.toFixed(6)}</div>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={isCorrect === null} className="w-full">
            Submit Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
