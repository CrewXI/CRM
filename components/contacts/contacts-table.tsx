"use client"

import { Timestamp } from "firebase/firestore"
import React, { useState, useEffect } from "react"
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
import { FIELDS, LABELS, TABLE_COLUMNS, TERMINOLOGY } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { BulkEditMenu } from './bulk-edit-menu';
import { User } from 'firebase/auth';

// Type guard functions for Contact types
function isIndividualContact(contact: Contact): contact is IndividualContact {
  return contact.type === 'individual';
}

function isBusinessContact(contact: Contact): contact is BusinessContact {
  return contact.type === 'business';
}

interface CompanyOption {
  id: string;
  name: string;
  type: 'business';
  industry?: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  companies: CompanyOption[];
  onSelectionChange?: (selectedContacts: Contact[]) => void;
}

export function ContactsTable({ contacts, companies, onSelectionChange }: ContactsTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const { user } = useAuth()

  const individualCount = contacts.filter(contact => contact.type === 'individual').length
  const businessCount = contacts.filter(contact => contact.type === 'business').length
  const totalCount = contacts.length

  const handleDelete = async () => {
    if (!contactToDelete || !user) return;
    
    try {
      await contactsService.deleteContact(contactToDelete.id!, user.uid);
      setContactToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Contacts ({totalCount})</TabsTrigger>
            <TabsTrigger value="individual">Individuals ({individualCount})</TabsTrigger>
            <TabsTrigger value="business">Companies ({businessCount})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0">
          <ContactsList 
            data={contacts} 
            companies={companies}
            activeTab={activeTab} 
          />
        </TabsContent>

        <TabsContent value="individual" className="m-0">
          <ContactsList 
            data={contacts.filter(contact => contact.type === 'individual')} 
            companies={companies}
            activeTab={activeTab} 
          />
        </TabsContent>

        <TabsContent value="business" className="m-0">
          <ContactsList 
            data={contacts.filter(contact => contact.type === 'business')} 
            companies={companies}
            activeTab={activeTab} 
          />
        </TabsContent>
      </Tabs>

      {editingContact && (
        <EditContactDialog
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          contact={editingContact}
          companies={companies.map(company => ({
            id: company.id,
            type: 'business' as const,
            businessName: company.name,
            industry: company.industry || '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            userId: user?.uid || '',
            email: '', // Add a default empty email
            dateAdded: new Date(), // Add current date
            createdBy: user?.uid || '' // Add current user's ID
          }))}
          onContactUpdated={() => {
            // Refresh contacts after update
            if (user) {
              contactsService.getContacts(user.uid).then(updatedContacts => {
                // Update contacts state
              });
            }
          }}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ContactsListProps {
  data: Contact[];
  companies: CompanyOption[];
  activeTab: string;
}

const ContactsList = ({ data, companies, activeTab }: ContactsListProps) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { user } = useAuth();
  
  // Transform companies into BusinessContact format
  const businessContacts = companies.map(company => ({
    id: company.id,
    type: 'business' as const,
    businessName: company.name,
    industry: company.industry || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    userId: user?.uid || '',
    email: '', // Add a default empty email
    dateAdded: new Date(), // Add current date
    createdBy: user?.uid || '' // Add current user's ID
  }));

  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      await Promise.all(
        selectedContacts.map(contactId => 
          contactsService.deleteContact(contactId, user.uid)
        )
      );
      setSelectedContacts([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting contacts:', error);
    }
  };

  const handleBulkEdit = () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    setBulkEditOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedContacts(checked ? data.filter(contact => contact.id !== undefined).map(contact => contact.id!) : []);
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    setSelectedContacts(prev => 
      checked 
        ? [...prev, contactId]
        : prev.filter(id => id !== contactId)
    );
  };

  const handleBulkEditComplete = () => {
    setSelectedContacts([]);
  };

  return (
    <div className="rounded-md border relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedContacts.length === data.length}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
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
          {data
            .filter(contact => contact && typeof contact === 'object' && contact.id !== undefined)
            .map((contact) => (
            <TableRow key={contact.id!} className="group">
              <TableCell>
                <Checkbox 
                  checked={selectedContacts.includes(contact.id!)}
                  onCheckedChange={(checked) => handleSelectContact(contact.id!, !!checked)}
                />
              </TableCell>
              <TableCell>
                {contact.type === 'individual' && isIndividualContact(contact)
                  ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '-'
                  : contact.type === 'business' && isBusinessContact(contact)
                  ? contact.businessName || '-'
                  : '-'}
              </TableCell>
              <TableCell>
                {contact.type === 'individual' ? (
                  companies.find(c => c.id === contact.company)?.name || contact.company || '-'
                ) : (
                  contact.businessName || '-'
                )}
              </TableCell>
              <TableCell>{contact.type === 'business' ? contact.industry || '-' : '-'}</TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {contact.socialMedia?.linkedin && (
                    <SocialIcon platform="linkedin" url={contact.socialMedia.linkedin} />
                  )}
                  {contact.socialMedia?.twitter && (
                    <SocialIcon platform="twitter" url={contact.socialMedia.twitter} />
                  )}
                  {contact.socialMedia?.facebook && (
                    <SocialIcon platform="facebook" url={contact.socialMedia.facebook} />
                  )}
                  {contact.socialMedia?.instagram && (
                    <SocialIcon platform="instagram" url={contact.socialMedia.instagram} />
                  )}
                  {contact.website && (
                    <SocialIcon platform="website" url={contact.website} />
                  )}
                </div>
              </TableCell>
              <TableCell>{Array.isArray(contact.tags) ? contact.tags.join(', ') : '-'}</TableCell>
              <TableCell>{typeof contact[TERMINOLOGY.GROUP] === 'string' ? contact[TERMINOLOGY.GROUP] : '-'}</TableCell>
              <TableCell>{contact.address?.city || '-'}</TableCell>
              <TableCell>{contact.address?.state || '-'}</TableCell>
              <TableCell>
                {contact.dateAdded instanceof Timestamp 
                  ? contact.dateAdded.toDate().toLocaleDateString() 
                  : typeof contact.dateAdded === 'string'
                  ? new Date(contact.dateAdded).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => setEditingContact(contact)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedContacts.length > 0 && (
        <BulkEditMenu
          selectedContacts={selectedContacts}
          activeTab={activeTab}
          onClose={() => setSelectedContacts([])}
          companies={businessContacts}
          onUpdate={handleBulkEditComplete}
        />
      )}

      {editingContact && (
        <EditContactDialog
          key={editingContact.id}
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          companies={businessContacts}
          onContactUpdated={() => {
            // Refresh the contacts list or update the specific contact
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
};

const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  if (!url) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const iconProps = {
    className: "h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer",
    onClick: handleClick
  };

  switch (platform.toLowerCase()) {
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'twitter':
      return <Twitter {...iconProps} />;
    case 'facebook':
      return <Facebook {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'website':
      return <Globe {...iconProps} />;
    default:
      return null;
  }
};
