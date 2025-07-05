<template>
  <div class="home-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <i class="fas fa-film me-2"></i>
          Trang Chủ
        </h1>
        <p class="page-subtitle">Khám phá thế giới điện ảnh ngay hôm nay!</p>
      </div>
    </div>
    <div class="container py-4">
      <p class="text-center text-white">Chào mừng bạn đến với ZINEMA! Chức năng hiển thị danh sách phim sẽ sớm được cập nhật.</p>
    </div>
  </div>
</template>

<script setup>
// Logic for fetching and displaying movies will be added here
</script>

<style scoped>
/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-title {
  color: var(--cinema-primary);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--cinema-text-muted);
  font-size: 1.1rem;
}

.text-center {
  text-align: center;
}

.text-white {
  color: var(--cinema-text);
}
</style> 