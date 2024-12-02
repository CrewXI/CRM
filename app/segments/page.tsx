"use client"

import React from 'react';
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Filter, Pencil, Plus, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  segments: {
    id: string
    name: string
  }[]
}

const categories: Category[] = [
  {
    id: "1",
    name: "Leads",
    segments: [
      { id: "1", name: "Qualified Leads" },
      { id: "2", name: "test" },
    ],
  },
  {
    id: "2",
    name: "Lead Scraping",
    segments: [
      { id: "3", name: "Google Maps" },
      { id: "4", name: "Austin" },
      { id: "5", name: "Pflugerville" },
      { id: "6", name: "Dallas" },
      { id: "7", name: "Houston" },
    ],
  },
]

export default function SegmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Segments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Leads who have engaged in the last 30 days</p>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Filter className="mr-2 h-4 w-4" />
                <span>234 contacts</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
