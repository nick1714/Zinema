import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import authService from '@/services/auth.service'

const EMPLOYEES_QUERY_KEY = 'employees'
const CUSTOMERS_QUERY_KEY = 'customers'
const AUTH_QUERY_KEY = 'auth'

// Toàn bộ state và logic quản lý đã được chuyển vào auth.store.js
// Composable này bây giờ đóng vai trò là một lớp facade/helper để truy cập store dễ dàng hơn

/**
 * Composable cho authentication chính.
 * Lấy state và getters trực tiếp từ Pinia store.
 */
export function useAuth() {
  const authStore = useAuthStore()

  return {
    // State (thông qua computed refs từ store)
    isAuthenticated: computed(() => authStore.isAuthenticated),
    currentUser: computed(() => authStore.currentUser),
    isLoading: computed(() => authStore.isLoading),

    // Getters (thông qua computed refs từ store)
    userRole: computed(() => authStore.userRole),
    isAdmin: computed(() => authStore.isAdmin),
    isEmployee: computed(() => authStore.isEmployee),
    isCustomer: computed(() => authStore.isCustomer),
    canManageEmployees: computed(() => authStore.canManageEmployees),
    canManageCustomers: computed(() => authStore.canManageCustomers),

    // Actions (trỏ trực tiếp đến store actions)
    logout: authStore.logout,
    setCurrentUser: authStore.setCurrentUser,
    setAuthenticated: authStore.setAuthenticated,
    initAuth: authStore.initAuth,
  }
}

/**
 * Composable cho employee management
 * Chỉ trả về các mutation, không tự gọi
 */
export function useEmployees() {
  const queryClient = useQueryClient()

  const registerEmployeeMutation = useMutation({
    mutationFn: authService.registerEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => authService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
  })

  return {
    registerEmployee: registerEmployeeMutation,
    updateEmployee: updateEmployeeMutation,
  }
}

/**
 * Composable cho customer management
 * Chỉ trả về các mutation, không tự gọi
 */
export function useCustomers() {
  const queryClient = useQueryClient()

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => authService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY, 'currentUser'] })
    },
  })

  return {
    updateCustomer: updateCustomerMutation,
  }
}

/**
 * Composable cho đổi mật khẩu
 */
export function usePasswordChange() {
  const queryClient = useQueryClient()

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] })
    },
  })

  return {
    changePassword: changePasswordMutation,
    isChangingPassword: changePasswordMutation.isLoading,
  }
}
