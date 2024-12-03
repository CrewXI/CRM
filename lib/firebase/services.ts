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
  getDoc
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
  }
};

export const updateContact = async (contactId: string, updates: Partial<Contact>) => {
  const contactRef = doc(db, 'contacts', contactId);
  const timestamp = Timestamp.now();

  // If we're updating address fields, we need to get the current data first
  const contactSnap = await getDoc(contactRef);
  const currentData = contactSnap.data();

  await updateDoc(contactRef, {
    ...updates,
    lastModified: timestamp
  });
};

export const deleteContact = async (contactId: string) => {
  const contactRef = doc(db, 'contacts', contactId);
  await deleteDoc(contactRef);
};
