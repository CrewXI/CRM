"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { X, Plus } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"
import { contactsService } from "../../lib/firebase/services"
import { toast } from "sonner"
import { Contact } from "@/lib/firebase/types"
import { ContactForm, formSchema } from "./contact-form"
import { z } from "zod"

interface AddContactDialogProps {
  activeTab?: string
}

export function AddContactDialog({ activeTab = "all" }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.uid) return
    
    try {
      await contactsService.addContact(values as Omit<Contact, 'id' | 'dateAdded' | 'lastModified'>, user.uid)
      setOpen(false)
      toast.success("Contact created successfully")
    } catch (error) {
      console.error("Error creating contact:", error)
      toast.error("Failed to create contact")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !p-0 gap-0">
        <div className="bg-background px-6 py-3 border-b z-50">
          <DialogHeader className="relative space-y-0 !space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg leading-none">Add New Contact</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        <div className="p-6">
          <ContactForm
            onSubmit={handleSubmit}
            submitLabel="Create Contact"
            showContactType={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}