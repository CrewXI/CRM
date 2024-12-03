import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  writeBatch,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from './config';
import type { Contact, IndividualContact, BusinessContact } from './types';

export const contactsService = {
  async addContact(contact: Omit<Contact, 'id' | 'dateAdded' | 'lastModified'>, userId: string) {
    const contactsRef = collection(db, 'contacts');
    const timestamp = Timestamp.now();

    // Remove undefined values recursively
    const removeUndefined = (obj: any): any => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
          delete obj[key];
        } else if (obj[key] && typeof obj[key] === 'object') {
          removeUndefined(obj[key]);
          // Remove empty objects
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      });
      return obj;
    };

    // Convert any Date objects to Firestore Timestamps
    const convertDatesToTimestamps = (obj: any): any => {
      if (obj instanceof Date) {
        return Timestamp.fromDate(obj);
      }
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          obj[key] = convertDatesToTimestamps(obj[key]);
        });
      }
      return obj;
    };

    // Clean and prepare the contact data
    const cleanedContact = removeUndefined({ ...contact });
    const contactData = convertDatesToTimestamps({
      ...cleanedContact,
      userId: userId,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      dateAdded: timestamp,
      lastModified: timestamp,
    });

    try {
      const newContactRef = await addDoc(contactsRef, contactData);
      
      // If this is an individual with a company, update the company's employee count
      if (contact.type === 'individual' && (contact as IndividualContact).company) {
        try {
          const companyRef = doc(collection(db, 'contacts'), (contact as IndividualContact).company);
          // First get the company to ensure it exists and is a business
          const companyDoc = await getDoc(companyRef);
          const companyData = companyDoc.data();
          
          if (companyDoc.exists() && companyData?.type === 'business') {
            const currentCount = companyData.employeeCount || 0;
            await updateDoc(companyRef, {
              type: 'business',
              employeeCount: currentCount + 1
            });
          } else {
            console.warn('Company not found or not a business type:', companyDoc.id);
          }
        } catch (error) {
          console.warn('Failed to update company employee count:', error);
          // Don't throw the error since the contact was still created successfully
        }
      }

      return {
        ...contactData,
        id: newContactRef.id,
      };
    } catch (error) {
      console.error('Error in addContact:', error);
      throw error;
    }
  },

  // Get all contacts for a user
  async getContacts(userId: string) {
    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Contact);
  },

  // Subscribe to real-time contact updates for a specific user
  subscribeToContacts(callback: (contacts: Contact[]) => void, userId: string) {
    const q = query(
      collection(db, "contacts"), 
      where("userId", "==", userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const contacts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Clean up any potential invalid data
        const cleanedData = {
          ...data,
          id: doc.id,
          dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded : Timestamp.now(),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
          tags: Array.isArray(data.tags) ? data.tags : [],
          socialMedia: {
            linkedin: data.socialMedia?.linkedin || '',
            twitter: data.socialMedia?.twitter || '',
            facebook: data.socialMedia?.facebook || '',
            instagram: data.socialMedia?.instagram || ''
          },
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || 'United States'
          }
        };
        return cleanedData as Contact;
      });
      callback(contacts);
    });
  },

  async getContact(contactId: string, userId?: string): Promise<Contact | null> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);
      
      if (!contactDoc.exists()) {
        return null;
      }
      
      const contactData = contactDoc.data() as Contact;
      
      // If userId is provided, verify ownership
      if (userId && contactData.userId !== userId) {
        console.error('Permission denied: User does not own this contact');
        return null;
      }
      
      return {
        id: contactDoc.id,
        ...contactData
      };
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  // Helper function to remove undefined values and empty arrays
  private cleanData(data: any): any {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      } else if (Array.isArray(cleaned[key]) && cleaned[key].length === 0) {
        delete cleaned[key];
      } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
        cleaned[key] = this.cleanData(cleaned[key]);
        if (Object.keys(cleaned[key]).length === 0) {
          delete cleaned[key];
        }
      }
    });
    return cleaned;
  },

  async updateContact(contactId: string, updates: Partial<Contact>, userId: string) {
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);
    
    if (!contactDoc.exists()) {
      throw new Error('Contact not found');
    }

    const contactData = contactDoc.data() as Contact;
    
    // Verify ownership
    if (contactData.userId !== userId) {
      throw new Error('Permission denied: User does not own this contact');
    }

    const batch = writeBatch(db);
    
    // Clean the updates data to remove undefined values
    const cleanedUpdates = this.cleanData(updates);
    
    // Handle company linking/unlinking for individual contacts
    if (contactData.type === 'individual' && 'company' in updates) {
      const oldCompanyId = contactData.company;
      const newCompanyId = updates.company;

      // Only update company counts if both IDs exist and are different
      if (oldCompanyId && newCompanyId && oldCompanyId !== newCompanyId) {
        try {
          // Verify both companies exist before updating
          const [oldCompanyDoc, newCompanyDoc] = await Promise.all([
            getDoc(doc(db, 'contacts', oldCompanyId)),
            getDoc(doc(db, 'contacts', newCompanyId))
          ]);

          if (!oldCompanyDoc.exists() || !newCompanyDoc.exists()) {
            throw new Error('One or both companies not found');
          }

          const oldCompanyData = oldCompanyDoc.data();
          const newCompanyData = newCompanyDoc.data();

          // Verify company ownership and type
          if (oldCompanyData.type !== 'business' || newCompanyData.type !== 'business') {
            throw new Error('One or both companies are not business contacts');
          }

          // Update employee counts
          batch.update(doc(db, 'contacts', oldCompanyId), {
            employeeCount: increment(-1),
            lastModified: Timestamp.now()
          });

          batch.update(doc(db, 'contacts', newCompanyId), {
            employeeCount: increment(1),
            lastModified: Timestamp.now()
          });
        } catch (error) {
          console.error('Error updating company relationships:', error);
        }
      }
    }

    // Update the contact with cleaned data
    batch.update(contactRef, {
      ...cleanedUpdates,
      userId,
      lastModified: Timestamp.now(),
    });

    await batch.commit();
  },

  async deleteContact(contactId: string, userId: string) {
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);
    
    if (!contactDoc.exists()) {
      throw new Error('Contact not found');
    }

    const contactData = contactDoc.data();
    if (contactData.userId !== userId) {
      throw new Error('Permission denied: User does not own this contact');
    }

    await deleteDoc(contactRef);
  },

  // Get all business contacts for company selection
  async getBusinessContacts(userId: string) {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef, 
        where('userId', '==', userId),
        where('type', '==', 'business')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as BusinessContact);
    } catch (error) {
      console.error('Error fetching business contacts:', error);
      throw error;
    }
  },
};
