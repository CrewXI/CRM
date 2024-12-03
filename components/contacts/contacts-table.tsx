"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { EditContactDialog } from "./edit-contact-dialog"
import { Contact, IndividualContact, BusinessContact } from "@/lib/firebase/types"
import { contactsService } from '../../lib/firebase/services';
import { toast } from "sonner"
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe } from "react-icons/fa"
import { Facebook, Globe, Instagram, Linkedin, Pencil, Twitter, MoreHorizontal, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from "../../lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "../ui/select"
import { Timestamp } from 'firebase/firestore';
import { FIELDS, LABELS, TABLE_COLUMNS, TERMINOLOGY } from "@/lib/constants";

// Type guard functions for Contact types
function isIndividualContact(contact: Contact): contact is IndividualContact {
  return contact.type === 'individual';
}

function isBusinessContact(contact: Contact): contact is BusinessContact {
  return contact.type === 'business';
}

interface ContactsTableProps {
  data: Contact[]
}

export function ContactsTable({ data }: ContactsTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedField, setSelectedField] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const filteredData = data.filter(contact => {
    if (activeTab === "individual") return contact.type === "individual"
    if (activeTab === "business") return contact.type === "business"
    return true
  })

  const sortData = (data: Contact[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.type === 'individual' 
            ? `${a.firstName} ${a.lastName}` 
            : '';
          bValue = b.type === 'individual'
            ? `${b.firstName} ${b.lastName}`
            : '';
          break;
        case 'company':
          aValue = a.type === 'individual'
            ? (a.company || '')
            : (a.businessName || '');
          bValue = b.type === 'individual'
            ? (b.company || '')
            : (b.businessName || '');
          break;
        case TERMINOLOGY.GROUP:
          aValue = a[TERMINOLOGY.GROUP] || '';
          bValue = b[TERMINOLOGY.GROUP] || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'town':
          aValue = a.address?.city || '';
          bValue = b.address?.city || '';
          break;
        case 'state':
          aValue = a.address?.state || '';
          bValue = b.address?.state || '';
          break;
        case 'dateAdded':
          aValue = a.dateAdded ? a.dateAdded.toDate().getTime() : 0;
          bValue = b.dateAdded ? b.dateAdded.toDate().getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((currentConfig) => {
      if (!currentConfig || currentConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      if (currentConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const SortableHeader = ({ column, label }: { column: string, label: string }) => {
    const isActive = sortConfig?.key === column;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <TableHead>
        <Button
          variant="ghost"
          onClick={() => handleSort(column)}
          className="h-8 flex items-center gap-1 font-semibold"
        >
          {label}
          {direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : direction === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </Button>
      </TableHead>
    );
  };

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

  const handleMassEdit = () => {
    if (selectedField && selectedContacts.length > 0) {
      const dialog = document.createElement('dialog');
      dialog.innerHTML = `
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Edit ${selectedField}</h2>
          <div class="mb-4">
            <input type="text" id="massEditValue" class="w-full p-2 border rounded" />
          </div>
          <div class="flex justify-end gap-2">
            <button id="cancelMassEdit" class="px-4 py-2 border rounded">Cancel</button>
            <button id="confirmMassEdit" class="px-4 py-2 bg-primary text-white rounded">Save</button>
          </div>
        </div>
      `;

      dialog.querySelector('#cancelMassEdit')?.addEventListener('click', () => {
        dialog.close();
        document.body.removeChild(dialog);
      });

      dialog.querySelector('#confirmMassEdit')?.addEventListener('click', async () => {
        const value = (dialog.querySelector('#massEditValue') as HTMLInputElement)?.value;
        if (value) {
          try {
            const updates: any = {};
            if (selectedField.includes('.')) {
              const [parent, child] = selectedField.split('.');
              updates[parent] = { [child]: value };
            } else {
              updates[selectedField] = value;
            }
            
            await contactsService.updateContacts(selectedContacts, updates);
            toast.success(`Updated ${selectedField} for ${selectedContacts.length} contacts`);
          } catch (error) {
            console.error("Error updating contacts:", error);
            toast.error("Failed to update contacts");
          }
        }
        dialog.close();
        document.body.removeChild(dialog);
      });

      document.body.appendChild(dialog);
      dialog.showModal();
    }
  };

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
                  {activeTab === "individual" ? (
                    <SortableHeader column="name" label="Name" />
                  ) : activeTab === "business" ? (
                    <SortableHeader column="name" label="Name" />
                  ) : (
                    <SortableHeader column="name" label="Name" />
                  )}
                  <SortableHeader column="company" label="Company" />
                  <SortableHeader column="email" label="Email" />
                  <TableHead>Phone</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Tags</TableHead>
                  <SortableHeader column={TERMINOLOGY.GROUP} label={TERMINOLOGY.GROUP_LABEL} />
                  <SortableHeader column="town" label={LABELS[FIELDS.ADDRESS_TOWN]} />
                  <SortableHeader column="state" label={LABELS[FIELDS.ADDRESS_STATE]} />
                  <SortableHeader column="dateAdded" label="Date Added" />
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortData(filteredData).map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(checked as boolean, contact.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {contact.type === 'individual' 
                        ? `${contact.firstName} ${contact.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contact.type === 'individual' 
                        ? (contact.company || '-') 
                        : (contact.businessName || '-')}
                    </TableCell>
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
                    <TableCell>
                      <TagList tags={contact.tags || []} />
                    </TableCell>
                    <TableCell>{contact[TERMINOLOGY.GROUP] || '-'}</TableCell>
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
          <Select
            value={selectedField}
            onValueChange={setSelectedField}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select field to edit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="tags">Tags</SelectItem>
                <SelectItem value={TERMINOLOGY.GROUP}>{TERMINOLOGY.GROUP_LABEL}</SelectItem>
                <SelectItem value={`address.${FIELDS.ADDRESS_TOWN}`}>{LABELS[FIELDS.ADDRESS_TOWN]}</SelectItem>
                <SelectItem value={`address.${FIELDS.ADDRESS_STATE}`}>{LABELS[FIELDS.ADDRESS_STATE]}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            variant="default" 
            onClick={handleMassEdit}
            disabled={!selectedField}
          >
            Edit Selected
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Selected
          </Button>
        </div>
      )}

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

function ContactsList({ data, activeTab }: { data: Contact[], activeTab: string }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><Checkbox /></TableHead>
            <TableHead>
              {activeTab === 'business' ? TABLE_COLUMNS.BUSINESS.COMPANY : TABLE_COLUMNS.INDIVIDUAL.NAME}
            </TableHead>
            <TableHead>
              {activeTab === 'business' ? TABLE_COLUMNS.BUSINESS.INDUSTRY : TABLE_COLUMNS.INDIVIDUAL.COMPANY}
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Social</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>{TERMINOLOGY.GROUP_LABEL}</TableHead>
            <TableHead>{LABELS[FIELDS.ADDRESS_TOWN]}</TableHead>
            <TableHead>{LABELS[FIELDS.ADDRESS_STATE]}</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell><Checkbox /></TableCell>
              <TableCell>
                {contact.type === 'individual' 
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.businessName}
              </TableCell>
              <TableCell>
                {contact.type === 'individual' 
                  ? (contact.company || '-') 
                  : (contact.type === 'business' ? (contact.industry || '-') : '-')}
              </TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone || '-'}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{Array.isArray(contact.tags) ? contact.tags.join(', ') : (contact.tags || '-')}</TableCell>
              <TableCell>{contact[TERMINOLOGY.GROUP] || '-'}</TableCell>
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
