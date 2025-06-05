"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface ItemCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: (reason: string, notes?: string) => void
  itemName: string
}

export default function ItemCancelDialog({ open, onOpenChange, onCancel, itemName }: ItemCancelDialogProps) {
  const [reason, setReason] = useState<string>("out_of_stock")
  const [notes, setNotes] = useState<string>("")

  const handleCancel = () => {
    onCancel(reason, notes.trim() ? notes : undefined)
    setReason("out_of_stock")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Item: {itemName}</p>
            <p className="text-sm text-gray-600">Please select a reason for cancellation:</p>
          </div>

          <RadioGroup value={reason} onValueChange={setReason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="out_of_stock" id="out_of_stock" />
              <Label htmlFor="out_of_stock">Out of Stock</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="damaged" id="damaged" />
              <Label htmlFor="damaged">Damaged Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expired" id="expired" />
              <Label htmlFor="expired">Expired Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other Reason</Label>
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
