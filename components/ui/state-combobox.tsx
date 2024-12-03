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
import { states } from "@/lib/states"

interface StateComboboxProps {
  value?: string
  onChange: (value: string) => void
}

export function StateCombobox({ value, onChange }: StateComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const currentState = states.find(
    state => state.abbreviation === value
  )

  const filteredStates = states.filter(state => 
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
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
          {currentState ? `${currentState.name} (${currentState.abbreviation})` : "Select state..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b px-3 py-2">
          <input
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Search states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredStates.length === 0 ? (
            <div className="py-6 text-center text-sm">No state found.</div>
          ) : (
            filteredStates.map((state) => (
              <div
                key={state.abbreviation}
                onClick={() => {
                  onChange(state.abbreviation)
                  setOpen(false)
                  setSearchQuery("")
                }}
                className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-900 hover:text-white"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === state.abbreviation ? "opacity-100" : "opacity-0"
                  )}
                />
                {state.name} ({state.abbreviation})
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
