<template>
  <div class="showtime-selector">
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error && availableShowtimes.length > 0">
      <!-- Date Selector -->
      <h4>Chọn ngày</h4>
      <div class="date-selector">
        <button
          v-for="date in nextSevenDays"
          :key="date.toISOString()"
          class="date-btn"
          :class="{ selected: isSelectedDate(date) }"
          @click="selectDate(date)"
        >
          <span class="day-of-week">{{ getDayOfWeek(date) }}</span>
          <span class="day-month">{{ getDayAndMonth(date) }}</span>
        </button>
      </div>

      <!-- Showtime Grid -->
      <div v-if="selectedDate">
        <h4>Chọn suất chiếu</h4>
        <div class="showtime-grid">
          <button
            v-for="showtime in filteredShowtimes"
            :key="showtime.id"
            class="showtime-btn"
            :class="{ selected: selectedShowtime && selectedShowtime.id === showtime.id }"
            @click="handleSelectShowtime(showtime)"
          >
            <span class="time">{{ formatTime(showtime.start_time) }}</span>
            <span class="room">{{ showtime.room_name }}</span>
            <span class="price">{{ formatPrice(showtime.price) }}</span>
          </button>
        </div>
        <p v-if="filteredShowtimes.length === 0" class="no-showtimes">
          Không có suất chiếu nào cho ngày đã chọn.
        </p>
      </div>
      <p v-else>Vui lòng chọn một ngày để xem suất chiếu.</p>
    </div>

    <div v-else-if="!loading && !error">
      <p>Hiện tại không có suất chiếu nào cho phim này.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, defineEmits } from 'vue'
import showtimeService from '@/services/showtime.service'

const props = defineProps({
  movieId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['showtime-selected'])

const loading = ref(false)
const error = ref(null)
const availableShowtimes = ref([])
const selectedShowtime = ref(null)
const selectedDate = ref(null)
const nextSevenDays = ref([])

// --- Date Logic ---
function generateNextSevenDays() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today)
    nextDay.setDate(today.getDate() + i)
    days.push(nextDay)
  }
  nextSevenDays.value = days
  // Auto-select today
  selectDate(days[0])
}

function selectDate(date) {
  selectedDate.value = date
  // Reset selected showtime when date changes
  selectedShowtime.value = null
  emit('showtime-selected', null)
}

const isSelectedDate = (date) => {
  if (!selectedDate.value) return false
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const getDayOfWeek = (date) => {
  if (new Date(date).getDate() === new Date().getDate()) return 'Hôm nay'
  return date.toLocaleDateString('vi-VN', { weekday: 'short' })
}

const getDayAndMonth = (date) => {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

// --- Showtime Logic ---
const filteredShowtimes = computed(() => {
  if (!selectedDate.value) {
    return []
  }
  return availableShowtimes.value.filter((showtime) => {
    const showtimeDate = new Date(showtime.start_time)
    return (
      showtimeDate.getDate() === selectedDate.value.getDate() &&
      showtimeDate.getMonth() === selectedDate.value.getMonth() &&
      showtimeDate.getFullYear() === selectedDate.value.getFullYear()
    )
  })
})

async function fetchShowtimes() {
  if (!props.movieId) return
  loading.value = true
  error.value = null
  try {
    const data = await showtimeService.getAllShowtimes({
      movie_id: props.movieId,
      status: 'scheduled',
      limit: 100,
    })
    availableShowtimes.value = data.showtimes
    generateNextSevenDays()
  } catch (err) {
    error.value = 'Không thể tải suất chiếu. Vui lòng thử lại.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchShowtimes)

function handleSelectShowtime(showtime) {
  selectedShowtime.value = showtime
  emit('showtime-selected', showtime)
}

const formatTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}
</script>

<style scoped>
.showtime-selector h4 {
  font-size: 1.2rem;
  color: #374151;
  margin-bottom: 1rem;
}
.date-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.date-btn {
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  text-align: center;
  transition:
    all 0.2s,
    transform 0.1s;
}
.date-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  transform: translateY(-2px);
}
.date-btn.selected {
  border-color: #ef4444;
  background-color: #ef4444;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}
.day-of-week {
  display: block;
  font-size: 0.8rem;
  text-transform: capitalize;
}
.day-month {
  display: block;
  font-size: 1.1rem;
  font-weight: bold;
}

.showtime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem;
}
.showtime-btn {
  padding: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f9fafb;
  text-align: center;
  transition: all 0.2s;
}
.showtime-btn:hover {
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}
.showtime-btn.selected {
  border-color: #ef4444;
  background-color: #fee2e2;
  color: #b91c1c;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}
.time {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #1f2937;
}
.showtime-btn.selected .time {
  color: #b91c1c;
}
.room,
.price {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
}
.no-showtimes {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  color: #4b5563;
}

.error,
.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>
