<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, usePasswordChange } from '@/composables/useAuth'
import CustomerForm from '@/components/CustomerForm.vue'
import ChangePasswordForm from '@/components/ChangePasswordForm.vue'

// Only import updateCustomer mutation, not the whole useCustomers (which calls getAllCustomers)
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const { currentUser, userRole, isCustomer, isEmployee, isAdmin, setCurrentUser } = useAuth()
const { changePassword, isChangingPassword: isPasswordLoading } = usePasswordChange()

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
    await changePassword.mutateAsync(values)
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
  if (isAdmin.value) {
    router.push('/admin')
  } else if (isEmployee.value) {
    router.push('/staff')
  } else if (isCustomer.value) {
    // Customer goes to movies
    router.push('/')
  } else {
    // Fallback to login page
    router.push('/login')
  }
}
</script>

<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-user-circle me-2"></i>
            Thông tin cá nhân
          </h1>
          <button class="btn-back" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>
            Quay lại
          </button>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- Loading state -->
      <div v-if="!currentUser" class="loading-container">
        <div class="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content-card">
        <!-- Welcome message for first-time users -->
        <div v-if="isFirstTimeUser" class="welcome-alert" role="alert">
          <i class="fas fa-info-circle me-2"></i>
          <strong>Chào mừng bạn đến với Cinema!</strong>
          <p class="mb-0 mt-2">Vui lòng cập nhật đầy đủ thông tin cá nhân để có trải nghiệm tốt nhất.</p>
        </div>

        <div class="profile-grid">
          <!-- Left Panel: User Info -->
          <div class="user-info-panel">
            <div class="avatar-section">
              <i class="fas fa-user-circle avatar-icon"></i>
              <h4 class="user-name">{{ currentUser.full_name }}</h4>
              <span class="user-role">{{ formatRole(userRole) }}</span>
            </div>
            <div class="actions-panel">
              <button
                v-if="isCustomer && !isEditingProfile && !isChangingPassword"
                class="btn-action-primary"
                @click="isEditingProfile = true"
              >
                <i class="fas fa-edit me-2"></i>
                Chỉnh sửa thông tin
              </button>
              <button
                v-if="!isGoogleAccount && !isChangingPassword"
                class="btn-action"
                @click="isChangingPassword = true"
              >
                <i class="fas fa-key me-2"></i>
                Đổi mật khẩu
              </button>
            </div>
          </div>

          <!-- Right Panel: Forms or Details -->
          <div class="details-panel">
            <!-- Password Change Form -->
            <div v-if="isChangingPassword">
              <h5 class="panel-title">
                <i class="fas fa-key me-2"></i>
                Tạo mật khẩu mới
              </h5>
              <ChangePasswordForm
                :is-loading="isPasswordLoading"
                @submit="handleChangePassword"
                @cancel="isChangingPassword = false"
              />
            </div>

            <!-- Customer Profile -->
            <div v-else-if="isCustomer">
              <h5 class="panel-title">
                <i class="fas fa-info-circle me-2"></i>
                Chi tiết tài khoản
              </h5>
              <!-- Edit Mode -->
              <CustomerForm
                v-if="isEditingProfile"
                :initial-values="customerInitialValues"
                :is-loading="updateCustomerMutation.isPending"
                @submit="handleUpdateProfile"
                @cancel="isEditingProfile = false"
              />
              <!-- View Mode -->
              <div v-else class="details-view">
                <div class="detail-item">
                  <span class="detail-label">Số điện thoại:</span>
                  <span class="detail-value">{{ currentUser.phone_number || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ currentUser.email || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Giới tính:</span>
                  <span class="detail-value">{{ formatGender(currentUser.gender) || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Ngày sinh:</span>
                  <span class="detail-value">{{
                    currentUser.date_of_birth
                      ? new Date(currentUser.date_of_birth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'
                  }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Địa chỉ:</span>
                  <span class="detail-value">{{ currentUser.address || 'Chưa cập nhật' }}</span>
                </div>
              </div>
            </div>

            <!-- Employee/Admin Profile (Read-only) -->
            <div v-else-if="isEmployee || isAdmin">
              <h5 class="panel-title">
                <i class="fas fa-info-circle me-2"></i>
                Chi tiết tài khoản
              </h5>
              <div class="details-view">
                <div class="detail-item">
                  <span class="detail-label">Số điện thoại:</span>
                  <span class="detail-value">{{ currentUser.phone_number || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ currentUser.email || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Giới tính:</span>
                  <span class="detail-value">{{ formatGender(currentUser.gender) || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Ngày sinh:</span>
                  <span class="detail-value">{{
                    currentUser.date_of_birth
                      ? new Date(currentUser.date_of_birth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Chức vụ:</span>
                  <span class="detail-value">{{ currentUser.position || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Địa chỉ:</span>
                  <span class="detail-value">{{ currentUser.address || 'Chưa cập nhật' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  color: var(--cinema-primary);
  font-size: 2.2rem;
  margin: 0;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: var(--cinema-text);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(247, 197, 72, 0.1);
  border-left-color: var(--cinema-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Profile Card */
.profile-content-card {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.welcome-alert {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

/* Left Panel */
.user-info-panel {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.avatar-icon {
  font-size: 6rem;
  color: var(--cinema-primary);
  margin-bottom: 1rem;
}

.user-name {
  font-size: 1.5rem;
  color: var(--cinema-text);
  margin-bottom: 0.5rem;
}

.user-role {
  display: inline-block;
  background: rgba(247, 197, 72, 0.1);
  color: var(--cinema-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.actions-panel {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-action,
.btn-action-primary {
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action-primary {
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
}
.btn-action-primary:hover {
  filter: brightness(1.1);
}

.btn-action {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
}
.btn-action:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Right Panel */
.details-panel {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 2rem;
}

.panel-title {
  color: var(--cinema-text);
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  font-size: 1.25rem;
}

.details-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--cinema-text-muted);
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: var(--cinema-text);
}

/* Responsive */
@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .details-view {
    grid-template-columns: 1fr;
  }
  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>
