"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { Facebook, Globe, Instagram, Linkedin, Pencil, Twitter, MoreHorizontal, Trash2 } from 'lucide-react'
import { type Contact } from "../../types/contacts"
import { cn } from "../../lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { contactsService } from '../../lib/firebase/services';
import { EditContactDialog } from "./edit-contact-dialog";
import { Timestamp } from 'firebase/firestore';

interface ContactsTableProps {
  data: Contact[]
}

export function ContactsTable({ data }: ContactsTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showMassEditDialog, setShowMassEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fieldToEdit, setFieldToEdit] = useState<string>("")
  const [newFieldValue, setNewFieldValue] = useState<string>("")
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredData = data.filter(contact => {
    if (activeTab === "individual") return contact.type === "individual"
    if (activeTab === "business") return contact.type === "business"
    return true
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredData.map(contact => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  const handleSelectContact = (checked: boolean, contactId: string) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId])
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId))
    }
  }

  const handleMassEdit = async () => {
    if (!selectedContacts.length || !fieldToEdit || !newFieldValue) return;
    
    try {
      const updates: Partial<Contact> = {};
      if (fieldToEdit === 'city' || fieldToEdit === 'state') {
        updates.address = {
          [fieldToEdit]: newFieldValue
        };
      } else if (fieldToEdit === 'tags') {
        updates.tags = newFieldValue.split(',').map(tag => tag.trim());
      } else if (fieldToEdit === 'firstName' || fieldToEdit === 'lastName') {
        // Ensure these are only applied to individual contacts
        updates[fieldToEdit] = newFieldValue;
      } else if (fieldToEdit === 'businessName') {
        // Ensure this is only applied to business contacts
        updates[fieldToEdit] = newFieldValue;
      } else {
        const field = fieldToEdit as keyof Omit<Contact, 'type' | 'address' | 'tags' | 'firstName' | 'lastName' | 'businessName'>;
        
        // Check if the field is a Timestamp field
        if (field === 'dateAdded' || field === 'lastModified') {
          // Skip updating these fields directly
          console.warn(`Cannot directly modify ${field} field`);
        } else {
          updates[field] = newFieldValue;
        }
      }
      
      await contactsService.updateContacts(selectedContacts, updates);
      setShowMassEditDialog(false);
      setSelectedContacts([]);
      setFieldToEdit("");
      setNewFieldValue("");
    } catch (error) {
      console.error("Error updating contacts:", error);
      // TODO: Add error handling UI
    }
  }

  const handleDelete = async () => {
    if (!selectedContacts.length) return;
    
    try {
      await contactsService.deleteContacts(selectedContacts);
      setShowDeleteDialog(false);
      setSelectedContacts([]);
    } catch (error) {
      console.error("Error deleting contacts:", error);
      // TODO: Add error handling UI
    }
  }

  const editableFields = [
    { label: "Category", value: "category" },
    { label: "Segment", value: "segments" },
    { label: "Tags", value: "tags" },
    { label: "City", value: "city" },
    { label: "State", value: "state" },
  ]

  const formatFirestoreTimestamp = (timestamp?: Timestamp | null) => {
    if (!timestamp) return '-';
    return timestamp instanceof Timestamp 
      ? timestamp.toDate().toLocaleDateString() 
      : String(timestamp);
  };

  const TagList = ({ tags }: { tags?: string[] }) => {
    if (!tags || tags.length === 0) return <span>-</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-black dark:text-white"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/10">
            All Contacts
            <span className={cn(
              "ml-2 text-xs rounded-full px-2 py-0.5",
              "bg-muted-foreground/20",
              "data-[state=active]:bg-primary/20"
            )}>
              {data.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="individual" className="data-[state=active]:bg-primary/10">
            Individuals
            <span className={cn(
              "ml-2 text-xs rounded-full px-2 py-0.5",
              "bg-muted-foreground/20",
              "data-[state=active]:bg-primary/20"
            )}>
              {data.filter(c => c.type === "individual").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-primary/10">
            Businesses
            <span className={cn(
              "ml-2 text-xs rounded-full px-2 py-0.5",
              "bg-muted-foreground/20",
              "data-[state=active]:bg-primary/20"
            )}>
              {data.filter(c => c.type === "business").length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedContacts.length === filteredData.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(checked as boolean, contact.id)}
                      />
                    </TableCell>
                    <TableCell>{contact.type === 'individual' ? `${contact.firstName} ${contact.lastName}` : contact.businessName}</TableCell>
                    <TableCell>{contact.company || '-'}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {contact.socialMedia?.linkedin && <SocialIcon platform="linkedin" url={contact.socialMedia.linkedin} />}
                        {contact.socialMedia?.twitter && <SocialIcon platform="twitter" url={contact.socialMedia.twitter} />}
                        {contact.socialMedia?.facebook && <SocialIcon platform="facebook" url={contact.socialMedia.facebook} />}
                        {contact.socialMedia?.instagram && <SocialIcon platform="instagram" url={contact.socialMedia.instagram} />}
                        {contact.website && <SocialIcon platform="website" url={contact.website} />}
                      </div>
                    </TableCell>
                    <TableCell>{contact.category || '-'}</TableCell>
                    <TableCell>
                      <TagList tags={contact.tags || []} />
                    </TableCell>
                    <TableCell>{contact.address?.city || '-'}</TableCell>
                    <TableCell>{contact.address?.state || '-'}</TableCell>
                    <TableCell>{contact.dateAdded ? contact.dateAdded.toDate().toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingContact(contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {selectedContacts.length > 0 && (
        <div className="fixed bottom-8 right-8 flex items-center gap-2 bg-background p-4 rounded-lg shadow-lg border z-[60]">
          <span className="text-sm font-medium">{selectedContacts.length} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100]" style={{ backgroundColor: 'hsl(var(--background))', position: 'relative' }}>
              <DropdownMenuItem onClick={() => setShowMassEditDialog(true)}>
                Mass Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Mass Edit Dialog */}
      <Dialog open={showMassEditDialog} onOpenChange={setShowMassEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mass Edit Contacts</DialogTitle>
            <DialogDescription>
              Update the selected field for all {selectedContacts.length} selected contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Field to Edit</Label>
              <Select onValueChange={setFieldToEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {editableFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>New Value</Label>
              <Input value={newFieldValue} onChange={(e) => setNewFieldValue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMassEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMassEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contacts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContacts.length} contacts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add EditContactDialog */}
      {editingContact && (
        <EditContactDialog
          open={!!editingContact}
          onOpenChange={(open) => {
            if (!open) setEditingContact(null);
          }}
          contact={editingContact}
          onContactUpdated={() => {}}
        />
      )}
    </div>
  )
}

function ContactsList({ data }: { data: Contact[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><Checkbox /></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Social</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell><Checkbox /></TableCell>
              <TableCell>{contact.type === 'individual' ? `${contact.firstName} ${contact.lastName}` : contact.businessName}</TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone || '-'}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{contact.category}</TableCell>
              <TableCell>{Array.isArray(contact.tags) ? contact.tags.join(', ') : (contact.tags || '-')}</TableCell>
              <TableCell>{contact.address?.city || '-'}</TableCell>
              <TableCell>{contact.address?.state || '-'}</TableCell>
              <TableCell>{contact.dateAdded ? contact.dateAdded.toDate().toLocaleDateString() : '-'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  if (!url) return null;
  
  const icons = {
    linkedin: <Linkedin className="h-4 w-4" />,
    twitter: <Twitter className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    website: <Globe className="h-4 w-4" />
  };

  const getFullUrl = (platform: string, handle: string) => {
    const baseUrls: { [key: string]: string } = {
      linkedin: 'https://linkedin.com/in/',
      twitter: 'https://twitter.com/',
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      website: '' // For website, use the URL as is
    };

    // If it's a website, return the URL as is
    if (platform === 'website') return handle;

    // For social media platforms, combine base URL with handle
    const baseUrl = baseUrls[platform];
    // Remove @ if present at the start of the handle
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    return baseUrl + cleanHandle;
  };

  return (
    <a
      href={getFullUrl(platform, url)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary"
    >
      {icons[platform as keyof typeof icons]}
    </a>
  );
};
