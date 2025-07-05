<script setup>
import { useAuth } from '@/composables/useAuth'
import { ref, onMounted } from 'vue'

const { currentUser, logout, isAdmin, isEmployee } = useAuth()

// Trạng thái hiển thị menu trên mobile
const isMenuOpen = ref(false)

/**
 * Xử lý đăng xuất khỏi hệ thống
 */
function handleLogout() {
  logout()
}

/**
 * Đóng/mở menu trên mobile
 */
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

/**
 * Đóng menu khi chọn một liên kết
 */
function closeMenu() {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

/**
 * Áp dụng hiệu ứng khi scroll
 */
onMounted(() => {
  const header = document.querySelector('.cinema-header')

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled')
    } else {
      header?.classList.remove('scrolled')
    }
  })
})
</script>

<template>
  <header class="cinema-header">
    <!-- Thanh menu chính -->
    <nav class="navbar navbar-expand-lg">
    <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand" @click="closeMenu">
          <div class="brand-logo">
            <i class="fas fa-film"></i>
            <span>ZINEMA</span>
          </div>
      </router-link>

        <!-- Nút hiển thị menu trên mobile -->
      <button
        class="navbar-toggler"
        type="button"
          @click="toggleMenu"
          :aria-expanded="isMenuOpen"
      >
          <span class="toggler-icon">
            <i :class="isMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
          </span>
      </button>

        <!-- Menu chính -->
        <div class="collapse navbar-collapse" :class="{ show: isMenuOpen }">
          <!-- Menu bên trái -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="isAdmin || isEmployee">
              <router-link :to="isAdmin ? '/admin' : '/staff'" class="nav-link" @click="closeMenu">
                <i class="fas fa-tachometer-alt me-2"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/employees" class="nav-link" @click="closeMenu">
                <i class="fas fa-users me-2"></i>
                <span>Nhân viên</span>
              </router-link>
            </li>
            
            <li class="nav-item" v-if="isAdmin || isEmployee">
              <router-link to="/customers" class="nav-link" @click="closeMenu">
                <i class="fas fa-user-friends me-2"></i>
                <span>Khách hàng</span>
              </router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admin/movies" class="nav-link" @click="closeMenu">
                <i class="fas fa-film me-2"></i>
                <span>Phim</span>
              </router-link>
            </li>
          </ul>

          <!-- Menu bên phải (user profile) -->
          <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown">
            <a
                class="nav-link dropdown-toggle user-menu"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
                <div class="user-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <span class="user-name">{{ currentUser?.name || currentUser?.full_name }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                  <router-link to="/profile" class="dropdown-item" @click="closeMenu">
                  <i class="fas fa-user-edit me-2"></i>
                  Thông tin cá nhân
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                  <button class="dropdown-item logout-btn" @click="handleLogout">
                    <i class="fas fa-sign-out-alt me-2"></i>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

    <!-- Gradient border dưới menu -->
    <div class="nav-border"></div>
  </header>
</template>

<style scoped>
/* Header container */
.cinema-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  background-color: rgba(13, 27, 42, 0.9);
  backdrop-filter: blur(10px);
}

/* Thêm shadow và nền đậm hơn khi scroll */
.cinema-header.scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background-color: rgba(4, 4, 4, 0.95);
}

/* Logo */
.navbar-brand {
  margin-right: 2rem;
  padding: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--cinema-primary);
  letter-spacing: 1px;
}

.brand-logo i {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

/* Nav links */
.navbar-nav .nav-item {
  position: relative;
  margin: 0 0.25rem;
}

.nav-link {
  color: var(--cinema-text) !important;
  padding: 0.75rem 1rem;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--cinema-primary) !important;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--cinema-gradient-gold);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 80%;
}

/* User menu */
.user-menu {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cinema-gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  color: var(--cinema-darker);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.user-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dropdown menu */
.dropdown-menu {
  background-color: rgba(4, 4, 4, 0.95);
  border: 1px solid rgba(247, 197, 72, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-item {
  color: var(--cinema-text);
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(247, 197, 72, 0.1);
  color: var(--cinema-primary);
}

.dropdown-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.logout-btn {
  color: var(--cinema-secondary);
}

.logout-btn:hover {
  background-color: rgba(254, 65, 65, 0.1);
}

/* Toggle button (mobile) */
.navbar-toggler {
  border: none;
  background: none;
  color: var(--cinema-primary);
  padding: 0.5rem;
}

.toggler-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

/* Gradient border dưới menu */
.nav-border {
  height: 2px;
  background: var(--cinema-gradient-gold);
  opacity: 0.7;
  box-shadow: 0 0 10px rgba(247, 197, 72, 0.5);
}

/* Responsive styles */
@media (max-width: 992px) {
  .navbar-collapse {
    background-color: rgba(4, 4, 4, 0.98);
    border-radius: 0 0 10px 10px;
    padding: 1rem;
    margin-top: 1rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .nav-item {
    margin: 0.5rem 0;
  }

  .user-menu {
    justify-content: center;
    padding: 0.5rem;
  }

  .nav-link::after {
    display: none;
  }

  .nav-link:hover,
  .nav-link.router-link-active {
    background-color: rgba(247, 197, 72, 0.1);
    border-radius: 8px;
  }
}
</style>
