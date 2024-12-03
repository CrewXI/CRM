"use client"

import React, { useEffect } from "react"
import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { cn } from "../../lib/utils"
import { useAuth } from "../../contexts/auth-context"
import { contactsService } from "../../lib/firebase/services"
import { toast } from "sonner"
import { StateCombobox } from "../ui/state-combobox"

const formSchema = z.object({
  type: z.enum(["individual", "business"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  website: z.string()
    .refine(
      (value) => !value || value.startsWith('https://'),
      { message: 'Website must start with https://' }
    )
    .optional(),
  category: z.string().optional(),
  segments: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  socialMedia: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  address: z.object({
    street: z.string().optional(),
    apt: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
}).refine((data) => {
  if (data.type === "individual") {
    return data.firstName && data.lastName;
  }
  return true;
}, {
  message: "Please fill in all required fields",
  path: ["type"],
});

export interface AddContactDialogProps {
  activeTab?: "all" | "individual" | "business"
}

export function AddContactDialog({ activeTab = "all" }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [contactType, setContactType] = useState<"individual" | "business">(activeTab === "business" ? "business" : "individual")
  const { user } = useAuth()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: contactType,
      socialMedia: {},
      address: {},
      tags: [],
    },
  })

  useEffect(() => {
    if (open) {
      const newType = activeTab === "business" ? "business" : "individual"
      setContactType(newType)
      form.reset({
        type: newType,
        socialMedia: {},
        address: {},
        tags: [],
      })
    }
  }, [open, activeTab, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.uid) return
    
    try {
      // Clean up the data before sending to Firestore
      const cleanedValues = {
        type: values.type,
        userId: user.uid,
        // For individual contacts
        ...(values.type === 'individual' ? {
          firstName: values.firstName || null,
          lastName: values.lastName || null,
          jobTitle: values.jobTitle || null,
          company: values.company || null,
        } : {}),
        // For business contacts
        ...(values.type === 'business' ? {
          businessName: values.company || null,
        } : {}),
        // Common fields
        email: values.email || null,
        phone: values.phone || null,
        website: values.website || null,
        category: values.category || null,
        segments: values.segments || null,
        tags: values.tags || [],
        notes: values.notes || null,
        socialMedia: {
          linkedin: values.socialMedia?.linkedin || null,
          twitter: values.socialMedia?.twitter || null,
          facebook: values.socialMedia?.facebook || null,
          instagram: values.socialMedia?.instagram || null,
        },
        address: {
          street: values.address?.street || null,
          apt: values.address?.apt || null,
          city: values.address?.city || null,
          state: values.address?.state || null,
          zipCode: values.address?.zipCode || null,
          country: values.address?.country || null,
        }
      };

      await contactsService.addContact(cleanedValues, user.uid);
      setOpen(false);
      form.reset();
      toast.success("Contact created successfully");
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact");
    }
  }

  const handleTabChange = (value: "individual" | "business") => {
    setContactType(value)
    form.reset({
      type: value,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      company: "",
      website: "",
      category: "",
      segments: "",
      tags: [],
      notes: "",
      socialMedia: {},
      address: {},
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="relative sticky top-0 bg-background z-50 pb-4 mb-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <Tabs value={contactType} onValueChange={handleTabChange as (value: string) => void}>
          <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-background">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <FormLabel>Social Media</FormLabel>
                    <FormField
                      control={form.control}
                      name="socialMedia.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="LinkedIn" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Twitter" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Instagram" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Facebook" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormLabel>Address</FormLabel>
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.apt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Apt, Suite, etc." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <StateCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="ZIP Code" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            defaultValue="https://"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (!value.startsWith('https://')) {
                                value = 'https://' + value.replace('https://', '');
                              }
                              field.onChange(value);
                            }}
                            onFocus={(e) => {
                              if (e.target.value === 'https://') {
                                e.target.setSelectionRange(8, 8);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Select a category" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Contact</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="business">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            defaultValue="https://"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (!value.startsWith('https://')) {
                                value = 'https://' + value.replace('https://', '');
                              }
                              field.onChange(value);
                            }}
                            onFocus={(e) => {
                              if (e.target.value === 'https://') {
                                e.target.setSelectionRange(8, 8);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <FormLabel>Social Media</FormLabel>
                    <FormField
                      control={form.control}
                      name="socialMedia.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="LinkedIn" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Twitter" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Facebook" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialMedia.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Instagram" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormLabel>Address</FormLabel>
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.apt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Apt, Suite, etc." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <StateCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="ZIP Code" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Select a category" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Contact</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
