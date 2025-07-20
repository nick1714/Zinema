import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookingStore = defineStore('booking', () => {
  // State
  const selectedShowtime = ref(null)
  const selectedSeats = ref([])
  const selectedFood = ref([])
  const selectedCustomer = ref(null) // Cho staff/admin
  const customerPhone = ref('')
  const isBooking = ref(false)

  // Getters
  const bookingDetails = computed(() => ({
    showtime: selectedShowtime.value,
    seats: selectedSeats.value,
    food: selectedFood.value,
    customer: selectedCustomer.value,
  }))

  const totalSeats = computed(() => selectedSeats.value.length)
  const hasSelection = computed(() => selectedShowtime.value && selectedSeats.value.length > 0)

  // Actions
  function setShowtime(showtime) {
    selectedShowtime.value = showtime
    // Reset seats và food khi đổi showtime
    selectedSeats.value = []
    selectedFood.value = []
  }

  function setSeats(seats) {
    selectedSeats.value = seats
  }

  function setFood(food) {
    selectedFood.value = food
  }

  function setCustomer(customer) {
    selectedCustomer.value = customer
  }

  function setCustomerPhone(phone) {
    customerPhone.value = phone
  }

  function setBookingStatus(status) {
    isBooking.value = status
  }

  function resetBooking() {
    selectedShowtime.value = null
    selectedSeats.value = []
    selectedFood.value = []
    selectedCustomer.value = null
    customerPhone.value = ''
    isBooking.value = false
  }

  function resetCustomerSelection() {
    selectedCustomer.value = null
    customerPhone.value = ''
  }

  return {
    // State
    selectedShowtime,
    selectedSeats,
    selectedFood,
    selectedCustomer,
    customerPhone,
    isBooking,

    // Getters
    bookingDetails,
    totalSeats,
    hasSelection,

    // Actions
    setShowtime,
    setSeats,
    setFood,
    setCustomer,
    setCustomerPhone,
    setBookingStatus,
    resetBooking,
    resetCustomerSelection,
  }
}) 