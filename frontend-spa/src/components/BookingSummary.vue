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
  background-color: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.summary-item {
  margin-bottom: 0.8rem;
}
.total-price {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 1rem 0;
}
.confirm-booking-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.confirm-booking-btn:disabled {
  background-color: #ccc;
}
ul {
  list-style-type: none;
  padding-left: 1rem;
}
</style>
