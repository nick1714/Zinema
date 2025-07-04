<script setup>
import { useRouter } from 'vue-router'
import { useEmployees, useAuth } from '@/composables/useAuth'
import EmployeeForm from '@/components/EmployeeForm.vue'

const router = useRouter()
const { registerEmployee } = useEmployees()
const { canManageEmployees } = useAuth()

// Redirect if not authorized
if (!canManageEmployees.value) {
  router.push({ name: 'notfound' })
}

async function handleSubmit(values) {
  try {
    await registerEmployee.mutate(values)

    alert('Đăng ký nhân viên thành công!')
    router.push({ name: 'employee.list' })
  } catch (error) {
    console.error('Register employee error:', error)
    alert('Có lỗi xảy ra khi đăng ký nhân viên!')
  }
}

function goBack() {
  router.go(-1)
}
</script>

<template>
  <div class="employee-add-page">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header bg-cinema-primary text-white">
              <h4 class="mb-0">
                <i class="fas fa-user-plus me-2"></i>
                Đăng ký nhân viên mới
              </h4>
            </div>

            <div class="card-body">
              <EmployeeForm
                :is-loading="registerEmployee.isLoading"
                @submit="handleSubmit"
                @cancel="goBack"
              />
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

.error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
