import React from "react"
import Link from "next/link"
import { Card, CardContent } from "../../components/ui/card"
import { type LucideIcon } from 'lucide-react'

interface ScraperCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

export function ScraperCard({ title, description, icon: Icon, href }: ScraperCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="rounded-lg bg-blue-50 p-2">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
