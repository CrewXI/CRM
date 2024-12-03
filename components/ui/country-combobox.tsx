"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const countries = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Ireland", label: "Ireland" },
  { value: "South Africa", label: "South Africa" },
  { value: "Singapore", label: "Singapore" },
  { value: "India", label: "India" },
  { value: "Philippines", label: "Philippines" },
]

export interface CountryComboboxProps {
  value: string
  onValueChange: (value: string) => void
}

export function CountryCombobox({ value, onValueChange }: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const currentCountry = countries.find(
    country => country.value === value
  )

  const filteredCountries = countries.filter(country => 
    country.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentCountry ? currentCountry.label : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b px-3 py-2">
          <input
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="py-6 text-center text-sm">No country found.</div>
          ) : (
            filteredCountries.map((country) => (
              <div
                key={country.value}
                onClick={() => {
                  onValueChange(country.value)
                  setOpen(false)
                  setSearchQuery("")
                }}
                className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-900 hover:text-white"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.label}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
