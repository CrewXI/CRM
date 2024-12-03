import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Contact, IndividualContact, BusinessContact } from "@/lib/firebase/types";
import { useState } from "react";
import { updateContact, deleteContact } from "@/lib/firebase/services";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { StateCombobox } from "../ui/state-combobox";

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onContactUpdated: () => void;
}

export function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onContactUpdated,
}: EditContactDialogProps) {
  const [formData, setFormData] = useState<Contact>(() => ({
    ...contact,
    address: {
      street: contact.address?.street ?? '',
      suite: contact.address?.suite ?? '',
      city: contact.address?.city ?? '',
      state: contact.address?.state ?? '',
      zipCode: contact.address?.zipCode ?? '',
      country: contact.address?.country ?? ''
    },
    socialMedia: {
      linkedin: contact.socialMedia?.linkedin ?? '',
      twitter: contact.socialMedia?.twitter ?? '',
      facebook: contact.socialMedia?.facebook ?? '',
      instagram: contact.socialMedia?.instagram ?? ''
    }
  }));

  // Type guard functions
  const isIndividualContact = (contact: Contact): contact is IndividualContact => {
    return contact.type === 'individual';
  };

  const isBusinessContact = (contact: Contact): contact is BusinessContact => {
    return contact.type === 'business';
  };

  // Get type-safe field values
  const getFieldValue = (field: string): string => {
    if (field === 'firstName' && isIndividualContact(formData)) {
      return formData.firstName ?? '';
    }
    if (field === 'lastName' && isIndividualContact(formData)) {
      return formData.lastName ?? '';
    }
    if (field === 'jobTitle' && isIndividualContact(formData)) {
      return formData.jobTitle ?? '';
    }
    if (field === 'company' && isIndividualContact(formData)) {
      return formData.company ?? '';
    }
    if (field === 'companyName' && isBusinessContact(formData)) {
      return formData.businessName ?? '';
    }
    return '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as Record<string, string>),
            [child]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev: Contact) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContact(contact.id!, formData);
      toast.success("Contact updated successfully");
      onContactUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(contact.id!);
        toast.success("Contact deleted successfully");
        onContactUpdated();
        onOpenChange(false);
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !p-0 gap-0">
        <div className="bg-background px-6 py-3 border-b z-50">
          <DialogHeader className="relative space-y-0 !space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg leading-none">Edit Contact</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm leading-none mt-1.5">
              Update contact information below.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.type === 'individual' ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={getFieldValue('firstName')}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={getFieldValue('lastName')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={getFieldValue('company')}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={getFieldValue('jobTitle')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || "https://"}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith('https://')) {
                          value = 'https://' + value.replace('https://', '');
                        }
                        setFormData((prev) => ({ ...prev, website: value }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === 'https://') {
                          e.target.setSelectionRange(8, 8);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      name="address.country"
                      value={formData.address?.country || ""}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            country: newCountry,
                            state: newCountry !== "United States" ? "" : prev.address?.state
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="businessName"
                      value={getFieldValue('companyName')}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(value) => handleSelectChange(value, "category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || "https://"}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith('https://')) {
                          value = 'https://' + value.replace('https://', '');
                        }
                        setFormData((prev) => ({ ...prev, website: value }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === 'https://') {
                          e.target.setSelectionRange(8, 8);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      name="address.country"
                      value={formData.address?.country || ""}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            country: newCountry,
                            state: newCountry !== "United States" ? "" : prev.address?.state
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <Label>Social Media</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="LinkedIn"
                    name="socialMedia.linkedin"
                    value={formData.socialMedia?.linkedin || ""}
                    onChange={handleInputChange}
                  />
                  <Input
                    placeholder="Twitter"
                    name="socialMedia.twitter"
                    value={formData.socialMedia?.twitter || ""}
                    onChange={handleInputChange}
                  />
                  <Input
                    placeholder="Facebook"
                    name="socialMedia.facebook"
                    value={formData.socialMedia?.facebook || ""}
                    onChange={handleInputChange}
                  />
                  <Input
                    placeholder="Instagram"
                    name="socialMedia.instagram"
                    value={formData.socialMedia?.instagram || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Address</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Street Address"
                      name="address.street"
                      value={formData.address?.street || ""}
                      onChange={handleInputChange}
                    />
                    <Input
                      placeholder="Apt, Suite, etc."
                      name="address.suite"
                      value={formData.address?.suite || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="City"
                      name="address.city"
                      value={formData.address?.city || ""}
                      onChange={handleInputChange}
                    />
                    {formData.address?.country === "United States" ? (
                      <StateCombobox
                        value={formData.address?.state || ""}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              state: value,
                            },
                          }));
                        }}
                      />
                    ) : (
                      <Input
                        id="state"
                        placeholder="State/Province/Region"
                        name="address.state"
                        value={formData.address?.state || ""}
                        onChange={handleInputChange}
                      />
                    )}
                    <Input
                      placeholder="ZIP Code"
                      name="address.zipCode"
                      value={formData.address?.zipCode || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",");
                    setFormData((prev: Contact) => ({ ...prev, tags: tags.map((tag) => tag.trim()) }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="destructive" type="button" onClick={handleDelete}>
                Delete Contact
              </Button>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
