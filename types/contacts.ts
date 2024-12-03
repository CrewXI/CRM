import { Timestamp } from 'firebase/firestore';

export interface Contact {
  id: string
  userId: string
  type: "individual" | "business"
  // Individual-specific fields
  firstName?: string
  lastName?: string
  jobTitle?: string
  // Business-specific fields
  businessName?: string
  // Common fields
  company?: string
  email?: string
  phone?: string
  website?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
  }
  address?: {
    street?: string
    suite?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  category?: string
  segments?: string
  tags?: string[]
  notes?: string
  dateAdded: Timestamp
  lastModified: Timestamp
}