<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div id="app">
    <AppHeader v-if="isAuthenticated" />

    <main class="main-content">
      <router-view />
    </main>

    <AppFooter v-if="isAuthenticated" />
  </div>
</template>

<style>
/* Định nghĩa biến màu sắc cho theme rạp phim */
:root {
  /* Màu chính */
  --cinema-primary: #f7c548; /* Vàng */
  --cinema-secondary: #fe4141; /* Đỏ */
  --cinema-accent: #8a39e1; /* Tím */
  
  /* Màu nền */
  --cinema-dark: #0d1b2a; /* Xanh đen */
  --cinema-dark-blue: #1b263b; /* Xanh đen nhạt hơn */
  --cinema-darker: #040404; /* Đen */
  
  /* Màu text */
  --cinema-text: #e0e1dd; /* Trắng xám */
  --cinema-text-muted: #8d99ae; /* Xám */
  
  /* Gradient */
  --cinema-gradient-dark: linear-gradient(135deg, var(--cinema-dark) 0%, var(--cinema-dark-blue) 100%);
  --cinema-gradient-primary: linear-gradient(135deg, var(--cinema-secondary) 0%, var(--cinema-accent) 100%);
  --cinema-gradient-gold: linear-gradient(135deg, #f7c548 0%, #df9f29 100%);
}

/* Reset và style cơ bản */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--cinema-dark);
  color: var(--cinema-text);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 2rem;
}

/* Overrides cho Bootstrap */
.btn-cinema {
  background: var(--cinema-gradient-gold);
  border: none;
  color: var(--cinema-darker);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-cinema:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  filter: brightness(1.05);
}

.btn-cinema:active {
  transform: translateY(0);
}

.btn-outline-cinema {
  background: transparent;
  border: 2px solid var(--cinema-primary);
  color: var(--cinema-primary);
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-cinema:hover {
  background: var(--cinema-primary);
  color: var(--cinema-darker);
}

.form-control:focus {
  border-color: var(--cinema-primary);
  box-shadow: 0 0 0 0.25rem rgba(247, 197, 72, 0.25);
}

/* Hiệu ứng animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
