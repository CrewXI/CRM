"use client"

import React, { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ContactsTable } from "../../components/contacts/contacts-table"
import { Download, Upload } from 'lucide-react'
import type { Contact } from "../../types/contacts"
import { AddContactDialog } from "../../components/contacts/add-contact-dialog"
import { CustomizeViewDialog } from "../../components/contacts/customize-view-dialog"

// Sample data - replace with your actual data source
const sampleData: Contact[] = [
  {
    id: "1",
    name: "Russell McEacharn",
    email: "russell.mceacharn@gmail.com",
    phone: "5123482045",
    category: "Leads",
    tags: ["developer", "businessowner"],
    dateAdded: "12/01/24",
    type: "individual"
  },
  {
    id: "2",
    name: "Boko Media",
    category: "Lead Scraping",
    tags: ["videographers"],
    dateAdded: "12/01/24",
    website: "https://bokomedia.com",
    type: "business"
  },
]

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const individuals = sampleData.filter(contact => 
    contact.type === "individual" &&
    (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const businesses = sampleData.filter(contact => 
    contact.type === "business" &&
    (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">Contacts</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CustomizeViewDialog />
          <AddContactDialog />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      <div className="flex flex-1 justify-end gap-2">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="individuals" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="individuals" className="flex-1">Individuals</TabsTrigger>
          <TabsTrigger value="businesses" className="flex-1">Businesses</TabsTrigger>
        </TabsList>
        <TabsContent value="individuals" className="mt-4">
          <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800">
            <div className="overflow-x-auto">
              <ContactsTable data={individuals} type="individual" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="businesses" className="mt-4">
          <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800">
            <div className="overflow-x-auto">
              <ContactsTable data={businesses} type="business" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
