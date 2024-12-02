import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { SidebarNav } from "../components/layouts/sidebar-nav"
import { Button } from "../components/ui/button"
import { LogOut } from 'lucide-react'
import React from 'react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRM Project",
  description: "A modern CRM system built with Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <aside className="hidden w-64 border-r lg:block">
              <div className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">CRM Project</h1>
                </div>
                <SidebarNav />
                <Button variant="ghost" className="mt-auto w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </aside>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
