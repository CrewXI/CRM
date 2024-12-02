"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Globe, Pencil } from 'lucide-react'
import { type Contact } from "../../types/contacts"

interface ContactsTableProps {
  data: Contact[]
  type: "individual" | "business"
}

export function ContactsTable({ data, type }: ContactsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          {type === "individual" && (
            <TableHead className="hidden md:table-cell">Company</TableHead>
          )}
          <TableHead className="hidden sm:table-cell">Email</TableHead>
          <TableHead className="hidden lg:table-cell">Phone</TableHead>
          <TableHead className="hidden xl:table-cell">Social</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="hidden lg:table-cell">Tags</TableHead>
          <TableHead className="hidden xl:table-cell">City</TableHead>
          <TableHead className="hidden xl:table-cell">State</TableHead>
          <TableHead className="hidden sm:table-cell">Date Added</TableHead>
          <TableHead className="w-[50px]">Edit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell className="font-medium">{contact.name}</TableCell>
            {type === "individual" && (
              <TableCell className="hidden md:table-cell">{contact.company || "-"}</TableCell>
            )}
            <TableCell className="hidden sm:table-cell">{contact.email || "-"}</TableCell>
            <TableCell className="hidden lg:table-cell">{contact.phone || "-"}</TableCell>
            <TableCell className="hidden xl:table-cell">
              {contact.website && (
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell">{contact.category || "-"}</TableCell>
            <TableCell className="hidden lg:table-cell">
              {contact.tags?.map((tag) => (
                <span
                  key={tag}
                  className="mr-1 rounded-full bg-muted px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </TableCell>
            <TableCell className="hidden xl:table-cell">{contact.city || "-"}</TableCell>
            <TableCell className="hidden xl:table-cell">{contact.state || "-"}</TableCell>
            <TableCell className="hidden sm:table-cell">{contact.dateAdded}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
