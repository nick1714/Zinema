<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { handleGoogleCallback, isLoading, error } = useAuth()

// Biến cờ để đảm bảo hàm chỉ được gọi một lần
let hasBeenCalled = false

onMounted(() => {
  if (hasBeenCalled) {
    return
  }

  const code = route.query.code

  if (code) {
    hasBeenCalled = true // Đặt cờ ngay lập tức
    // Nếu có code, gọi mutation để gửi lên backend
    handleGoogleCallback(code)
  } else {
    // Nếu không có code, có thể là lỗi từ Google
    console.error("Google callback didn't provide a code.")
    // Có thể redirect về trang login với thông báo lỗi
  }
})
</script>

<template>
  <div class="callback-page">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Đang xác thực với Google, vui lòng đợi...</p>
    </div>
    <div v-if="error" class="error-container">
      <h4>Xác thực thất bại</h4>
      <p class="text-danger">{{ error.message }}</p>
      <router-link to="/login" class="btn btn-primary">Quay về trang đăng nhập</router-link>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
}
</style>
