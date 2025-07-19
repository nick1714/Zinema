<template>
  <div class="food-picker">
    <div v-if="loading" class="loading">Đang tải danh sách đồ ăn...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="food-grid">
      <div v-for="item in foodItems" :key="item.id" class="food-card">
        <img :src="item.image_url" :alt="item.name" class="food-image" @error="handleImageError" />
        <div class="food-details">
          <h4>{{ item.name }}</h4>
          <p>{{ item.description }}</p>
        </div>
        <div class="food-footer">
          <span class="price">{{ formatPrice(item.price) }}</span>
          <div class="food-actions">
            <button @click="decreaseQuantity(item)" :disabled="getQuantity(item.id) === 0">
              -
            </button>
            <span>{{ getQuantity(item.id) }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch } from 'vue'
import { STATIC_BASE_URL } from '@/constants'
import foodService from '@/services/food.service'

const emit = defineEmits(['food-selection-changed'])

const loading = ref(false)
const error = ref(null)
const foodItems = ref([])
const selectedFood = ref([]) // Mảng các object { food_id, quantity, name, price }

// Emit changes whenever selectedFood is modified
watch(
  selectedFood,
  (newValue) => {
    emit('food-selection-changed', newValue)
  },
  { deep: true },
)

// Xử lý lỗi hình ảnh
function handleImageError(event) {
  event.target.src = `${STATIC_BASE_URL}/public/images/default-movie-poster.png`
}

async function fetchFoodItems() {
  loading.value = true
  error.value = null
  try {
    const data = await foodService.getAllFoods({ limit: 50, is_available: true })
    foodItems.value = data.foods
  } catch (err) {
    error.value = 'Không thể tải danh sách đồ ăn. Vui lòng thử lại.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchFoodItems)

const getQuantity = (foodId) => {
  const item = selectedFood.value.find((f) => f.food_id === foodId)
  return item ? item.quantity : 0
}

const increaseQuantity = (foodItem) => {
  const existingItem = selectedFood.value.find((f) => f.food_id === foodItem.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    selectedFood.value.push({
      food_id: foodItem.id,
      quantity: 1,
      name: foodItem.name,
      price: foodItem.price,
    })
  }
}

const decreaseQuantity = (foodItem) => {
  const existingItem = selectedFood.value.find((f) => f.food_id === foodItem.id)
  if (existingItem && existingItem.quantity > 1) {
    existingItem.quantity--
  } else if (existingItem && existingItem.quantity === 1) {
    selectedFood.value = selectedFood.value.filter((f) => f.food_id !== foodItem.id)
  }
}

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
</script>

<style scoped>
.food-picker {
  padding: 1rem 0;
}
.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.food-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.food-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.food-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}
.food-details {
  padding: 1rem;
  flex-grow: 1;
}
.food-details h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #111827;
}
.food-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}
.food-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid #f3f4f6;
  background-color: #f9fafb;
}
.food-footer .price {
  font-weight: bold;
  font-size: 1.1rem;
  color: #ef4444;
}
.food-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.food-actions button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.food-actions button:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fecaca;
}
.food-actions button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
.food-actions span {
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}
.error,
.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>
