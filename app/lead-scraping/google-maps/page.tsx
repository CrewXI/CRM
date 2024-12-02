"use client"

import React from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"

export default function GoogleMapsScraperPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lead Scraping</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Search for Leads</CardTitle>
          <CardDescription>
            Search for business leads by location and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  placeholder="e.g. videographers"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Austin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g. Texas"
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full sm:w-auto">
              Search Leads
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
