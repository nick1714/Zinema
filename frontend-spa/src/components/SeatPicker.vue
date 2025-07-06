<template>
  <div class="seat-picker">
    <div v-if="loading" class="loading">Đang tải sơ đồ ghế...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error && seatData" class="seat-map-container">
      <div class="screen">MÀN HÌNH</div>
      <div class="seat-grid" :style="gridStyle">
        <div
          v-for="seat in seatData.seats"
          :key="seat.id"
          :class="['seat', seat.status, seat.type, { selected: isSelected(seat) }]"
          @click="toggleSeat(seat)"
        >
          {{ seat.name }}
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="seat available"></div>
          <span>Trống</span>
        </div>
        <div class="legend-item">
          <div class="seat booked"></div>
          <span>Đã đặt</span>
        </div>
        <div class="legend-item">
          <div class="seat selected"></div>
          <span>Đang chọn</span>
        </div>
        <div class="legend-item">
          <div class="seat standard"></div>
          <span>Ghế thường</span>
        </div>
        <div class="legend-item">
          <div class="seat vip"></div>
          <span>Ghế VIP</span>
        </div>
      </div>

      <div class="selection-summary">
        <p>Đã chọn: {{ selectedSeats.length }} ghế</p>
        <p>Ghế: {{ selectedSeatNames }}</p>
        <p>Tổng tiền: {{ formatPrice(totalPrice) }}</p>
        <button @click="confirmSelection" :disabled="selectedSeats.length === 0">
          Xác nhận chọn ghế
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import showtimeService from '@/services/showtime.service'

const props = defineProps({
  showtimeId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['seats-selected'])

const loading = ref(false)
const error = ref(null)
const seatData = ref(null)
const selectedSeats = ref([])

async function fetchSeatMap() {
  if (!props.showtimeId) return
  loading.value = true
  error.value = null
  selectedSeats.value = [] // Reset khi đổi suất chiếu

  try {
    const data = await showtimeService.getSeatsForShowtime(props.showtimeId)
    seatData.value = data
  } catch (err) {
    error.value = 'Không thể tải sơ đồ ghế. Vui lòng thử lại.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Fetch khi component được mount hoặc khi showtimeId thay đổi
onMounted(fetchSeatMap)
watch(() => props.showtimeId, fetchSeatMap)

const gridStyle = computed(() => {
  if (!seatData.value?.room) return {}
  return {
    gridTemplateColumns: `repeat(${seatData.value.room.columns}, 1fr)`,
  }
})

function toggleSeat(seat) {
  if (seat.status === 'booked') return

  const index = selectedSeats.value.findIndex((s) => s.id === seat.id)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  } else {
    if (selectedSeats.value.length < 7) {
      selectedSeats.value.push(seat)
    } else {
      alert('Bạn chỉ có thể chọn tối đa 7 ghế.')
    }
  }
}

const isSelected = (seat) => selectedSeats.value.some((s) => s.id === seat.id)

const selectedSeatNames = computed(() => selectedSeats.value.map((s) => s.name).join(', '))

const totalPrice = computed(() => {
  return selectedSeats.value.reduce((total, seat) => {
    const seatPrice = Number(seat.surcharge) || 0
    return total + seatPrice
  }, 0)
})

function confirmSelection() {
  emit('seats-selected', selectedSeats.value)
}

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
</script>

<style scoped>
.seat-picker {
  padding: 1rem;
}
.screen {
  background-color: #333;
  color: white;
  padding: 0.5rem;
  text-align: center;
  margin-bottom: 2rem;
  border-radius: 4px;
}
.seat-grid {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.seat {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  background-color: #ccc;
  border: 1px solid #aaa;
}
.seat.available {
  background-color: #ff9800;
} /* Cam */
.seat.booked {
  background-color: #616161;
  cursor: not-allowed;
} /* Xám đậm */
.seat.selected {
  background-color: #4caf50;
  color: white;
} /* Xanh lá */
.seat.vip {
  border: 2px solid gold;
}
.legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}
.selection-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
}
</style>
