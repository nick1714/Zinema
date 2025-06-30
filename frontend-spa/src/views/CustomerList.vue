<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserCard from '@/components/UserCard.vue'
import InputSearch from '@/components/InputSearch.vue'
import { useCustomers, useAuth } from '@/composables/useAuth'

const router = useRouter()
const { customers, isLoading, isError, refetch } = useCustomers()
const { canManageCustomers, isCustomer } = useAuth()

// Redirect if customer trying to access customer list
if (isCustomer.value) {
  router.push('/profile')
}

const searchText = ref('')

// Search functionality
const searchableCustomers = computed(() =>
  customers.value.map((customer) => {
    const { name, full_name, phone_number, email } = customer
    return [name, full_name, phone_number, email].join('').toLowerCase()
  }),
)

const filteredCustomers = computed(() => {
  if (!searchText.value) return customers.value

  return customers.value.filter((customer, index) =>
    searchableCustomers.value[index].includes(searchText.value.toLowerCase()),
  )
})

function goToCustomerDetail(customer) {
  router.push({
    name: 'customer.detail',
    params: { id: customer.id },
  })
}

function editCustomer(customer) {
  router.push({
    name: 'customer.edit',
    params: { id: customer.id },
  })
}
</script>

<template>
  <div class="customer-list-page">
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i class="fas fa-users me-2"></i>
          Quản lý khách hàng
        </h2>

        <button class="btn btn-outline-primary" @click="refetch" :disabled="isLoading">
          <i class="fas fa-sync-alt me-1"></i>
          Làm mới
        </button>
      </div>

      <!-- Search -->
      <div class="row mb-4">
        <div class="col-md-6">
          <InputSearch v-model="searchText" placeholder="Tìm kiếm khách hàng..." />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải danh sách khách hàng...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Có lỗi xảy ra khi tải danh sách khách hàng.
        <button class="btn btn-link p-0" @click="refetch">Thử lại</button>
      </div>

      <!-- Customer List -->
      <div v-else-if="filteredCustomers.length > 0" class="row">
        <div
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="col-lg-6 col-xl-4 mb-3"
        >
          <UserCard
            :user="customer"
            :show-actions="true"
            :can-edit="canManageCustomers"
            @view-details="goToCustomerDetail"
            @edit="editCustomer"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h5>Không tìm thấy khách hàng nào</h5>
        <p class="text-muted">
          {{
            searchText ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có khách hàng nào trong hệ thống'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed - using bootstrap */
</style>
