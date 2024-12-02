"use client"

import React, { useState } from "react"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { Settings } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "../../lib/utils"

interface Column {
  id: string
  label: string
  visible: boolean
}

interface SortableItemProps {
  column: Column
  onToggle: (id: string) => void
}

function SortableItem({ column, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border border-transparent p-2",
        isDragging && "border-primary bg-muted",
        !isDragging && "hover:bg-muted/50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-move items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <div className="flex flex-col gap-1">
          <div className="h-0.5 w-4 bg-current" />
          <div className="h-0.5 w-4 bg-current" />
        </div>
      </div>
      <Checkbox
        id={column.id}
        checked={column.visible}
        onCheckedChange={() => onToggle(column.id)}
      />
      <label
        htmlFor={column.id}
        className="flex-1 cursor-pointer text-sm font-medium"
      >
        {column.label}
      </label>
    </div>
  )
}

const defaultColumns: Column[] = [
  { id: "name", label: "Name", visible: true },
  { id: "company", label: "Company", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "socialLinks", label: "Social Links", visible: true },
  { id: "category", label: "Category", visible: true },
  { id: "tags", label: "Tags", visible: true },
  { id: "city", label: "City", visible: true },
  { id: "state", label: "State", visible: true },
  { id: "dateAdded", label: "Date Added", visible: true },
]

export function CustomizeViewDialog() {
  const [open, setOpen] = useState(false)
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [contactsPerPage, setContactsPerPage] = useState("20")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const toggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const handleSave = () => {
    // Here you would typically save the configuration to your backend
    // and update the parent component's state
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Customize view</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize View</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="contactsPerPage"
              className="text-sm font-medium leading-none"
            >
              Contacts per page
            </label>
            <Select
              value={contactsPerPage}
              onValueChange={setContactsPerPage}
            >
              <SelectTrigger id="contactsPerPage">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 contacts</SelectItem>
                <SelectItem value="20">20 contacts</SelectItem>
                <SelectItem value="50">50 contacts</SelectItem>
                <SelectItem value="100">100 contacts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Visible columns
            </label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {columns.map((column) => (
                    <SortableItem
                      key={column.id}
                      column={column}
                      onToggle={toggleColumn}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
