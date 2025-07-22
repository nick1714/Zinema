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
  const router = useRouter()
  const queryClient = useQueryClient()

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
    if (token && !currentUser.value) {
      // Chỉ chạy nếu chưa có user
      try {
        isLoading.value = true
        // API /me trả về cấu trúc { user, role }
        const data = await authService.getCurrentUser()

        // Kiểm tra và chuẩn hóa cấu trúc dữ liệu một cách chính xác
        if (data && data.user && data.user.id && data.role) {
          // Tạo một user object phẳng, kết hợp user và role từ đúng vị trí
          const userProfile = { ...data.user, role: data.role }
          currentUser.value = userProfile
          isAuthenticated.value = true
        } else {
          // Nếu cấu trúc không đúng, coi như xác thực thất bại
          throw new Error('Invalid data structure from /me endpoint. Expected { user, role }.')
        }
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
    localStorage.removeItem('cinema_token')
    isAuthenticated.value = false
    currentUser.value = null
    isLoading.value = false

    // Xóa cache của vue-query để đảm bảo không còn dữ liệu cũ
    queryClient.clear()

    // Chuyển hướng về trang đăng nhập
    // Dùng replace để người dùng không thể "back" lại trang trước đó
    if (router) {
      router.replace('/login')
    }
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
