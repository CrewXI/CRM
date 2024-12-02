"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { 
  Users, 
  Target, 
  MapPin, 
  CreditCard,
  Settings 
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const defaultItems = [
    {
      href: "/contacts",
      title: "Contacts",
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      href: "/segments",
      title: "Segments",
      icon: <Target className="mr-2 h-4 w-4" />
    },
    {
      href: "/lead-scraping/google-maps",
      title: "Lead Scraping",
      icon: <MapPin className="mr-2 h-4 w-4" />
    },
    {
      href: "/subscription",
      title: "Subscription",
      icon: <CreditCard className="mr-2 h-4 w-4" />
    },
    {
      href: "/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ]

  const navItems = items || defaultItems

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
