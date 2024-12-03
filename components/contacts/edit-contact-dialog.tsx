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
import { Contact } from "@/lib/types";
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
  const [formData, setFormData] = useState<Partial<Contact>>({
    ...contact,
    streetAddress: contact.address?.street || "",
    suite: contact.address?.suite || "",
    city: contact.address?.city || "",
    state: contact.address?.state || "",
    zipCode: contact.address?.zipCode || "",
    country: contact.address?.country || "",
    linkedin: contact.socialMedia?.linkedin || "",
    twitter: contact.socialMedia?.twitter || "",
    instagram: contact.socialMedia?.instagram || "",
    facebook: contact.socialMedia?.facebook || "",
    tags: contact.tags || [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Process tags from comma-separated string to array and restructure address and social media
      const processedData = {
        ...formData,
        address: {
          street: formData.streetAddress || "",
          suite: formData.suite || "",
          city: formData.city || "",
          state: formData.state || "",
          zipCode: formData.zipCode || "",
          country: formData.country || "",
        },
        socialMedia: {
          linkedin: formData.linkedin || "",
          twitter: formData.twitter || "",
          instagram: formData.instagram || "",
          facebook: formData.facebook || "",
        },
      };

      // Remove the flat fields before saving
      delete processedData.streetAddress;
      delete processedData.suite;
      delete processedData.city;
      delete processedData.state;
      delete processedData.zipCode;
      delete processedData.country;
      delete processedData.linkedin;
      delete processedData.twitter;
      delete processedData.instagram;
      delete processedData.facebook;

      await updateContact(contact.id!, processedData);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {contact.type === "individual" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>Social Media</Label>
              <Input
                placeholder="LinkedIn"
                name="linkedin"
                value={formData.linkedin || ""}
                onChange={handleInputChange}
              />
              <Input
                placeholder="Twitter"
                name="twitter"
                value={formData.twitter || ""}
                onChange={handleInputChange}
              />
              <Input
                placeholder="Instagram"
                name="instagram"
                value={formData.instagram || ""}
                onChange={handleInputChange}
              />
              <Input
                placeholder="Facebook"
                name="facebook"
                value={formData.facebook || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                placeholder="Street Address"
                name="streetAddress"
                value={formData.streetAddress || ""}
                onChange={handleInputChange}
              />
              <Input
                placeholder="Apt, Suite, etc."
                name="suite"
                value={formData.suite || ""}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="City"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="State"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Country"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
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

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags.join(", ") || ""}
                onChange={(e) => {
                  const tags = e.target.value.split(",");
                  setFormData((prev) => ({ ...prev, tags: tags.map((tag) => tag.trim()) }));
                }}
              />
            </div>

            <div>
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
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
