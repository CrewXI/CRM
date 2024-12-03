import { Timestamp } from 'firebase/firestore';
import { TERMINOLOGY, FIELDS } from '../constants';

/**
 * Base contact interface containing common fields for both individual and business contacts
 */
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
    apt?: string;
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
  group?: string; // Reference to associated group ID
}

/**
 * Individual contact interface extending the base contact interface
 */
export interface IndividualContact extends BaseContact {
  type: 'individual';
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  businessId?: string; // Reference to associated business contact
}

/**
 * Business contact interface extending the base contact interface
 */
export interface BusinessContact extends BaseContact {
  type: 'business';
  businessName: string;
  industry?: string;
  employees?: string[]; // Array of individual contact IDs associated with this business
}

/**
 * Union type representing either an individual or business contact
 */
export type Contact = IndividualContact | BusinessContact;

/**
 * Group interface representing a collection of contacts
 */
export interface Group {
  id: string;
  userId: string;
  name: string;
  description?: string;
  dateCreated: Timestamp;
  lastModified: Timestamp;
}

/**
 * Segment interface representing a set of rules to filter contacts
 */
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

/**
 * Contact segment interface representing the association between a contact and a segment
 */
export interface ContactSegment {
  contactId: string;
  segmentId: string;
  dateAdded: Timestamp;
}

/**
 * User settings interface representing the user's preferences
 */
export interface UserSettings {
  userId: string;
  defaultView: 'all' | 'individual' | 'business';
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
  };
}
