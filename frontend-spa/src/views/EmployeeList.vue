<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserCard from '@/components/UserCard.vue'
import InputSearch from '@/components/InputSearch.vue'
import { useEmployees, useAuth } from '@/composables/useAuth'

const router = useRouter()
const { employees, isLoading, isError, refetch } = useEmployees()
const { canManageEmployees } = useAuth()

const searchText = ref('')

// Search functionality
const searchableEmployees = computed(() =>
  employees.value.map((employee) => {
    const { full_name, id, account_id, phone_number, email, gender, position } = employee
    return [full_name, id, account_id, phone_number, email, gender, position].join('').toLowerCase()
  }),
)

const filteredEmployees = computed(() => {
  if (!searchText.value) return employees.value

  return employees.value.filter((employee, index) =>
    searchableEmployees.value[index].includes(searchText.value.toLowerCase()),
  )
})

function goToAddEmployee() {
  router.push({ name: 'employee.add' })
}

function goToEmployeeDetail(employee) {
  router.push({
    name: 'employee.detail',
    params: { id: employee.id },
  })
}

function editEmployee(employee) {
  router.push({
    name: 'employee.edit',
    params: { id: employee.id },
  })
}
</script>

<template>
  <div class="employee-list-page">
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i class="fas fa-users me-2"></i>
          Quản lý nhân viên
        </h2>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="refetch" :disabled="isLoading">
            <i class="fas fa-sync-alt me-1"></i>
            Làm mới
          </button>

          <button v-if="canManageEmployees" class="btn btn-cinema-primary" @click="goToAddEmployee">
            <i class="fas fa-plus me-1"></i>
            Thêm nhân viên
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="row mb-4">
        <div class="col-md-6">
          <InputSearch v-model="searchText" placeholder="Tìm kiếm nhân viên..." />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải danh sách nhân viên...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Có lỗi xảy ra khi tải danh sách nhân viên.
        <button class="btn btn-link p-0" @click="refetch">Thử lại</button>
      </div>

      <!-- Employee List -->
      <div v-else-if="filteredEmployees.length > 0" class="row">
        <div
          v-for="employee in filteredEmployees"
          :key="employee.id"
          class="col-lg-6 col-xl-4 mb-3"
        >
          <UserCard
            :user="employee"
            :show-actions="true"
            :can-edit="canManageEmployees"
            @view-details="goToEmployeeDetail"
            @edit="editEmployee"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h5>Không tìm thấy nhân viên nào</h5>
        <p class="text-muted">
          {{
            searchText ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có nhân viên nào trong hệ thống'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-cinema-primary {
  background-color: #e50914;
  border-color: #e50914;
  color: white;
}

.btn-cinema-primary:hover {
  background-color: #b8070f;
  border-color: #b8070f;
}
</style>
