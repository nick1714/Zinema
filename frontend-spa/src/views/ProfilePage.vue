<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, usePasswordChange } from '@/composables/useAuth'
import CustomerForm from '@/components/CustomerForm.vue'
import ChangePasswordForm from '@/components/ChangePasswordForm.vue'

const route = useRoute()
const router = useRouter()
const { currentUser, userRole, isCustomer, isEmployee, isAdmin, setCurrentUser } = useAuth()
const { changePassword, isChangingPassword: isPasswordLoading } = usePasswordChange()

// Only import updateCustomer mutation, not the whole useCustomers (which calls getAllCustomers)
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import authService from '@/services/auth.service'

const queryClient = useQueryClient()
const updateCustomerMutation = useMutation({
  mutationFn: ({ id, data }) => authService.updateCustomer(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['auth'] })
  },
})

const isEditingProfile = ref(false)
const isChangingPassword = ref(false)
const isFirstTimeUser = ref(false)

// Check if this is a first-time user from Google registration
onMounted(() => {
  if (route.query.firstTime === 'true') {
    isFirstTimeUser.value = true
    isEditingProfile.value = true // Automatically enable edit mode
    // Clear the query parameter from URL
    router.replace({ path: route.path })
  }
})

const isGoogleAccount = computed(() => !!currentUser.value?.google_id)

const customerInitialValues = computed(() => {
  if (!currentUser.value) return {}
  const user = currentUser.value
  return {
    ...user,
    date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
  }
})

// Customer profile update
async function handleUpdateProfile(values) {
  try {
    const userId = currentUser.value.id
    const resp = await updateCustomerMutation.mutateAsync({
      id: userId,
      data: values,
    })

    // resp has shape { customer: {...} } from backend
    const newProfile = resp?.customer ?? values
    setCurrentUser(newProfile)

    isEditingProfile.value = false

    if (isFirstTimeUser.value) {
      alert('Chào mừng bạn đến với Cinema! Thông tin của bạn đã được cập nhật thành công.')
      isFirstTimeUser.value = false
    } else {
      alert('Cập nhật thông tin thành công!')
    }
  } catch (error) {
    console.error('Update profile error:', error)
    alert('Có lỗi xảy ra khi cập nhật thông tin!')
  }
}

// Password change
async function handleChangePassword(values) {
  try {
    await changePassword.mutate(values)
    isChangingPassword.value = false
    alert('Đổi mật khẩu thành công!')
  } catch (error) {
    console.error('Change password error:', error)
    alert('Có lỗi xảy ra khi đổi mật khẩu: ' + error.message)
  }
}

function formatRole(role) {
  const roleMap = {
    admin: 'Quản trị viên',
    staff: 'Nhân viên',
    customer: 'Khách hàng',
  }
  return roleMap[role] || role
}

function formatGender(gender) {
  const genderMap = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  }
  return genderMap[gender] || gender
}

// Go back function based on user role
function goBack() {
  if (isAdmin.value || isEmployee.value) {
    // Admin and Employee go to dashboard    Employee go to dashboard( no implement)
    router.push('/admin')
  } else if (isCustomer.value) {
    // Customer goes to movies
    router.push('/movies')
  } else {
    // Fallback to login page
    router.push('/login')
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header bg-cinema-primary text-white">
              <h4 class="mb-0">
                <i class="fas fa-user me-2"></i>
                Thông tin cá nhân
              </h4>
            </div>

            <div class="card-body" v-if="currentUser">
              <!-- Welcome message for first-time users -->
              <div v-if="isFirstTimeUser" class="alert alert-info mb-4" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Chào mừng bạn đến với Cinema!</strong>
                Vui lòng cập nhật đầy đủ thông tin cá nhân để có trải nghiệm tốt nhất.
              </div>

              <!-- User Avatar & Role -->
              <div class="text-center mb-4">
                <i class="fas fa-user-circle fa-5x text-muted mb-3"></i>
                <h5>{{ currentUser.full_name }}</h5>
                <span class="badge text-bg-info">{{ formatRole(userRole) }}</span>
              </div>

              <!-- Password Change Form -->
              <div v-if="isChangingPassword" class="mb-4">
                <h6 class="border-bottom pb-2 mb-3">
                  <i class="fas fa-key me-2"></i>
                  Đổi mật khẩu
                </h6>
                <ChangePasswordForm
                  :is-loading="isPasswordLoading"
                  @submit="handleChangePassword"
                  @cancel="isChangingPassword = false"
                />
              </div>

              <!-- Customer Profile (Editable) -->
              <div v-else-if="isCustomer">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="border-bottom pb-2 mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Thông tin cá nhân
                  </h6>
                  <div class="d-flex gap-2">
                    <button
                      v-if="!isEditingProfile"
                      class="btn btn-cinema-primary btn-sm"
                      @click="isEditingProfile = true"
                    >
                      <i class="fas fa-edit me-2"></i>
                      Chỉnh sửa
                    </button>
                    <button
                      v-if="!isGoogleAccount"
                      class="btn btn-warning btn-sm"
                      @click="isChangingPassword = true"
                    >
                      <i class="fas fa-key me-2"></i>
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>

                <!-- Edit Mode for Customer -->
                <CustomerForm
                  v-if="isEditingProfile"
                  :initial-values="customerInitialValues"
                  :is-loading="updateCustomerMutation.isLoading"
                  @submit="handleUpdateProfile"
                  @cancel="isEditingProfile = false"
                />

                <!-- View Mode for Customer -->
                <div v-else class="customer-view">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <strong>Số điện thoại:</strong>
                      <p>{{ currentUser.phone_number || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Email:</strong>
                      <p>{{ currentUser.email || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Giới tính:</strong>
                      <p>{{ formatGender(currentUser.gender) || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Ngày sinh:</strong>
                      <p>
                        {{
                          currentUser.date_of_birth
                            ? new Date(currentUser.date_of_birth).toLocaleDateString('vi-VN')
                            : 'Chưa cập nhật'
                        }}
                      </p>
                    </div>
                    <div class="col-12 mb-3">
                      <strong>Địa chỉ:</strong>
                      <p>{{ currentUser.address || 'Chưa cập nhật' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Employee/Admin Profile (Read-only) -->
              <div v-else-if="isEmployee || isAdmin">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="border-bottom pb-2 mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Thông tin cá nhân
                  </h6>
                  <button
                    v-if="!isGoogleAccount"
                    class="btn btn-warning btn-sm"
                    @click="isChangingPassword = true"
                  >
                    <i class="fas fa-key me-2"></i>
                    Đổi mật khẩu
                  </button>
                </div>

                <div class="employee-view">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <strong>Số điện thoại:</strong>
                      <p>{{ currentUser.phone_number || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Email:</strong>
                      <p>{{ currentUser.email || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Giới tính:</strong>
                      <p>{{ formatGender(currentUser.gender) || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Ngày sinh:</strong>
                      <p>
                        {{
                          currentUser.date_of_birth
                            ? new Date(currentUser.date_of_birth).toLocaleDateString('vi-VN')
                            : 'Chưa cập nhật'
                        }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <strong>Chức vụ:</strong>
                      <p>{{ currentUser.position || 'Chưa cập nhật' }}</p>
                    </div>
                    <div class="col-12 mb-3">
                      <strong>Địa chỉ:</strong>
                      <p>{{ currentUser.address || 'Chưa cập nhật' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-secondary" @click="goBack">
                  <i class="fas fa-arrow-left me-2"></i>
                  Quay lại
                </button>
              </div>
            </div>

            <!-- Loading state -->
            <div v-else class="card-body text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2">Đang tải thông tin người dùng...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-cinema-primary {
  background-color: #e50914 !important;
}

.btn-cinema-primary {
  background-color: #e50914;
  border-color: #e50914;
  color: white;
}

.btn-cinema-primary:hover {
  background-color: #b8070f;
  border-color: #b8070f;
}

.customer-view p,
.employee-view p {
  margin-bottom: 0.5rem;
  color: #6c757d;
}
</style>
