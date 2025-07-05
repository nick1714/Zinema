import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import { USER_ROLES } from '@/constants'

const AUTH_QUERY_KEY = 'auth'
const EMPLOYEES_QUERY_KEY = 'employees'
const CUSTOMERS_QUERY_KEY = 'customers'

// Global auth state
const isAuthenticated = ref(!!localStorage.getItem('cinema_token'))
const currentUser = ref(null)

/**
 * Khởi tạo trạng thái xác thực khi ứng dụng tải
 * Sẽ được gọi trong main.js TRƯỚC KHI mount app
 */
export async function initAuth() {
  const token = localStorage.getItem('cinema_token')
  if (token) {
    try {
      // Sử dụng phương thức `getCurrentUser` đã có
      const userProfile = await authService.getCurrentUser()
      currentUser.value = userProfile
      isAuthenticated.value = true
    } catch (error) {
      console.error('Auth initialization failed:', error)
      // Xóa token hỏng nếu có lỗi
      localStorage.removeItem('cinema_token')
      currentUser.value = null
      isAuthenticated.value = false
    }
  }
}

/**
 * Composable cho authentication chính
 * Chỉ chứa các state và actions cơ bản, không tự gọi useQuery
 */
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Logout function
  function logout() {
    localStorage.removeItem('cinema_token')
    isAuthenticated.value = false
    currentUser.value = null
    queryClient.clear()
    router.push('/login')
  }

  // Permission helpers
  const userRole = computed(() => currentUser.value?.role)
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  const isEmployee = computed(() => userRole.value === USER_ROLES.EMPLOYEE)
  const isCustomer = computed(() => userRole.value === USER_ROLES.CUSTOMER)
  const canManageEmployees = computed(() => isAdmin.value)
  const canManageCustomers = computed(() => isAdmin.value || isEmployee.value)

  function setCurrentUser(data) {
    currentUser.value = { ...currentUser.value, ...data }
  }

  return {
    // State
    isAuthenticated,
    currentUser: computed(() => currentUser.value),
    userRole,

    // Permissions
    isAdmin,
    isEmployee,
    isCustomer,
    canManageEmployees,
    canManageCustomers,

    // Actions
    logout,
    setCurrentUser,
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
