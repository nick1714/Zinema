<template>
  <div class="check-booking-container">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <i class="fas fa-search me-2"></i>
          Kiểm tra mã đặt vé
        </h1>
        <p class="page-subtitle">Tra cứu thông tin chi tiết booking của khách hàng</p>
      </div>
    </div>

    <div class="container py-5">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-card">
          <div class="search-form">
            <div class="input-group">
              <input
                type="text"
                v-model="bookingCode"
                placeholder="Nhập mã đặt vé (ví dụ: BK20250711454)"
                class="booking-input"
                @keyup.enter="handleCheckBooking"
              />
              <button @click="handleCheckBooking" :disabled="isLoading" class="search-btn">
                <i v-if="!isLoading" class="fas fa-search"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ isLoading ? 'Đang tìm...' : 'Kiểm tra' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-section">
        <div class="loading-card">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin booking...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-section">
        <div class="error-card">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Không tìm thấy</h3>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Booking Details -->
      <div v-if="bookingDetails" class="booking-details-section">
        <div class="booking-card">
          <!-- Header -->
          <div class="booking-header">
            <div class="movie-info">
              <h2 class="movie-title">{{ bookingDetails.movie_title }}</h2>
              <div class="booking-meta">
                <span class="booking-code">
                  <i class="fas fa-ticket-alt"></i>
                  {{ bookingDetails.booking_code }}
                </span>
                <span class="booking-status" :class="statusClass">
                  <i class="fas fa-circle"></i>
                  {{ getStatusText(bookingDetails.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Customer & Showtime Info -->
          <div class="booking-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <i class="fas fa-user"></i>
                  Khách hàng
                </div>
                <div class="info-value">{{ bookingDetails.customer_name }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <i class="fas fa-phone"></i>
                  Điện thoại
                </div>
                <div class="info-value">{{ bookingDetails.customer_phone }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <i class="fas fa-door-open"></i>
                  Phòng chiếu
                </div>
                <div class="info-value">{{ bookingDetails.room_name }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <i class="fas fa-clock"></i>
                  Suất chiếu
                </div>
                <div class="info-value">{{ formatDateTime(bookingDetails.start_time) }}</div>
              </div>
            </div>

            <!-- Seats Section -->
            <div class="details-section">
              <h3 class="section-title">
                <i class="fas fa-chair"></i>
                Chi tiết vé
              </h3>
              <div class="seats-display">
                <span class="seat-label">Ghế:</span>
                <div class="seats-list">
                  <span v-for="ticket in bookingDetails.tickets" :key="ticket.id" class="seat-tag">
                    {{ ticket.seat_name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Food Section -->
            <div
              v-if="bookingDetails.food_orders && bookingDetails.food_orders.length > 0"
              class="details-section"
            >
              <h3 class="section-title">
                <i class="fas fa-utensils"></i>
                Đồ ăn & Nước uống
              </h3>
              <div class="food-list">
                <div v-for="food in bookingDetails.food_orders" :key="food.id" class="food-item">
                  <span class="food-name">{{ food.food_name }}</span>
                  <span class="food-quantity">x{{ food.quantity }}</span>
                </div>
              </div>
            </div>

            <!-- Total Amount -->
            <div class="total-section">
              <div class="total-amount">
                <span class="total-label">Tổng cộng:</span>
                <span class="total-value">{{ formatPrice(bookingDetails.invoice.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import bookingService from '@/services/booking.service'

const bookingCode = ref('')
const bookingDetails = ref(null)
const isLoading = ref(false)
const error = ref(null)

async function handleCheckBooking() {
  if (!bookingCode.value.trim()) {
    error.value = 'Vui lòng nhập mã đặt vé.'
    return
  }

  isLoading.value = true
  error.value = null
  bookingDetails.value = null

  try {
    const response = await bookingService.getBookingByCode(bookingCode.value.trim())
    bookingDetails.value = response.data
  } catch (err) {
    error.value = err.message || 'Không tìm thấy thông tin hoặc đã có lỗi xảy ra.'
  } finally {
    isLoading.value = false
  }
}

const statusClass = computed(() => {
  if (!bookingDetails.value) return 'status-default'
  switch (bookingDetails.value.status) {
    case 'confirmed':
      return 'status-confirmed'
    case 'pending':
      return 'status-pending'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-default'
  }
})

function getStatusText(status) {
  const statusMap = {
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
  }
  return statusMap[status] || status
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return ''
  return new Date(dateTimeString).toLocaleString('vi-VN', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price) {
  if (price === undefined || price === null) return '0đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}
</script>

<style scoped>
/* Page Container */
.check-booking-container {
  min-height: 100vh;
  background: var(--cinema-gradient-dark);
  color: var(--cinema-text);
}

/* Page Header */
.page-header {
  background: rgba(4, 4, 4, 0.8);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-title {
  color: var(--cinema-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--cinema-text-muted);
  font-size: 1.1rem;
}

/* Search Section */
.search-section {
  margin-bottom: 3rem;
}

.search-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-width: 600px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.booking-input {
  flex: 1;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--cinema-text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.booking-input::placeholder {
  color: var(--cinema-text-muted);
}

.booking-input:focus {
  outline: none;
  border-color: var(--cinema-primary);
  box-shadow: 0 0 0 3px rgba(247, 197, 72, 0.1);
  background: rgba(255, 255, 255, 0.15);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: var(--cinema-gradient-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(247, 197, 72, 0.3);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Loading Section */
.loading-section {
  text-align: center;
  margin: 3rem 0;
}

.loading-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-width: 400px;
  margin: 0 auto;
}

.loading-card i {
  font-size: 2rem;
  color: var(--cinema-primary);
  margin-bottom: 1rem;
}

.loading-card p {
  color: var(--cinema-text-muted);
  font-size: 1.1rem;
}

/* Error Section */
.error-section {
  margin: 3rem 0;
}

.error-card {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-card i {
  font-size: 2rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-card h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-card p {
  color: var(--cinema-text-muted);
}

/* Booking Details */
.booking-details-section {
  margin-top: 3rem;
}

.booking-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
}

.booking-header {
  background: rgba(4, 4, 4, 0.5);
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.movie-title {
  color: var(--cinema-text);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.booking-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.booking-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinema-primary);
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 1.1rem;
}

.booking-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-confirmed {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.status-default {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

/* Booking Content */
.booking-content {
  padding: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinema-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-value {
  color: var(--cinema-text);
  font-size: 1.1rem;
  font-weight: 500;
}

/* Details Sections */
.details-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinema-primary);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Seats Display */
.seats-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.seat-label {
  color: var(--cinema-text-muted);
  font-weight: 600;
  min-width: 50px;
}

.seats-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.seat-tag {
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Food List */
.food-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.food-name {
  color: var(--cinema-text);
  font-weight: 500;
}

.food-quantity {
  color: var(--cinema-primary);
  font-weight: 600;
  background: rgba(247, 197, 72, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

/* Total Section */
.total-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(247, 197, 72, 0.3);
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(247, 197, 72, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(247, 197, 72, 0.3);
}

.total-label {
  color: var(--cinema-text);
  font-size: 1.3rem;
  font-weight: 600;
}

.total-value {
  color: var(--cinema-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .input-group {
    flex-direction: column;
  }

  .booking-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .seats-display {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-amount {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
