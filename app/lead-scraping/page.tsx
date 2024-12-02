"use client"

import React from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { MapPin } from "lucide-react"
import Link from "next/link"

export default function LeadScrapingPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Scraping Tools</CardTitle>
          <CardDescription>
            Choose a platform to start scraping leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/lead-scraping/google-maps">
              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <MapPin className="mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="mb-2">Google Maps</CardTitle>
                  <CardDescription className="text-center">
                    Search and collect leads from Google Maps businesses
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
