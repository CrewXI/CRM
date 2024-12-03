"use client"

import React, { useEffect } from "react"
import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "../ui/textarea"

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
      address: {
        country: "United States"
      },
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
        address: {
          country: "United States"
        },
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
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          jobTitle: values.jobTitle || undefined,
          company: values.company || undefined,
        } : {}),
        // For business contacts
        ...(values.type === 'business' ? {
          businessName: values.company || undefined,
        } : {}),
        // Common fields
        email: values.email || undefined,
        phone: values.phone || undefined,
        website: values.website || undefined,
        category: values.category || undefined,
        segments: values.segments || undefined,
        tags: values.tags || [],
        notes: values.notes || undefined,
        socialMedia: {
          linkedin: values.socialMedia?.linkedin || undefined,
          twitter: values.socialMedia?.twitter || undefined,
          facebook: values.socialMedia?.facebook || undefined,
          instagram: values.socialMedia?.instagram || undefined,
        },
        address: {
          street: values.address?.street || undefined,
          apt: values.address?.apt || undefined,
          city: values.address?.city || undefined,
          state: values.address?.state || undefined,
          zipCode: values.address?.zipCode || undefined,
          country: values.address?.country || undefined,
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
      address: {
        country: "United States"
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !p-0 gap-0">
        <div className="bg-background px-6 py-3 border-b z-50">
          <DialogHeader className="relative space-y-0 !space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg leading-none">Add New Contact</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm leading-none mt-1.5">
              Fill in the contact information below.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">
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
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || "https://"}
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
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormLabel>Social Media</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div>
                    <FormLabel>Address</FormLabel>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                      <div className="grid grid-cols-3 gap-4">
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
                              <FormControl>
                                {form.watch("address.country")?.toLowerCase() === "united states" ? (
                                  <StateCombobox
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                ) : (
                                  <Input placeholder="State/Province/Region" {...field} />
                                )}
                              </FormControl>
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
                  </div>
                  <div>
                    <FormLabel>Notes</FormLabel>
                    <div className="space-y-4">
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional notes..."
                          {...form.register("notes")}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="submit">Create Contact</Button>
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
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || "https://"}
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
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormLabel>Social Media</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div>
                    <FormLabel>Address</FormLabel>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                      <div className="grid grid-cols-3 gap-4">
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
                              <FormControl>
                                {form.watch("address.country")?.toLowerCase() === "united states" ? (
                                  <StateCombobox
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                ) : (
                                  <Input placeholder="State/Province/Region" {...field} />
                                )}
                              </FormControl>
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
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Add any additional notes..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Contact</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
