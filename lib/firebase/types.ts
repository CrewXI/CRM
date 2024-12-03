import { Timestamp } from 'firebase/firestore';

export interface BaseContact {
  id: string;
  userId: string;
  type: 'individual' | 'business';
  email?: string;
  phone?: string;
  website?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  dateAdded: Timestamp;
  lastModified: Timestamp;
  address?: {
    street?: string;
    suite?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface IndividualContact extends BaseContact {
  type: 'individual';
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  businessId?: string; // Reference to associated business contact
}

export interface BusinessContact extends BaseContact {
  type: 'business';
  businessName: string;
  employees?: string[]; // Array of individual contact IDs associated with this business
}

export type Contact = IndividualContact | BusinessContact;

export interface Category {
  id: string;
  userId: string;
  name: string;
  description?: string;
  dateCreated: Timestamp;
  lastModified: Timestamp;
}

export interface Segment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  rules?: {
    field: string;
    operator: string;
    value: any;
  }[];
  dateCreated: Timestamp;
  lastModified: Timestamp;
}

export interface ContactSegment {
  contactId: string;
  segmentId: string;
  dateAdded: Timestamp;
}

export interface UserSettings {
  userId: string;
  defaultView: 'all' | 'individual' | 'business';
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
  };
}
