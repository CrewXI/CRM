"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BusinessContact } from "@/lib/firebase/types"
import { useState, useEffect } from "react"
import { contactsService } from "@/lib/firebase/services"
import { useAuth } from "@/contexts/auth-context"

interface CompanyComboboxProps {
  value?: string
  onSelect: (value: string, company: BusinessContact | null) => void
  onCreateNew?: (value: string) => void
}

export function CompanyCombobox({ value, onSelect, onCreateNew }: CompanyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<BusinessContact[]>([])
  const [inputValue, setInputValue] = useState(value || "")
  const { user } = useAuth()

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user?.uid) return;
      
      try {
        const businessContacts = await contactsService.getBusinessContacts(user.uid);
        setCompanies(businessContacts);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, [user?.uid]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {inputValue || "Select company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search company..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>
            {onCreateNew ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onCreateNew(inputValue)
                  setOpen(false)
                }}
              >
                Create "{inputValue}"
              </Button>
            ) : (
              "No company found."
            )}
          </CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.businessName}
                onSelect={() => {
                  setInputValue(company.businessName)
                  onSelect(company.businessName, company)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === company.businessName ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.businessName}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
