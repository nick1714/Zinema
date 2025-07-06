<template>
  <div class="food-picker">
    <div v-if="loading" class="loading">Đang tải danh sách đồ ăn...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="food-list">
      <div v-for="item in foodItems" :key="item.id" class="food-item">
        <img
          :src="item.image_url || '/images/default-food.png'"
          :alt="item.name"
          class="food-image"
        />
        <div class="food-details">
          <h4>{{ item.name }}</h4>
          <p>{{ item.description }}</p>
          <span class="price">{{ formatPrice(item.price) }}</span>
        </div>
        <div class="food-actions">
          <button @click="decreaseQuantity(item)" :disabled="getQuantity(item.id) === 0">-</button>
          <span>{{ getQuantity(item.id) }}</span>
          <button @click="increaseQuantity(item)">+</button>
        </div>
      </div>
    </div>
    <button class="confirm-btn" @click="$emit('food-selection-changed', selectedFood)">
      Xác nhận chọn đồ ăn
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import foodService from '@/services/food.service'

const emit = defineEmits(['food-selection-changed'])

const loading = ref(false)
const error = ref(null)
const foodItems = ref([])
const selectedFood = ref([]) // Mảng các object { food_id, quantity, name, price }

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
.food-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.food-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
.food-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.food-details {
  flex-grow: 1;
}
.food-details h4 {
  margin: 0 0 0.5rem;
}
.food-details .price {
  font-weight: bold;
  color: #ef4444;
}
.food-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.food-actions button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
}
.confirm-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
