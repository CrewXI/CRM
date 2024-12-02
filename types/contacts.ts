export interface Contact {
    id: string
    name: string
    company?: string
    email?: string
    phone?: string
    website?: string
    category?: string
    tags?: string[]
    city?: string
    state?: string
    dateAdded: string
    type: "individual" | "business"
    businessId?: string // For individuals linked to a business
  }
  
  