"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Contact, IndividualContact, BusinessContact } from "@/lib/firebase/types"
import { contactsService } from "@/lib/firebase/services"
import { toast } from "sonner"
import { X } from "lucide-react"
import { ContactForm, formSchema } from "./contact-form"
import * as z from "zod"
import { auth } from "@/lib/firebase/config"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface EditContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact
  companies: BusinessContact[]
  onContactUpdated: () => void
}

export function EditContactDialog({
  open,
  onOpenChange,
  contact,
  companies,
  onContactUpdated,
}: EditContactDialogProps) {
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        toast.error('You must be logged in to update contacts');
        return;
      }

      type Updates = Partial<IndividualContact | BusinessContact>;
      const updates: Updates = {};

      // Common fields
      if (values.email !== contact.email) updates.email = values.email;
      if (values.phone !== contact.phone) updates.phone = values.phone;
      if (values.notes !== contact.notes) updates.notes = values.notes;
      if (values.website !== contact.website) updates.website = values.website;
      if (values.category !== contact.category) updates.category = values.category;
      
      if (contact.type === 'individual') {
        const individualContact = contact as IndividualContact;
        
        if (values.firstName && values.firstName !== individualContact.firstName) {
          (updates as Partial<IndividualContact>).firstName = values.firstName;
        }
        if (values.lastName && values.lastName !== individualContact.lastName) {
          (updates as Partial<IndividualContact>).lastName = values.lastName;
        }
        if (values.company && values.company !== individualContact.company) {
          (updates as Partial<IndividualContact>).company = values.company;
        }
        if (values.jobTitle && values.jobTitle !== individualContact.jobTitle) {
          (updates as Partial<IndividualContact>).jobTitle = values.jobTitle;
        }
        if (values.department && values.department !== individualContact.department) {
          (updates as Partial<IndividualContact>).department = values.department;
        }
      } else if (contact.type === 'business') {
        const businessContact = contact as BusinessContact;
        
        if (values.businessName && values.businessName !== businessContact.businessName) {
          (updates as Partial<BusinessContact>).businessName = values.businessName;
        }
        if (values.industry && values.industry !== businessContact.industry) {
          (updates as Partial<BusinessContact>).industry = values.industry;
        }
      }

      await contactsService.updateContact(contact.id!, updates, userId);
      toast.success("Contact updated successfully");
      onContactUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    }
  }

  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    if (!contact?.id || !user) return;
    
    setIsDeleting(true);
    try {
      await contactsService.deleteContact(contact.id, user.uid);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
            companies={companies}
            user={user}
            contactsService={contactsService}
            onSubmit={handleSubmit}
            onSuccess={() => onOpenChange(false)}
            submitLabel="Save changes"
            showContactType={false}
            onDelete={handleDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}