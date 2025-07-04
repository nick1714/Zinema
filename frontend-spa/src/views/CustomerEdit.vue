<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomer, useCustomers, useAuth } from '@/composables/useAuth'
import CustomerForm from '@/components/CustomerForm.vue'

const router = useRouter()
const route = useRoute()
const customerId = computed(() => route.params.id)

const { currentUser, canManageCustomers, isCustomer } = useAuth()
const { data: customerData, isLoading, isError } = useCustomer(customerId)
const { updateCustomer } = useCustomers()

const isEditing = ref(false)

// Check permissions
const canEdit = computed(() => {
  if (canManageCustomers.value) return true
  if (isCustomer.value && customerData.value?.customer) {
    return customerData.value.customer.account_id === currentUser.value?.id
  }
  return false
})

// Redirect if not authorized
if (!canEdit.value && !isLoading.value) {
  router.push('/403')
}

// Form initial values
const initialValues = computed(() => {
  if (!customerData.value?.customer) return {}

  const customer = customerData.value.customer
  return {
    full_name: customer.full_name || '',
    phone_number: customer.phone_number || '',
    address: customer.address || '',
    date_of_birth: customer.date_of_birth ? customer.date_of_birth.slice(0, 10) : '',
    gender: customer.gender || '',
    email: customer.email || '',
    loyalty_points: customer.loyalty_points || '',
  }
})

async function handleUpdateCustomer(values) {
  try {
    await updateCustomer.mutate({
      id: parseInt(customerId.value),
      data: values,
    })

    isEditing.value = false
    alert('Cập nhật thông tin khách hàng thành công!')
  } catch (error) {
    console.error('Update customer error:', error)
    alert('Có lỗi xảy ra khi cập nhật thông tin!')
  }
}

function goBack() {
  router.go(-1)
}
</script>

<template>
  <div class="customer-edit-page">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2">Đang tải thông tin khách hàng...</p>
          </div>

          <!-- Error -->
          <div v-else-if="isError" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Không tìm thấy thông tin khách hàng.
            <button class="btn btn-link p-0" @click="goBack">Quay lại</button>
          </div>

          <!-- Customer Info -->
          <div v-else-if="customerData?.customer" class="card">
            <div class="card-header bg-cinema-primary text-white">
              <h4 class="mb-0">
                <i class="fas fa-user me-2"></i>
                Chi tiết khách hàng
              </h4>
            </div>

            <div class="card-body">
              <!-- Customer Avatar & Info -->
              <div class="text-center mb-4">
                <i class="fas fa-user-circle fa-5x text-muted mb-3"></i>
                <h5>{{ customerData.customer.full_name }}</h5>
                <span class="badge text-bg-info">Khách hàng</span>
              </div>

              <!-- Edit Form -->
              <CustomerForm
                v-if="isEditing && canEdit"
                :initial-values="initialValues"
                :is-loading="updateCustomer.isLoading"
                @submit="handleUpdateCustomer"
                @cancel="isEditing = false"
              />

              <!-- View Mode -->
              <div v-else class="customer-view">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <strong>Số điện thoại:</strong>
                    <p>{{ customerData.customer.phone_number }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Ngày sinh:</strong>
                    <p>
                      {{
                        customerData.customer.date_of_birth
                          ? new Date(customerData.customer.date_of_birth).toLocaleDateString(
                              'vi-VN',
                            )
                          : 'Chưa cập nhật'
                      }}
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Giới tính:</strong>
                    <p>{{ customerData.customer.gender || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Email:</strong>
                    <p>{{ customerData.customer.email || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <strong>Điểm thưởng:</strong>
                    <p>{{ customerData.customer.loyalty_points || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="col-12 mb-3">
                    <strong>Địa chỉ:</strong>
                    <p>{{ customerData.customer.address || 'Chưa cập nhật' }}</p>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button v-if="canEdit" class="btn btn-cinema-primary" @click="isEditing = true">
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

.customer-view p {
  margin-bottom: 0.5rem;
  color: #6c757d;
}
</style>
