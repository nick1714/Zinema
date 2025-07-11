<template>
  <div class="my-bookings-page container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Lịch sử đặt vé</h1>

    <div v-if="isLoading" class="text-center">
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Đã có lỗi xảy ra: {{ error }}</p>
    </div>

    <div v-else>
      <div v-if="validBookings.length > 0">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Vé sắp chiếu</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="booking in validBookings"
            :key="booking.id"
            class="bg-white text-black rounded-lg shadow-md p-5 border-l-4 border-blue-500"
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xl font-bold text-black">{{ booking.movie_title }}</h3>
              <span
                class="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full"
                >{{ booking.status }}</span
              >
            </div>
            <p class="text-black mb-2">
              <strong>Mã đặt vé:</strong>
              <span class="font-mono text-blue-600">{{ booking.booking_code }}</span>
            </p>
            <p class="text-black mb-2"><strong>Rạp:</strong> {{ booking.room_name }}</p>
            <p class="text-black mb-2">
              <strong>Suất chiếu:</strong> {{ formatDateTime(booking.start_time) }}
            </p>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-black mb-2">
                <strong>Ghế:</strong> {{ formatSeatList(booking.tickets) }}
              </p>
              <div v-if="booking.food_orders && booking.food_orders.length > 0">
                <p class="text-black mb-1"><strong>Đồ ăn & nước uống:</strong></p>
                <ul class="list-disc list-inside text-black">
                  <li v-for="food in booking.food_orders" :key="food.id">
                    {{ food.food_name }} (x{{ food.quantity }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pastBookings.length > 0" class="mt-10">
        <h2 class="text-2xl font-semibold mb-4 text-black">Vé đã xem</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="booking in pastBookings"
            :key="booking.id"
            class="bg-gray-100 text-black rounded-lg shadow-sm p-5 border-l-4 border-gray-400"
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xl font-bold text-black">{{ booking.movie_title }}</h3>
              <span class="px-3 py-1 text-sm font-semibold text-black bg-gray-200 rounded-full">{{
                booking.status
              }}</span>
            </div>
            <p class="text-black mb-2">
              <strong>Mã đặt vé:</strong>
              <span class="font-mono">{{ booking.booking_code }}</span>
            </p>
            <p class="text-black mb-2"><strong>Rạp:</strong> {{ booking.room_name }}</p>
            <p class="text-black mb-2">
              <strong>Suất chiếu:</strong> {{ formatDateTime(booking.start_time) }}
            </p>
            <div class="mt-3 pt-3 border-t border-gray-500">
              <p class="text-black"><strong>Ghế:</strong> {{ formatSeatList(booking.tickets) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="validBookings.length === 0 && pastBookings.length === 0"
        class="text-center py-10 px-6 bg-gray-50 rounded-lg"
      >
        <p class="text-gray-500 text-lg">Bạn chưa có lịch sử đặt vé nào.</p>
        <router-link
          to="/"
          class="mt-4 inline-block px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Đặt vé ngay
        </router-link>
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(dateTimeString).toLocaleString('vi-VN', options)
}

function formatSeatList(tickets) {
  return tickets.map((ticket) => ticket.seat_name).join(', ')
}
</script>
