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

    const contactData = {
      ...contact,
      userId,
      dateAdded: timestamp,
      lastModified: timestamp,
    };

    const newContactRef = await addDoc(contactsRef, contactData);
    
    // If this is an individual with a company, update the company's employee count
    if (contact.type === 'individual' && contact.companyId) {
      const companyRef = doc(db, 'contacts', contact.companyId);
      await updateDoc(companyRef, {
        employeeCount: increment(1)
      });
    }

    return {
      ...contactData,
      id: newContactRef.id,
    };
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
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      callback(contacts);
    });
  },

  // Mass update contacts
  async updateContacts(contactIds: string[], updates: Partial<Contact>) {
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();

    // If we're updating address fields, we need to get the current data first
    if (updates.address) {
      const promises = contactIds.map(async (id) => {
        const contactRef = doc(db, 'contacts', id);
        const contactSnap = await getDoc(contactRef);
        const currentData = contactSnap.data();
        
        batch.update(contactRef, {
          ...updates,
          address: {
            ...currentData?.address,
            ...updates.address
          },
          lastModified: timestamp
        });
      });

      await Promise.all(promises);
    } else {
      contactIds.forEach(id => {
        const contactRef = doc(db, 'contacts', id);
        batch.update(contactRef, {
          ...updates,
          lastModified: timestamp
        });
      });
    }

    await batch.commit();
  },

  // Delete multiple contacts
  async deleteContacts(contactIds: string[]) {
    const batch = writeBatch(db);

    contactIds.forEach(id => {
      const contactRef = doc(db, 'contacts', id);
      batch.delete(contactRef);
    });

    await batch.commit();
  },

  async updateContact(contactId: string, updates: Partial<Contact>) {
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);
    const oldData = contactDoc.data() as Contact;
    
    // Handle company linking/unlinking for individual contacts
    if (oldData.type === 'individual' && 'companyId' in updates) {
      const oldCompanyId = oldData.companyId;
      const newCompanyId = updates.companyId;

      // Decrement old company's employee count
      if (oldCompanyId) {
        const oldCompanyRef = doc(db, 'contacts', oldCompanyId);
        await updateDoc(oldCompanyRef, {
          employeeCount: increment(-1)
        });
      }

      // Increment new company's employee count
      if (newCompanyId) {
        const newCompanyRef = doc(db, 'contacts', newCompanyId);
        await updateDoc(newCompanyRef, {
          employeeCount: increment(1)
        });
      }
    }

    await updateDoc(contactRef, {
      ...updates,
      lastModified: Timestamp.now(),
    });
  },

  async deleteContact(contactId: string) {
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);
    const contactData = contactDoc.data() as Contact;

    // If this is an individual with a company, decrement the company's employee count
    if (contactData.type === 'individual' && contactData.companyId) {
      const companyRef = doc(db, 'contacts', contactData.companyId);
      await updateDoc(companyRef, {
        employeeCount: increment(-1)
      });
    }

    await deleteDoc(contactRef);
  },

  // Get all business contacts for company selection
  async getBusinessContacts(userId: string) {
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
  },
};
