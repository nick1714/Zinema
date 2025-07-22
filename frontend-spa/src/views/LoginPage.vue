<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import AuthForm from '@/components/AuthForm.vue'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const queryClient = useQueryClient()

const loginMutation = useMutation({
  mutationFn: ({ phoneNumber, password }) => authService.login(phoneNumber, password),
  onSuccess: (data) => {
    if (!data.token) {
      console.error('Login success but no token received from backend!')
      alert('Lỗi: Không nhận được token xác thực từ máy chủ.')
      return
    }

    // Sử dụng action từ store để quản lý state tập trung
    const user = { ...data.user, role: data.account?.role }
    authStore.setAuthenticated(data.token, user)

    // Redirect dựa trên role từ store
    const userRole = authStore.userRole
    if (userRole === 'admin') {
      router.push('/admin')
    } else if (userRole === 'staff') {
      router.push('/staff')
    } else {
      router.push('/')
    }

    queryClient.invalidateQueries({ queryKey: ['auth'] })
  },
  onError: (error) => {
    console.error('Login error:', error)
    alert('Đăng nhập thất bại: ' + (error?.response?.data?.message || error.message))
  },
})

const isLoading = computed(() => loginMutation.isPending.value)

// If already authenticated, redirect on mount
onMounted(() => {
  if (authStore.isAuthenticated) {
    const userRole = authStore.userRole
    if (userRole === 'admin') {
      router.push('/admin')
    } else if (userRole === 'staff' || userRole === 'employee') {
      router.push('/staff')
    } else {
      router.push('/')
    }
  }
})

function handleLogin({ phoneNumber, password }) {
  loginMutation.mutate({ phoneNumber, password })
}

function handleGoogleLogin() {
  authService.googleLogin()
}
</script>

<template>
  <div class="login-page">
    <div class="stars"></div>
    <div class="container-fluid h-100">
      <div class="row h-100">
        <!-- Phần bên trái - Cinema branding -->
        <div class="col-lg-7 d-none d-lg-flex cinema-brand">
          <div class="brand-content fade-in">
            <!-- Logo -->
            <div class="cinema-logo mb-5">
              <i class="fas fa-film"></i>
              <span>ZINEMA</span>
            </div>

            <!-- Tiêu đề và slogan -->
            <h1 class="display-4 text-gradient mb-4">Quản Lý Rạp Chiếu Phim</h1>
            <p class="lead mb-5">Giải pháp hiện đại cho rạp chiếu phim của bạn</p>

            <!-- Các tính năng -->
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="feature-text">
                  <h3>Quản lý vé & suất chiếu</h3>
                  <p>Hệ thống đặt vé trực tuyến nhanh chóng, dễ dàng</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="feature-text">
                  <h3>Báo cáo & thống kê</h3>
                  <p>Phân tích doanh thu, lượt xem và nhiều hơn nữa</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="feature-text">
                  <h3>Quản lý nhân viên & khách hàng</h3>
                  <p>Hỗ trợ đăng nhập Google và tài khoản nhanh chóng</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Hiệu ứng rọi đèn rạp chiếu phim -->
          <div class="spotlight spotlight-1"></div>
          <div class="spotlight spotlight-2"></div>
        </div>

        <!-- Phần bên phải - Form đăng nhập -->
        <div class="col-lg-5 d-flex align-items-center justify-content-center login-form-container">
          <div class="w-100 fade-in" style="max-width: 450px">
            <AuthForm
              :is-loading="isLoading"
              :show-google-login="true"
              @login="handleLogin"
              @google-login="handleGoogleLogin"
            />

            <div class="text-center mt-4 login-footer">
              <p>© {{ new Date().getFullYear() }} ZINEMA. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container trang đăng nhập */
.login-page {
  min-height: 100vh;
  background: var(--cinema-gradient-dark);
  position: relative;
  overflow: hidden;
}

/* Hiệu ứng sao lấp lánh */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image:
    radial-gradient(2px 2px at 40px 60px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 20px 120px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 100px 20px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 200px 180px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 160px 220px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 240px 100px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 300px 300px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 400px 250px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 500px 500px;
}

/* Phần branding */
.cinema-brand {
  position: relative;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0 20px 20px 0;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Logo */
.cinema-logo {
  display: flex;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--cinema-primary);
}

.cinema-logo i {
  margin-right: 0.5rem;
}

.cinema-logo span {
  letter-spacing: 2px;
}

/* Nội dung branding */
.brand-content {
  max-width: 600px;
  padding: 3rem;
  z-index: 2;
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(to right, var(--cinema-primary), var(--cinema-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Features */
.features {
  margin-top: 3rem;
}

.feature-item {
  display: flex;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border-left: 4px solid var(--cinema-primary);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

.feature-icon {
  font-size: 2rem;
  margin-right: 1.5rem;
  color: var(--cinema-primary);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(247, 197, 72, 0.1);
}

.feature-text h3 {
  color: var(--cinema-primary);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.feature-text p {
  color: var(--cinema-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* Container form đăng nhập */
.login-form-container {
  padding: 2rem;
}

/* Footer */
.login-footer {
  color: var(--cinema-text-muted);
  font-size: 0.8rem;
}

/* Hiệu ứng rọi đèn */
.spotlight {
  position: absolute;
  width: 100px;
  height: 400px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(247, 197, 72, 0.05) 25%,
    rgba(247, 197, 72, 0.1) 50%,
    rgba(247, 197, 72, 0.05) 75%,
    transparent
  );
  border-radius: 50% / 25%;
  transform: rotate(-30deg);
  filter: blur(10px);
  pointer-events: none;
  opacity: 0.5;
  animation: moveLights 10s infinite alternate ease-in-out;
}

.spotlight-1 {
  top: -100px;
  left: 30%;
  animation-duration: 15s;
}

.spotlight-2 {
  bottom: -100px;
  left: 10%;
  animation-duration: 20s;
  opacity: 0.3;
  transform: rotate(30deg);
}

@keyframes moveLights {
  0% {
    transform: rotate(-30deg) translateX(-50px);
  }
  100% {
    transform: rotate(-25deg) translateX(50px);
  }
}

/* Media Queries */
@media (max-width: 992px) {
  .login-page {
    background: var(--cinema-gradient-dark);
  }

  .login-form-container {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
