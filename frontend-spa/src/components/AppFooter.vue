<script setup>
// Simple footer component
</script>

<template>
  <footer class="bg-dark text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5>
            <i class="fas fa-film me-2"></i>
            Cinema Management System
          </h5>
          <p class="text-muted">Hệ thống quản lý rạp chiếu phim hiện đại và chuyên nghiệp.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="text-muted mb-0">
            © {{ new Date().getFullYear() }} Cinema Management. All rights reserved.
          </p>
          <small class="text-muted"> Phát triển bởi nhóm WebService </small>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: auto;
}
</style>
