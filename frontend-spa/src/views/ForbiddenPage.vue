<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>

<template>
  <div class="forbidden-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="error-content">
            <h1 class="display-1 text-danger">403</h1>
            <h2>Không có quyền truy cập</h2>
            <p class="text-muted mb-4">Bạn không có quyền truy cập vào trang này.</p>
            <button class="btn btn-secondary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
}
</style>
