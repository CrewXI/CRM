import { Timestamp } from 'firebase/firestore';

// Contact Types
export const CONTACT_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business'
} as const;

export type ContactType = typeof CONTACT_TYPES[keyof typeof CONTACT_TYPES];

// Field Names (used as keys in Firebase)
export const FIELDS = {
  // Common Fields
  TYPE: 'type',
  ADDRESS: 'address',
  GROUP: 'group',
  COMPANY: 'company',
  DATE_ADDED: 'dateAdded',
  EMAIL: 'email',
  LAST_MODIFIED: 'lastModified',
  NOTES: 'notes',
  PHONE: 'phone',
  SEGMENTS: 'segments',
  SOCIAL_MEDIA: 'socialMedia',
  TAGS: 'tags',
  USER_ID: 'userId',
  WEBSITE: 'website',
  JOB_TITLE: 'jobTitle',
  INDUSTRY: 'industry',

  // Individual-specific Fields
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',

  // Address Fields
  ADDRESS_APT: 'apt',
  ADDRESS_TOWN: 'city',
  ADDRESS_COUNTRY: 'country',
  ADDRESS_STATE: 'state',
  ADDRESS_STREET: 'street',
  ADDRESS_ZIP: 'zipCode',

  // Social Media Fields
  SOCIAL_FACEBOOK: 'facebook',
  SOCIAL_INSTAGRAM: 'instagram',
  SOCIAL_LINKEDIN: 'linkedin',
  SOCIAL_TWITTER: 'twitter',
} as const;

// Field Labels (displayed to users)
export const LABELS = {
  [FIELDS.TYPE]: 'Type',
  [FIELDS.ADDRESS]: 'Address',
  [FIELDS.GROUP]: 'Group',
  [FIELDS.COMPANY]: 'Company',
  [FIELDS.DATE_ADDED]: 'Date Added',
  [FIELDS.EMAIL]: 'Email',
  [FIELDS.FIRST_NAME]: 'First Name',
  [FIELDS.LAST_NAME]: 'Last Name',
  [FIELDS.LAST_MODIFIED]: 'Last Modified',
  [FIELDS.NOTES]: 'Notes',
  [FIELDS.PHONE]: 'Phone',
  [FIELDS.SEGMENTS]: 'Segments',
  [FIELDS.SOCIAL_MEDIA]: 'Social Media',
  [FIELDS.TAGS]: 'Tags',
  [FIELDS.WEBSITE]: 'Website',
  [FIELDS.JOB_TITLE]: 'Job Title',
  [FIELDS.INDUSTRY]: 'Industry',
  
  // Address Labels
  [FIELDS.ADDRESS_APT]: 'Apt/Suite',
  [FIELDS.ADDRESS_TOWN]: 'City',
  [FIELDS.ADDRESS_COUNTRY]: 'Country',
  [FIELDS.ADDRESS_STATE]: 'State',
  [FIELDS.ADDRESS_STREET]: 'Street',
  [FIELDS.ADDRESS_ZIP]: 'ZIP Code',

  // Social Media Labels
  [FIELDS.SOCIAL_FACEBOOK]: 'Facebook',
  [FIELDS.SOCIAL_INSTAGRAM]: 'Instagram',
  [FIELDS.SOCIAL_LINKEDIN]: 'LinkedIn',
  [FIELDS.SOCIAL_TWITTER]: 'Twitter',
} as const;

// Field Types (for form validation and type checking)
export const FIELD_TYPES = {
  [FIELDS.TYPE]: 'string',
  [FIELDS.GROUP]: 'string',
  [FIELDS.COMPANY]: 'string',
  [FIELDS.DATE_ADDED]: 'timestamp',
  [FIELDS.EMAIL]: 'string',
  [FIELDS.FIRST_NAME]: 'string',
  [FIELDS.LAST_NAME]: 'string',
  [FIELDS.LAST_MODIFIED]: 'timestamp',
  [FIELDS.NOTES]: 'string',
  [FIELDS.PHONE]: 'string',
  [FIELDS.SEGMENTS]: 'string',
  [FIELDS.TAGS]: 'array',
  [FIELDS.WEBSITE]: 'string',
  [FIELDS.JOB_TITLE]: 'string',
  [FIELDS.INDUSTRY]: 'string',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  [FIELDS.TYPE]: CONTACT_TYPES.INDIVIDUAL,
  [FIELDS.ADDRESS]: {
    [FIELDS.ADDRESS_APT]: null,
    [FIELDS.ADDRESS_TOWN]: '',
    [FIELDS.ADDRESS_COUNTRY]: 'United States',
    [FIELDS.ADDRESS_STATE]: '',
    [FIELDS.ADDRESS_STREET]: '',
    [FIELDS.ADDRESS_ZIP]: '',
  },
  [FIELDS.GROUP]: null,
  [FIELDS.COMPANY]: '',
  [FIELDS.DATE_ADDED]: Timestamp.now(),
  [FIELDS.EMAIL]: '',
  [FIELDS.FIRST_NAME]: '',
  [FIELDS.LAST_NAME]: '',
  [FIELDS.LAST_MODIFIED]: Timestamp.now(),
  [FIELDS.NOTES]: null,
  [FIELDS.PHONE]: '',
  [FIELDS.SEGMENTS]: null,
  [FIELDS.SOCIAL_MEDIA]: {
    [FIELDS.SOCIAL_FACEBOOK]: null,
    [FIELDS.SOCIAL_INSTAGRAM]: null,
    [FIELDS.SOCIAL_LINKEDIN]: null,
    [FIELDS.SOCIAL_TWITTER]: null,
  },
  [FIELDS.TAGS]: [],
  [FIELDS.WEBSITE]: null,
  [FIELDS.JOB_TITLE]: null,
  [FIELDS.INDUSTRY]: null,
} as const;

// Field Requirements by Contact Type
export const REQUIRED_FIELDS = {
  [CONTACT_TYPES.INDIVIDUAL]: [
    FIELDS.FIRST_NAME,
    FIELDS.LAST_NAME,
    FIELDS.EMAIL,
  ],
  [CONTACT_TYPES.BUSINESS]: [
    FIELDS.COMPANY,
    FIELDS.EMAIL,
  ],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  [FIELDS.EMAIL]: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address',
  },
  [FIELDS.PHONE]: {
    pattern: /^\d{10}$/,
    message: 'Phone number must be 10 digits',
  },
  [FIELDS.WEBSITE]: {
    pattern: /^https?:\/\/.+/,
    message: 'Website must start with http:// or https://',
  },
} as const;

// Table Column Constants
export const TABLE_COLUMNS = {
  INDIVIDUAL: {
    NAME: 'Name',
    COMPANY: 'Company'
  },
  BUSINESS: {
    COMPANY: 'Company',
    INDUSTRY: 'Industry'
  }
} as const;

export const TERMINOLOGY = {
  GROUP: 'group',
  GROUPS: 'groups',
  GROUP_LABEL: 'Group',
  GROUPS_LABEL: 'Groups',
} as const;

// Type for the terminology
export type TerminologyKeys = keyof typeof TERMINOLOGY;
