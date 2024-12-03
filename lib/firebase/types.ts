import { Timestamp } from 'firebase/firestore';

/**
 * Base model interface containing common fields for all models
 */
export interface BaseModel {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Company interface extending the base model interface
 */
export interface Company extends BaseModel {
  name: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  website?: string;
  notes?: string;
}

/**
 * Type representing the type of contact
 */
export type ContactType = 'individual' | 'business';

/**
 * Base contact interface extending the base model interface
 */
export interface BaseContact extends BaseModel {
  type: ContactType;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  website?: string;
  category?: string;
  group?: string;
  userId: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  dateAdded: Date;
}

/**
 * Individual contact interface extending the base contact interface
 */
export interface IndividualContact extends BaseContact {
  type: 'individual';
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  department?: string;
}

/**
 * Business contact interface extending the base contact interface
 */
export interface BusinessContact extends BaseContact {
  type: 'business';
  businessName: string;
  industry?: string;
  website?: string;
}

/**
 * Type representing a contact
 */
export type Contact = IndividualContact | BusinessContact;

/**
 * User settings interface extending the base model interface
 */
export interface UserSettings extends BaseModel {
  theme?: 'light' | 'dark' | 'system';
  contactsTableColumns?: string[];
  defaultContactType?: ContactType;
}

/**
 * User preferences interface extending the base model interface
 */
export interface UserPreferences extends BaseModel {
  emailNotifications?: boolean;
  dashboardLayout?: string;
}
