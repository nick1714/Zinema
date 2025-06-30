<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login, googleLogin, handleGoogleCallback, isLoggingIn, isAuthenticated } = useAuth()

// Handle Google OAuth callback
onMounted(() => {
  const code = route.query.code
  if (code) {
    handleGoogleCallback(code)
  }

  // If already authenticated, redirect
  if (isAuthenticated.value) {
    router.push('/profile')
  }
})

function handleLogin({ phoneNumber, password }) {
  login({ phoneNumber, password })
}

function handleGoogleLogin() {
  googleLogin()
}
</script>

<template>
  <div class="login-page">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <!-- Left side - Cinema branding -->
        <div class="col-md-6 d-none d-md-flex cinema-brand">
          <div class="brand-content">
            <h1 class="display-4 text-white mb-4">
              <i class="fas fa-film me-3"></i>
              Cinema Management
            </h1>
            <p class="lead text-white-50">Hệ thống quản lý rạp chiếu phim hiện đại</p>
            <div class="features mt-4">
              <div class="feature-item mb-2">
                <i class="fas fa-check-circle me-2"></i>
                <span>Quản lý nhân viên & khách hàng</span>
              </div>
              <div class="feature-item mb-2">
                <i class="fas fa-check-circle me-2"></i>
                <span>Đăng nhập Google cho khách hàng</span>
              </div>
              <div class="feature-item mb-2">
                <i class="fas fa-check-circle me-2"></i>
                <span>Giao diện thân thiện với người dùng</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side - Login form -->
        <div class="col-md-6 d-flex align-items-center justify-content-center">
          <div class="w-100" style="max-width: 400px">
            <AuthForm
              :is-loading="isLoggingIn"
              :show-google-login="true"
              @login="handleLogin"
              @google-login="handleGoogleLogin"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e50914 0%, #221f1f 100%);
}

.cinema-brand {
  background: rgba(0, 0, 0, 0.3);
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
  max-width: 500px;
}

.feature-item {
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
}

.feature-item i {
  color: #28a745;
}
</style>
