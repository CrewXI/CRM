import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFirestoreTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return '-'
  return new Date(timestamp.seconds * 1000).toLocaleDateString()
}
