<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const queryClient = useQueryClient()

const googleCallbackMutation = useMutation({
  mutationFn: (code) => authService.handleGoogleCallback(code),
  onSuccess: (data) => {
    // Sử dụng action từ store để quản lý state tập trung
    authStore.setAuthenticated(data.token, data.user)

    queryClient.invalidateQueries({ queryKey: ['auth'] }).then(() => {
      if (data.isFirstTime) {
        router.push({ path: '/profile', query: { firstTime: 'true' } })
      } else {
        router.push('/')
      }
    })
  },
  onError: (error) => {
    console.error('Google callback error:', error)
    alert('Xác thực với Google thất bại. Vui lòng thử lại từ trang đăng nhập.')
    router.push('/login')
  },
})

onMounted(() => {
  const code = route.query.code
  if (code) {
    googleCallbackMutation.mutate(code)
  } else {
    // Nếu không có code, có thể người dùng vào trang này nhầm
    router.push('/login')
  }
})
</script>

<template>
  <div class="callback-page">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Đang xác thực với Google, vui lòng đợi...</p>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--cinema-darker);
}

.loading-container {
  text-align: center;
  color: var(--cinema-text);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(247, 197, 72, 0.2);
  border-left-color: var(--cinema-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
