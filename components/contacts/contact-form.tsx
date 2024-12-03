"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { StateCombobox } from "../ui/state-combobox"
import { CountryCombobox } from "../ui/country-combobox"
import { CompanyCombobox } from "../ui/company-combobox"
import { Contact, IndividualContact, BusinessContact } from "@/lib/firebase/types"
import { TERMINOLOGY, FIELDS, LABELS } from '@/lib/constants'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

export const formSchema = z.object({
  type: z.enum(["individual", "business"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  website: z.string()
    .refine(
      (value) => !value || value.startsWith('https://'),
      { message: 'Website must start with https://' }
    )
    .optional(),
  category: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialMedia: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "individual") {
    if (!data.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First name is required for individual contacts",
        path: ["firstName"]
      });
    }
    if (!data.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last name is required for individual contacts",
        path: ["lastName"]
      });
    }
  } else if (data.type === "business") {
    if (!data.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name is required for business contacts",
        path: ["businessName"]
      });
    }
  }
});

interface ContactFormProps {
  initialData?: Contact;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  submitLabel: string;
  showContactType?: boolean;
  onDelete?: () => Promise<void>;
  companies: any[];
  user: any;
  contactsService: any;
  onSuccess?: () => void;
}

export function ContactForm({ 
  initialData, 
  onSubmit, 
  submitLabel, 
  showContactType = true,
  onDelete,
  companies,
  user,
  contactsService,
  onSuccess
}: ContactFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: "individual",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      industry: "",
      businessName: "",
      website: "",
      category: "",
      notes: "",
      tags: [],
      socialMedia: {
        linkedin: "",
        twitter: "",
        facebook: "",
        instagram: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      company: "",
      department: "",
    },
  })

  const contactType = form.watch("type")

  useEffect(() => {
    if (initialData) {
      const formData = { ...initialData };
      
      // If it's an individual contact with a company, find the company name
      if (initialData.type === 'individual' && initialData.company) {
        const company = companies.find(c => c.id === initialData.company);
        if (company?.name) {
          formData.company = company.name;
        }
      }
      
      form.reset(formData);
    }
  }, [initialData, companies, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      let formData: Partial<IndividualContact | BusinessContact> = { ...data };

      // If it's an individual contact with a company, convert company name to ID
      if (formData.type === 'individual' && formData.company) {
        const company = companies.find(c => c.name === formData.company);
        if (company?.id) {
          if ('company' in formData) {
            (formData as Partial<IndividualContact>).company = company.id;
          }
        }
      }

      if (initialData?.id) {
        await contactsService.updateContact(initialData.id, formData, user.uid);
      } else {
        await contactsService.addContact(formData as Omit<Contact, 'id' | 'dateAdded' | 'createdAt' | 'updatedAt'>, user.uid);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {showContactType && (
          <Tabs 
            defaultValue="individual" 
            className="w-full" 
            onValueChange={(value) => {
              form.setValue("type", value as 'individual' | 'business')
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {form.watch('type') === 'individual' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
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
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('type') === "individual" && (
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <CompanyCombobox
                    value={field.value}
                    onSelect={(value, company) => {
                      // Update company-related fields
                      form.setValue("company", value);
                      if (company) {
                        form.setValue("industry", company.industry);
                      } else {
                        form.setValue("industry", undefined);
                      }
                    }}
                    onCreateNew={(value) => {
                      // Switch to business contact type
                      form.setValue("type", "business");
                      form.setValue("businessName", value);
                      form.setValue("company", "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(form.watch('type') === "business" || (form.watch('type') === "individual" && form.watch('company'))) && (
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input {...field} disabled={form.watch('type') === "individual"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(form.watch('type') === "business" || (form.watch('type') === "individual" && form.watch('company'))) && (
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} disabled={form.watch('type') === "individual"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" value={field.value || ''} />
                </FormControl>
                <FormMessage />
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
                  <Input {...field} type="tel" value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <CountryCombobox
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value || '');
                      // Reset state when country changes
                      form.setValue("address.state", '');
                    }}
                  />
                </FormControl>
                <FormMessage />
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
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value?.join(', ') || ''} 
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      field.onChange(tags);
                    }}
                    placeholder="Enter tags separated by commas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    {form.watch('address.country')?.toLowerCase() === 'united states' || 
                     form.watch('address.country')?.toLowerCase() === 'us' ? (
                      <StateCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    ) : (
                      <Input {...field} value={field.value || ''} />
                    )}
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
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="socialMedia.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialMedia.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialMedia.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialMedia.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notes</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ''} 
                    placeholder="Add any additional notes..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete Contact
            </Button>
          )}
          <Button type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
