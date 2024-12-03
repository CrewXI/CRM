"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Contact, BusinessContact, IndividualContact } from "@/lib/firebase/types"
import { contactsService } from "@/lib/firebase/services"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { auth } from "@/lib/firebase/config"

interface BulkEditMenuProps {
  selectedContacts: string[]
  activeTab: string
  onClose: () => void
  companies: { id: string; name: string }[]
  onUpdate: () => void
}

export function BulkEditMenu({ selectedContacts, activeTab, onClose, companies, onUpdate }: BulkEditMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<string>('')
  const [editValue, setEditValue] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    if (!selectedField || !editValue) return

    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('You must be logged in to update contacts');
      return;
    }

    setIsUpdating(true)
    try {
      // Create the update object based on the selected field
      const updateData: Partial<Contact | BusinessContact> = {}
      
      switch (selectedField) {
        case 'tags':
          updateData.tags = editValue.split(',').map(tag => tag.trim())
          break
        case 'group':
          updateData[selectedField] = editValue
          break
        case 'city':
          // Get existing contact data to preserve state
          const cityUpdates = await Promise.all(
            selectedContacts.map(async (contactId) => {
              const contact = await contactsService.getContact(contactId, userId)
              if (!contact) {
                throw new Error(`Contact not found or permission denied: ${contactId}`)
              }
              return {
                contactId,
                address: {
                  ...contact.address,
                  city: editValue
                }
              }
            })
          )
          
          // Update each contact individually to preserve their existing state
          await Promise.all(
            cityUpdates.map(({ contactId, address }) =>
              contactsService.updateContact(contactId, { address }, userId)
            )
          )
          return // Return early since we've handled the update
        case 'state':
          // Get existing contact data to preserve city
          const stateUpdates = await Promise.all(
            selectedContacts.map(async (contactId) => {
              const contact = await contactsService.getContact(contactId, userId)
              if (!contact) {
                throw new Error(`Contact not found or permission denied: ${contactId}`)
              }
              return {
                contactId,
                address: {
                  ...contact.address,
                  state: editValue
                }
              }
            })
          )
          
          // Update each contact individually to preserve their existing city
          await Promise.all(
            stateUpdates.map(({ contactId, address }) =>
              contactsService.updateContact(contactId, { address }, userId)
            )
          )
          return // Return early since we've handled the update
        case 'company':
          // Only update company for individual contacts
          if (activeTab === 'individual') {
            // Find the company ID from the companies array
            const selectedCompany = companies.find(c => c.name === editValue);
            if (!selectedCompany) {
              throw new Error('Selected company not found');
            }
            (updateData as Partial<IndividualContact>).company = selectedCompany.id;
          }
          break
        case 'industry':
          // Only update industry for business contacts
          if (activeTab === 'business') {
            (updateData as Partial<BusinessContact>).industry = editValue
          }
          break
      }

      // Update all selected contacts for non-address fields
      await Promise.all(
        selectedContacts.map(contactId =>
          contactsService.updateContact(contactId, updateData, userId)
        )
      )

      toast.success(`Updated ${selectedContacts.length} contacts`)
      onUpdate()
      setIsOpen(false)
      onClose()
    } catch (error) {
      toast.error('Failed to update contacts')
      console.error('Error updating contacts:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const fields = [
    { value: 'tags', label: 'Tags' },
    { value: 'group', label: 'Group' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    ...(activeTab === 'individual' ? [{ value: 'company', label: 'Company' }] : []),
    ...(activeTab === 'business' ? [{ value: 'industry', label: 'Industry' }] : [])
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => {
                setIsOpen(false)
                onClose()
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <DialogTitle>Bulk Edit {selectedContacts.length} Contacts</DialogTitle>
            <DialogDescription>
              Choose a field to update for all selected contacts
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Field to Edit</Label>
              <Select
                value={selectedField}
                onValueChange={setSelectedField}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedField && (
              <div className="grid gap-2">
                <Label>New Value</Label>
                {selectedField === 'company' ? (
                  <Select
                    value={editValue}
                    onValueChange={setEditValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={selectedField === 'tags' ? 'tag1, tag2, tag3' : `Enter ${selectedField}`}
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!selectedField || !editValue || isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="default" className="rounded-full px-4 py-2">
            Edit {selectedContacts.length} Selected
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 text-foreground shadow-md">
            <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
              Bulk Edit Options
            </DropdownMenu.Label>
            <DropdownMenu.Separator className="my-1 h-px bg-muted" />
            {fields.map(field => (
              <DropdownMenu.Item
                key={field.value}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => {
                  setSelectedField(field.value)
                  setEditValue('')
                  setIsOpen(true)
                }}
              >
                Edit {field.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
