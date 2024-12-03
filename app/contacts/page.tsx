"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ContactsTable } from "../../components/contacts/contacts-table"
import { Settings, Search } from 'lucide-react'
import type { Contact } from "../../types/contacts"
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
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.firstName?.toLowerCase().includes(searchLower) ||
      contact.lastName?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower)
    )
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
