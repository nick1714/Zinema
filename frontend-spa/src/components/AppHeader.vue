<script setup>
import { useAuth } from '@/composables/useAuth'

const { currentUser, logout, isAdmin, isEmployee } = useAuth()

function handleLogout() {
  logout()
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-cinema-primary">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="fas fa-film me-2"></i>
        Cinema
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" v-if="isAdmin || isEmployee">
            <router-link to="/admin" class="nav-link">
              <i class="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link to="/employees" class="nav-link">
              <i class="fas fa-users me-1"></i>
              Nhân viên
            </router-link>
          </li>
          <li class="nav-item" v-if="isAdmin || isEmployee">
            <router-link to="/customers" class="nav-link">
              <i class="fas fa-user-friends me-1"></i>
              Khách hàng
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i class="fas fa-user me-1"></i>
              {{ currentUser?.name || currentUser?.full_name }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user-edit me-2"></i>
                  Thông tin cá nhân
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item" @click="handleLogout">
                  <i class="fas fa-sign-out-alt me-2 text-danger"></i>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.bg-cinema-primary {
  background-color: #e50914 !important;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}
</style>
