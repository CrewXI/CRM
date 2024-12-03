"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BusinessContact } from "@/lib/firebase/types"
import { useState, useEffect } from "react"
import { contactsService } from "@/lib/firebase/services"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CompanyComboboxProps {
  value?: string
  onSelect: (value: string, company: BusinessContact | null) => void
  onCreateNew?: (value: string) => void
}

export function CompanyCombobox({ value, onSelect, onCreateNew }: CompanyComboboxProps) {
  const [companies, setCompanies] = useState<BusinessContact[]>([])
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
        toast.error("Failed to load companies");
      }
    };

    fetchCompanies();
  }, [user?.uid]);

  const handleSelect = (currentValue: string) => {
    const selectedCompany = companies.find(company => company.businessName === currentValue)
    onSelect(currentValue, selectedCompany || null)
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew('New Company');
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select company..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.businessName}>
                {company.businessName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {onCreateNew && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleCreateNew}
          title="Add new company"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
