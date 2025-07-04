<script setup>
import { ref, computed } from 'vue'
import { useAuth, useCustomers, usePasswordChange } from '@/composables/useAuth'
import CustomerForm from '@/components/CustomerForm.vue'
import ChangePasswordForm from '@/components/ChangePasswordForm.vue'

const { currentUser, userRole, isCustomer, isEmployee, isAdmin, setCurrentUser } = useAuth()
const { updateCustomer } = useCustomers()
const { changePassword, isChangingPassword: isPasswordLoading } = usePasswordChange()

const isEditingProfile = ref(false)
const isChangingPassword = ref(false)

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
    const resp = await updateCustomer.mutateAsync({
      id: userId,
      data: values,
    })

    // resp has shape { customer: {...} } from backend
    const newProfile = resp?.customer ?? values
    setCurrentUser(newProfile)

    isEditingProfile.value = false
    alert('Cập nhật thông tin thành công!')
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
                  :is-loading="updateCustomer.isLoading"
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
