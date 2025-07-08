<template>
  <div class="booking-summary">
    <h4>Tóm tắt đặt vé</h4>
    <div v-if="details.showtime" class="summary-item"><strong>Phim:</strong> {{ movieTitle }}</div>
    <div v-if="details.showtime" class="summary-item">
      <strong>Suất chiếu:</strong> {{ formatDateTime(details.showtime.start_time) }}
    </div>
    <div v-if="details.seats && details.seats.length" class="summary-item">
      <strong>Ghế:</strong> {{ selectedSeatNames }} ({{ details.seats.length }} ghế)
    </div>
    <div v-if="details.food && details.food.length" class="summary-item">
      <strong>Đồ ăn:</strong>
      <ul>
        <li v-for="item in details.food" :key="item.food_id">
          {{ item.name }} x{{ item.quantity }} - {{ formatPrice(item.price * item.quantity) }}
        </li>
      </ul>
    </div>
    <hr />
    <div class="total-price">
      <strong>Tổng cộng:</strong>
      <span>{{ formatPrice(totalPrice) }}</span>
    </div>
    <button class="confirm-booking-btn" @click="$emit('confirm-booking')" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Xác nhận và Thanh toán' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  details: {
    type: Object,
    required: true,
    default: () => ({ showtime: null, seats: [], food: [] }),
  },
  movieTitle: {
    type: String,
    default: 'Tên phim',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm-booking'])

const selectedSeatNames = computed(() => {
  if (!props.details.seats) return ''
  return props.details.seats.map((s) => s.name).join(', ')
})

const totalPrice = computed(() => {
  const seatsTotal = props.details.seats.reduce((total, seat) => {
    const seatPrice = Number(seat.surcharge) || 0
    return total + seatPrice
  }, 0)

  const foodTotal = props.details.food.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  return seatsTotal + foodTotal
})

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString('vi-VN')
</script>

<style scoped>
.booking-summary {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.booking-summary h4 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.summary-item {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #374151;
}

.summary-item strong {
  color: #111827;
}

ul {
  list-style-type: none;
  padding-left: 1rem;
  border-left: 2px solid #f3f4f6;
  margin-top: 0.5rem;
}

li {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.5rem 0;
  color: #111827;
}
.total-price span {
  color: #ef4444;
}

.confirm-booking-btn {
  width: 100%;
  padding: 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}
.confirm-booking-btn:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.confirm-booking-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
