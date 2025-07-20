import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import authService from '@/services/auth.service'
import { USER_ROLES } from '@/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(!!localStorage.getItem('cinema_token'))
  const currentUser = ref(null)
  const isLoading = ref(false)

  // Getters
  const userRole = computed(() => currentUser.value?.role)
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  const isEmployee = computed(() => userRole.value === USER_ROLES.EMPLOYEE)
  const isCustomer = computed(() => userRole.value === USER_ROLES.CUSTOMER)
  const canManageEmployees = computed(() => isAdmin.value)
  const canManageCustomers = computed(() => isAdmin.value || isEmployee.value)

  // Actions
  async function initAuth() {
    const token = localStorage.getItem('cinema_token')
    if (token) {
      try {
        isLoading.value = true
        const userProfile = await authService.getCurrentUser()
        currentUser.value = userProfile
        isAuthenticated.value = true
      } catch (error) {
        console.error('Auth initialization failed:', error)
        // Xóa token hỏng nếu có lỗi
        localStorage.removeItem('cinema_token')
        currentUser.value = null
        isAuthenticated.value = false
      } finally {
        isLoading.value = false
      }
    }
  }

  function setCurrentUser(data) {
    currentUser.value = { ...currentUser.value, ...data }
  }

  function setAuthenticated(token, user) {
    localStorage.setItem('cinema_token', token)
    currentUser.value = user
    isAuthenticated.value = true
  }

  function logout() {
    console.log('Auth store logout called')
    console.log('Before logout - isAuthenticated:', isAuthenticated.value, 'currentUser:', currentUser.value)
    
    // Xóa token trước
    localStorage.removeItem('cinema_token')
    
    // Reset state bằng cách gán trực tiếp
    isAuthenticated.value = false
    currentUser.value = null
    isLoading.value = false
    
    console.log('After logout - isAuthenticated:', isAuthenticated.value, 'currentUser:', currentUser.value)
    console.log('localStorage token:', localStorage.getItem('cinema_token'))
  }

  return {
    // State
    isAuthenticated,
    currentUser,
    isLoading,

    // Getters
    userRole,
    isAdmin,
    isEmployee,
    isCustomer,
    canManageEmployees,
    canManageCustomers,

    // Actions
    initAuth,
    setCurrentUser,
    setAuthenticated,
    logout,
  }
}) 