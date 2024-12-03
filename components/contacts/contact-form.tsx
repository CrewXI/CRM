"use client"

import React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { StateCombobox } from "../ui/state-combobox"
import { CountryCombobox } from "../ui/country-combobox"
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
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  businessName: z.string().optional(),
  website: z.string()
    .refine(
      (value) => !value || value.startsWith('https://'),
      { message: 'Website must start with https://' }
    )
    .optional(),
  [TERMINOLOGY.GROUP]: z.string().optional(),
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
    [FIELDS.ADDRESS_STREET]: z.string().optional(),
    [FIELDS.ADDRESS_APT]: z.string().optional(),
    [FIELDS.ADDRESS_TOWN]: z.string().optional(),
    [FIELDS.ADDRESS_STATE]: z.string().optional(),
    [FIELDS.ADDRESS_ZIP]: z.string().optional(),
    [FIELDS.ADDRESS_COUNTRY]: z.string().optional(),
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

interface ContactFormProps {
  initialData?: Contact;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  submitLabel: string;
  showContactType?: boolean;
  onDelete?: () => Promise<void>;
}

export function ContactForm({ 
  initialData, 
  onSubmit, 
  submitLabel, 
  showContactType = true,
  onDelete 
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
      [TERMINOLOGY.GROUP]: "",
      segments: "",
      notes: "",
      tags: [],
      socialMedia: {
        linkedin: "",
        twitter: "",
        facebook: "",
        instagram: "",
      },
      address: {
        [FIELDS.ADDRESS_STREET]: "",
        [FIELDS.ADDRESS_APT]: "",
        [FIELDS.ADDRESS_TOWN]: "",
        [FIELDS.ADDRESS_STATE]: "",
        [FIELDS.ADDRESS_ZIP]: "",
        [FIELDS.ADDRESS_COUNTRY]: "United States",
      },
    },
  })

  const contactType = form.watch("type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://" value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {contactType === 'individual' ? (
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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
            name={`address.${FIELDS.ADDRESS_COUNTRY}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS[FIELDS.ADDRESS_COUNTRY]}</FormLabel>
                <FormControl>
                  <CountryCombobox
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value || '');
                      // Reset state when country changes
                      form.setValue(`address.${FIELDS.ADDRESS_STATE}`, '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={TERMINOLOGY.GROUP}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{TERMINOLOGY.GROUP_LABEL}</FormLabel>
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
              name={`address.${FIELDS.ADDRESS_STREET}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS[FIELDS.ADDRESS_STREET]}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`address.${FIELDS.ADDRESS_APT}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS[FIELDS.ADDRESS_APT]}</FormLabel>
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
              name={`address.${FIELDS.ADDRESS_TOWN}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS[FIELDS.ADDRESS_TOWN]}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`address.${FIELDS.ADDRESS_STATE}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS[FIELDS.ADDRESS_STATE]}</FormLabel>
                  <FormControl>
                    {form.watch(`address.${FIELDS.ADDRESS_COUNTRY}`)?.toLowerCase() === 'united states' || 
                     form.watch(`address.${FIELDS.ADDRESS_COUNTRY}`)?.toLowerCase() === 'us' ? (
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
              name={`address.${FIELDS.ADDRESS_ZIP}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS[FIELDS.ADDRESS_ZIP]}</FormLabel>
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
