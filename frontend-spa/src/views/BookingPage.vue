<template>
  <div class="booking-page-container">
    <h1>Đặt vé xem phim: {{ movie?.title }}</h1>
    <div class="booking-steps">
      <!-- Step 1: Chọn Lịch chiếu -->
      <div class="step">
        <h2>1. Chọn lịch chiếu</h2>
        <ShowtimeSelector :movie-id="movieId" @showtime-selected="handleShowtimeSelected" />
      </div>

      <!-- Step 2: Chọn ghế -->
      <div v-if="selectedShowtime" class="step">
        <h2>2. Chọn ghế</h2>
        <SeatPicker :showtime-id="selectedShowtime.id" @seats-selected="handleSeatsSelected" />
      </div>

      <!-- Step 3: Chọn đồ ăn -->
      <div v-if="selectedSeats.length > 0" class="step">
        <h2>3. Chọn đồ ăn (Tùy chọn)</h2>
        <FoodPicker @food-selection-changed="handleFoodSelected" />
      </div>

      <!-- Step 4: Tóm tắt và Thanh toán -->
      <div v-if="selectedSeats.length > 0" class="step">
        <h2>4. Tóm tắt và Thanh toán</h2>
        <BookingSummary
          :details="bookingDetails"
          :movie-title="movie?.title"
          :loading="isBooking"
          @confirm-booking="handleConfirmBooking"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShowtimeSelector from '@/components/ShowtimeSelector.vue'
import SeatPicker from '@/components/SeatPicker.vue'
import FoodPicker from '@/components/FoodPicker.vue'
import BookingSummary from '@/components/BookingSummary.vue'
import bookingService from '@/services/booking.service'
import movieService from '@/services/movie.service'

const route = useRoute()
const router = useRouter()
const movieId = ref(route.params.movieId)
const movie = ref(null)

const selectedShowtime = ref(null)
const selectedSeats = ref([])
const selectedFood = ref([])
const isBooking = ref(false)

onMounted(async () => {
  try {
    movie.value = await movieService.getMovieById(movieId.value)
  } catch (error) {
    console.error('Failed to fetch movie details:', error)
  }
})

function handleShowtimeSelected(showtime) {
  selectedShowtime.value = showtime
  selectedSeats.value = [] // Reset ghế khi đổi lịch chiếu
  selectedFood.value = []
}

function handleSeatsSelected(seats) {
  selectedSeats.value = seats
}

function handleFoodSelected(food) {
  selectedFood.value = food
}

const bookingDetails = computed(() => ({
  showtime: selectedShowtime.value,
  seats: selectedSeats.value,
  food: selectedFood.value,
}))

async function handleConfirmBooking() {
  if (!selectedShowtime.value || selectedSeats.value.length === 0) {
    alert('Vui lòng chọn suất chiếu và ghế ngồi.')
    return
  }
  isBooking.value = true
  try {
    const bookingPayload = {
      showtime_id: selectedShowtime.value.id,
      seats: selectedSeats.value.map((s) => s.id),
      food_items: selectedFood.value.map((f) => ({ food_id: f.food_id, quantity: f.quantity })),
    }

    // Create booking
    const createdBookingResponse = await bookingService.createBooking(bookingPayload)

    if (!createdBookingResponse || !createdBookingResponse.data) {
      throw new Error('Không thể tạo booking. Phản hồi từ server không hợp lệ.')
    }

    // The actual booking object is nested in the 'data' property
    const bookingData = createdBookingResponse.data
    const bookingId = bookingData.id ?? bookingData.bookingId

    if (!bookingId) {
      throw new Error('Không nhận được ID booking sau khi tạo.')
    }

    // Confirm booking
    await bookingService.confirmBooking(bookingId, {
      payment_method: 'cash', // Giả sử thanh toán tiền mặt
    })

    alert('Đặt vé thành công!')
    // Chuyển hướng đến trang chi tiết booking hoặc trang cá nhân
    router.push({ name: 'profile' })
  } catch (error) {
    console.error('Lỗi khi đặt vé:', error)
    alert('Đã có lỗi xảy ra. Vui lòng thử lại.')
  } finally {
    isBooking.value = false
  }
}
</script>

<style scoped>
.booking-page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
}

.booking-steps .step {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>
