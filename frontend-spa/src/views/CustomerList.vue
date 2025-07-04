<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserCard from '@/components/UserCard.vue'
import InputSearch from '@/components/InputSearch.vue'
import { useCustomers, useAuth } from '@/composables/useAuth'

const router = useRouter()
const { customers, isLoading, isError, refetch } = useCustomers()
const { canManageCustomers, isCustomer } = useAuth()

/**
 * Chuyển hướng nếu khách hàng cố gắng truy cập danh sách khách hàng
 */
if (isCustomer.value) {
  router.push('/profile')
}

// Từ khóa tìm kiếm
const searchText = ref('')

/**
 * Tạo danh sách các text có thể tìm kiếm từ thông tin khách hàng
 */
const searchableCustomers = computed(() =>
  customers.value.map((customer) => {
    const { name, full_name, phone_number, email } = customer
    return [name, full_name, phone_number, email].join('').toLowerCase()
  }),
)

/**
 * Lọc danh sách khách hàng dựa trên từ khóa tìm kiếm
 */
const filteredCustomers = computed(() => {
  if (!searchText.value) return customers.value

  return customers.value.filter((customer, index) =>
    searchableCustomers.value[index].includes(searchText.value.toLowerCase()),
  )
})

/**
 * Chuyển đến trang chi tiết khách hàng
 * @param {Object} customer - Thông tin khách hàng
 */
function goToCustomerDetail(customer) {
  router.push({
    name: 'customer.detail',
    params: { id: customer.id },
  })
}
</script>

<template>
  <div class="cinema-page customer-list">
    <!-- Page header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-title">
            <h1><i class="fas fa-users"></i> Quản Lý Khách Hàng</h1>
            <p>Quản lý danh sách khách hàng của rạp phim</p>
          </div>
          
          <div class="header-actions">
            <button class="refresh-btn" @click="refetch" :disabled="isLoading">
              <i class="fas fa-sync-alt" :class="{'fa-spin': isLoading}"></i>
              <span>{{ isLoading ? 'Đang tải...' : 'Làm mới' }}</span>
            </button>
          </div>
        </div>
        
        <!-- Search bar -->
        <div class="search-container">
          <InputSearch v-model="searchText" placeholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..." />
        </div>
      </div>
    </div>
    
    <!-- Page content -->
    <div class="page-content">
      <div class="container">
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-state">
          <div class="loader">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="isError" class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Đã xảy ra lỗi!</h3>
          <p>Không thể tải danh sách khách hàng. Vui lòng thử lại.</p>
          <button class="btn-cinema" @click="refetch">
            <i class="fas fa-redo"></i>
            Thử lại
          </button>
        </div>

        <!-- Customer list -->
        <div v-else-if="filteredCustomers.length > 0" class="customer-grid">
          <UserCard
            v-for="customer in filteredCustomers"
            :key="customer.id"
            :user="customer"
            :show-actions="true"
            :can-edit="canManageCustomers"
            @view-details="goToCustomerDetail"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3>Không tìm thấy khách hàng</h3>
          <p v-if="searchText">
            Không có khách hàng nào khớp với từ khóa "{{ searchText }}".
            <br />Hãy thử tìm kiếm với từ khóa khác.
          </p>
          <p v-else>Chưa có khách hàng nào trong hệ thống.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page container */
.cinema-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1.5rem;
  position: relative;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-title {
  flex: 1;
}

.header-title h1 {
  color: var(--cinema-primary);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title p {
  color: var(--cinema-text-muted);
  margin: 0;
}

/* Buttons */
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(247, 197, 72, 0.1);
  border: 1px solid rgba(247, 197, 72, 0.3);
  color: var(--cinema-primary);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.refresh-btn:hover {
  background: rgba(247, 197, 72, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Search container */
.search-container {
  max-width: 600px;
}

/* Customer grid */
.customer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Page content */
.page-content {
  flex: 1;
  padding: 0 0 3rem;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.loader {
  font-size: 3rem;
  color: var(--cinema-primary);
  margin-bottom: 1.5rem;
}

/* Error state */
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  font-size: 3rem;
  color: var(--cinema-secondary);
  margin-bottom: 1.5rem;
}

.error-state h3 {
  color: var(--cinema-text);
  margin-bottom: 1rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.empty-icon {
  font-size: 3rem;
  color: var(--cinema-text-muted);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: var(--cinema-text);
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .customer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
