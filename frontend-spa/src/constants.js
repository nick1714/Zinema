export const DEFAULT_IMAGE = '/images/default-movie-poster.png'

// Environment variables (safe to access)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
// STATIC_BASE_URL không nên chứa /public vì đường dẫn từ backend đã có /public
export const STATIC_BASE_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:3000'
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL
export const APP_NAME = import.meta.env.VITE_APP_NAME

// CGV Theme Colors (public constants)
export const THEME = {
  PRIMARY: '#e50914', // CGV Red
  SECONDARY: '#221f1f', // Dark Grey
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
}

// User Roles (public constants)
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'staff',
  CUSTOMER: 'customer',
}
