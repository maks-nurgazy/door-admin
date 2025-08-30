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
