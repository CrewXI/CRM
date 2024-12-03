"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Contact } from "@/lib/firebase/types"
import { updateContact, deleteContact } from "@/lib/firebase/services"
import { toast } from "sonner"
import { X } from "lucide-react"
import { ContactForm, formSchema } from "./contact-form"
import * as z from "zod"

interface EditContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact
  onContactUpdated: () => void
}

export function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onContactUpdated,
}: EditContactDialogProps) {
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateContact(contact.id!, values as Contact)
      toast.success("Contact updated successfully")
      onContactUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating contact:", error)
      toast.error("Failed to update contact")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(contact.id!)
        toast.success("Contact deleted successfully")
        onContactUpdated()
        onOpenChange(false)
      } catch (error) {
        console.error("Error deleting contact:", error)
        toast.error("Failed to delete contact")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !p-0 gap-0">
        <div className="bg-background px-6 py-3 border-b z-50">
          <DialogHeader className="relative space-y-0 !space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg leading-none">Edit Contact</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        <div className="p-6">
          <ContactForm
            initialData={contact}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            showContactType={false}
            onDelete={handleDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}