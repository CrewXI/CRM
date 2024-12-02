"use client"

import React from 'react'
import { Card, CardContent } from "../components/ui/card"
import { Users, Filter, Mail, TrendingUp, UserPlus, Send } from 'lucide-react'
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/contacts">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="mr-4 h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Contacts</h2>
                <p className="text-sm text-muted-foreground">Manage your contacts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/segments">
          <Card>
            <CardContent className="flex items-center p-6">
              <Filter className="mr-4 h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Segments</h2>
                <p className="text-sm text-muted-foreground">Organize contacts into groups</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/lead-scraping/google-maps">
          <Card>
            <CardContent className="flex items-center p-6">
              <UserPlus className="mr-4 h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Lead Scraping</h2>
                <p className="text-sm text-muted-foreground">Find new leads</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
