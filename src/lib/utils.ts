import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Clears all NextAuth related storage data
 * Use this when experiencing session issues
 */
export function clearNextAuthStorage() {
  if (typeof window === "undefined") return;
  
  // Clear localStorage
  localStorage.removeItem("next-auth.session-token");
  localStorage.removeItem("next-auth.csrf-token");
  localStorage.removeItem("next-auth.callback-url");
  
  // Clear sessionStorage
  sessionStorage.removeItem("next-auth.session-token");
  sessionStorage.removeItem("next-auth.csrf-token");
  sessionStorage.removeItem("next-auth.callback-url");
  
  // Clear any other potential NextAuth keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("next-auth")) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
}

/**
 * Formats a date in a beautiful and readable way
 * Examples: "2 hours ago", "Yesterday at 3:45 PM", "Dec 15, 2023 at 2:30 PM"
 */
export function formatDateBeautiful(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  
  // Check if the date is valid
  if (isNaN(targetDate.getTime())) {
    console.warn('Invalid date received:', date);
    return 'Invalid date';
  }
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Format options for different time ranges
// For questions, we only want to show the date without time
  const questionDateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 1) {
      return "Just now";
    }
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 2) {
    return `Yesterday`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} day${Math.floor(diffInDays) > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    return targetDate.toLocaleDateString('en-US', questionDateOptions);
  } else {
    return targetDate.toLocaleDateString('en-US', questionDateOptions);
  }
}
