"use client"

import React from 'react'
import { Check } from 'lucide-react'
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-muted-foreground">Select the perfect plan for your business needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for trying out our services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Up to 100 contacts</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Basic lead scraping</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Email support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$49</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Up to 1,000 contacts</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Advanced lead scraping</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Priority support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade to Pro</Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For large organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Custom</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited contacts</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Custom integrations</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Contact Sales</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
