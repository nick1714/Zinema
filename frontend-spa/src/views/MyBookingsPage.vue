<template>
  <div class="my-bookings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <i class="fas fa-history me-2"></i>
          Lịch sử đặt vé
        </h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin"></i>
        <p>Đang tải lịch sử đặt vé...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Đã xảy ra lỗi</h3>
        <p>{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Vé sắp chiếu -->
        <section class="booking-section">
          <h2 class="section-title">Vé sắp chiếu</h2>
          <div v-if="validBookings.length > 0" class="bookings-grid">
            <div
              v-for="booking in validBookings"
              :key="booking.id"
              class="booking-card upcoming"
            >
              <div class="card-header">
                <h3 class="movie-title">{{ booking.movie_title }}</h3>
                <span class="status-badge" :class="`status-${booking.status}`">{{
                  booking.status
                }}</span>
              </div>
              <div class="card-body">
                <p class="info-item">
                  <i class="fas fa-barcode"></i>
                  <strong>Mã đặt vé:</strong>
                  <span>{{ booking.booking_code }}</span>
                </p>
                <p class="info-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <strong>Rạp:</strong> {{ booking.room_name }}
                </p>
                <p class="info-item">
                  <i class="fas fa-calendar-alt"></i>
                  <strong>Suất chiếu:</strong> {{ formatDateTime(booking.start_time) }}
                </p>
              </div>
              <div class="card-footer">
                <div class="info-item">
                  <i class="fas fa-couch"></i>
                  <strong>Ghế:</strong>
                  <span class="seat-list">{{ formatSeatList(booking.tickets) }}</span>
                </div>
                <div
                  v-if="booking.food_orders && booking.food_orders.length > 0"
                  class="info-item"
                >
                  <i class="fas fa-cookie-bite"></i>
                  <strong>Đồ ăn & nước uống:</strong>
                  <ul class="food-list">
                    <li v-for="food in booking.food_orders" :key="food.id">
                      {{ food.food_name }} (x{{ food.quantity }})
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-section">
            <p>Bạn không có vé nào sắp chiếu.</p>
          </div>
        </section>

        <!-- Vé đã xem -->
        <section class="booking-section mt-10">
          <h2 class="section-title">Vé đã xem</h2>
          <div v-if="pastBookings.length > 0" class="bookings-grid">
            <div v-for="booking in pastBookings" :key="booking.id" class="booking-card past">
              <div class="card-header">
                <h3 class="movie-title">{{ booking.movie_title }}</h3>
                <span class="status-badge" :class="`status-${booking.status}`">{{
                  booking.status
                }}</span>
              </div>
              <div class="card-body">
                <p class="info-item">
                  <i class="fas fa-barcode"></i>
                  <strong>Mã đặt vé:</strong>
                  <span>{{ booking.booking_code }}</span>
                </p>
                <p class="info-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <strong>Rạp:</strong> {{ booking.room_name }}
                </p>
                <p class="info-item">
                  <i class="fas fa-calendar-alt"></i>
                  <strong>Suất chiếu:</strong> {{ formatDateTime(booking.start_time) }}
                </p>
              </div>
               <div class="card-footer">
                <div class="info-item">
                  <i class="fas fa-couch"></i>
                  <strong>Ghế:</strong>
                  <span class="seat-list">{{ formatSeatList(booking.tickets) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-section">
            <p>Lịch sử xem phim của bạn trống.</p>
          </div>
        </section>

        <!-- No bookings at all -->
        <div
          v-if="validBookings.length === 0 && pastBookings.length === 0"
          class="empty-state-full-page"
        >
          <i class="fas fa-ticket-alt"></i>
          <h3>Bạn chưa có lịch sử đặt vé nào.</h3>
          <router-link to="/" class="btn-primary"> Đặt vé ngay </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import bookingService from '@/services/booking.service'

const bookings = ref([])
const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const response = await bookingService.getMyBookings({ status: 'confirmed' })
    bookings.value = response.data
  } catch (err) {
    error.value = err.message || 'Không thể tải lịch sử đặt vé.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

const now = new Date()

const validBookings = computed(() => {
  return bookings.value.filter((b) => new Date(b.start_time) > now)
})

const pastBookings = computed(() => {
  return bookings.value.filter((b) => new Date(b.start_time) <= now)
})

function formatDateTime(dateTimeString) {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  return new Date(dateTimeString).toLocaleString('vi-VN', options).replace(',', ' ')
}

function formatSeatList(tickets) {
  if (!tickets || tickets.length === 0) return 'Không có'
  return tickets.map((ticket) => ticket.seat_name).join(', ')
}
</script>

<style scoped>
.my-bookings-page {
  color: var(--cinema-text);
}

/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-title {
  color: var(--cinema-primary);
  font-size: 2.2rem;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.loading-state i,
.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--cinema-primary);
  opacity: 0.8;
}
.error-state i {
  color: var(--cinema-secondary);
}

/* Booking Section */
.booking-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--cinema-text);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.bookings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Booking Card */
.booking-card {
  background: rgba(13, 27, 42, 0.7);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.booking-card.upcoming {
  border-left: 4px solid var(--cinema-primary);
}

.booking-card.past {
  border-left: 4px solid var(--cinema-text-muted);
  opacity: 0.8;
}

.booking-card:hover {
  transform: translateY(-5px);
  border-color: rgba(247, 197, 72, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.movie-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--cinema-text);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-confirmed {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}
/* Add other status colors if needed */

.card-body,
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-footer {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--cinema-text-muted);
}
.info-item i {
  margin-top: 4px;
  color: var(--cinema-primary);
  width: 16px;
  text-align: center;
}
.info-item strong {
  font-weight: 600;
  color: var(--cinema-text);
  min-width: 120px;
}
.info-item span {
  color: var(--cinema-text-muted);
}
.seat-list {
  font-weight: bold;
}
.food-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Empty States */
.empty-state-section {
  background: rgba(13, 27, 42, 0.5);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: var(--cinema-text-muted);
}

.empty-state-full-page {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.empty-state-full-page i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state-full-page h3 {
  font-size: 1.5rem;
  color: var(--cinema-text);
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--cinema-gradient-gold);
  border: none;
  color: var(--cinema-darker);
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
}
</style>
