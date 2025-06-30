<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="error-content">
            <h1 class="display-1 text-cinema-primary">404</h1>
            <h2>Trang không tồn tại</h2>
            <p class="text-muted mb-4">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <button class="btn btn-cinema-primary" @click="goHome">
              <i class="fas fa-home me-2"></i>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.text-cinema-primary {
  color: #e50914;
}

.btn-cinema-primary {
  background-color: #e50914;
  border-color: #e50914;
  color: white;
}

.btn-cinema-primary:hover {
  background-color: #b8070f;
  border-color: #b8070f;
}
</style>
