"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ContactsTable } from "../../components/contacts/contacts-table"
import { Settings, Search } from 'lucide-react'
import type { Contact } from "../../lib/firebase/types"
import { AddContactDialog } from "../../components/contacts/add-contact-dialog"
import { useAuth } from "../../contexts/auth-context"
import { contactsService } from "../../lib/firebase/services"

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    
    // Set up real-time listener
    const unsubscribe = contactsService.subscribeToContacts((updatedContacts) => {
      setContacts(updatedContacts)
      setLoading(false)
    }, user.uid)

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user?.uid])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading contacts...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to view contacts.</div>
  }

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Helper function to safely check if a string includes the search term
    const includes = (value: string | null | undefined) => 
      value?.toLowerCase().includes(searchLower) || false;
    
    // Common fields for both individual and business contacts
    const commonFieldsMatch = 
      includes(contact.email) ||
      includes(contact.phone) ||
      includes(contact.category) ||
      includes(contact.address?.city) ||
      includes(contact.address?.state) ||
      includes(contact.address?.street) ||
      includes(contact.address?.zipCode) ||
      includes(contact.website) ||
      (contact.tags && contact.tags.some(tag => includes(tag))) ||
      // Search in social media links
      includes(contact.socialMedia?.linkedin) ||
      includes(contact.socialMedia?.twitter) ||
      includes(contact.socialMedia?.facebook) ||
      includes(contact.socialMedia?.instagram);

    // Type-specific fields
    if (contact.type === 'individual') {
      return (
        commonFieldsMatch ||
        includes(contact.firstName) ||
        includes(contact.lastName) ||
        includes(contact.company) ||
        includes(`${contact.firstName} ${contact.lastName}`) // Search full name
      );
    } else {
      return (
        commonFieldsMatch ||
        includes(contact.businessName)
      );
    }
  })

  return (
    <div className="h-full flex-1 flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize your contacts efficiently
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <AddContactDialog />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          <Button variant="outline" size="sm" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <ContactsTable data={filteredContacts} />
    </div>
  )
}
