"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package2, User } from 'lucide-react'
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Contacts", href: "/contacts" },
  { name: "Segments", href: "/segments" },
  { name: "Lead Scraping", href: "/lead-scraping" },
  { name: "Subscription", href: "/subscription" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="hidden sm:inline-block">CRM XI</span>
        </Link>
        <div className="hidden md:flex ml-8 space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

