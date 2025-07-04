<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEmployee, useEmployees, useAuth } from '@/composables/useAuth'
import EmployeeForm from '@/components/EmployeeForm.vue'

const router = useRouter()
const route = useRoute()
const employeeId = computed(() => route.params.id)

const { canManageEmployees } = useAuth()
const { data: employeeData, isLoading, isError } = useEmployee(employeeId)
const { updateEmployee } = useEmployees()

const isEditing = ref(false)

// Redirect if not authorized
if (!canManageEmployees.value) {
  router.push('/403')
}

// Form initial values
const initialValues = computed(() => {
  if (!employeeData.value?.employee) return {}

  const employee = employeeData.value.employee
  return {
    full_name: employee.full_name || '',
    phone_number: employee.phone_number || '',
    email: employee.email || '',
    address: employee.address || '',
    date_of_birth: employee.date_of_birth ? employee.date_of_birth.slice(0, 10) : '',
    gender: employee.gender || '',
    position: employee.position || '',
  }
})

async function handleUpdateEmployee(values) {
  try {
    await updateEmployee.mutate({
      id: parseInt(employeeId.value),
      data: values,
    })

    isEditing.value = false
    alert('Cập nhật thông tin nhân viên thành công!')
  } catch (error) {
    console.error('Update employee error:', error)
    alert('Có lỗi xảy ra khi cập nhật thông tin!')
  }
}

function goBack() {
  router.go(-1)
}

function formatRole(role) {
  const roleMap = {
    admin: 'Quản trị viên',
    employee: 'Nhân viên',
  }
  return roleMap[role] || role
}
</script>

<template>
  <div class="employee-edit-page">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2">Đang tải thông tin nhân viên...</p>
          </div>

          <!-- Error -->
          <div v-else-if="isError" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Không tìm thấy thông tin nhân viên.
            <button class="btn btn-link p-0" @click="goBack">Quay lại</button>
          </div>

          <!-- Employee Info -->
          <div v-else-if="employeeData?.employee" class="card">
            <div class="card-header bg-cinema-primary text-white">
              <h4 class="mb-0">
                <i class="fas fa-user-tie me-2"></i>
                Chi tiết nhân viên
              </h4>
            </div>

            <div class="card-body">
              <!-- Employee Avatar & Info -->
              <div class="text-center mb-4">
                <i class="fas fa-user-circle fa-5x text-muted mb-3"></i>
                <h5>{{ employeeData.employee.full_name }}</h5>
                <span class="badge text-bg-warning">
                  {{ formatRole(employeeData.employee.role) }}
                </span>
              </div>

              <!-- Edit Form -->
              <EmployeeForm
                v-if="isEditing"
                is-edit-mode
                :initial-values="initialValues"
                :is-loading="updateEmployee.isLoading"
                @submit="handleUpdateEmployee"
                @cancel="isEditing = false"
              />

              <!-- View Mode -->
              <div v-else class="employee-view">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <strong>Mã nhân viên:</strong>
                    <p>{{ employeeData.employee.id }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Số điện thoại:</strong>
                    <p>{{ employeeData.employee.phone_number }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Email:</strong>
                    <p>{{ employeeData.employee.email || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Giới tính:</strong>
                    <p>{{ employeeData.employee.gender || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Ngày sinh:</strong>
                    <p>
                      {{
                        employeeData.employee.date_of_birth
                          ? new Date(employeeData.employee.date_of_birth).toLocaleDateString(
                              'vi-VN',
                            )
                          : 'Chưa cập nhật'
                      }}
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Vị trí:</strong>
                    <p>{{ employeeData.employee.position || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-12 mb-3">
                    <strong>Địa chỉ:</strong>
                    <p>{{ employeeData.employee.address || 'Chưa cập nhật' }}</p>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button class="btn btn-cinema-primary" @click="isEditing = true">
                    <i class="fas fa-edit me-2"></i>
                    Chỉnh sửa thông tin
                  </button>
                  <button class="btn btn-secondary" @click="goBack">
                    <i class="fas fa-arrow-left me-2"></i>
                    Quay lại
                  </button>
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

.error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.employee-view p {
  margin-bottom: 0.5rem;
  color: #6c757d;
}
</style>
