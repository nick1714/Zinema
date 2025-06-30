<script setup>
import { useAuth } from '@/composables/useAuth'

const { currentUser, logout, isAdmin } = useAuth()
</script>

<template>
  <div class="admin-dashboard">
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i class="fas fa-tachometer-alt me-2"></i>
          Bảng điều khiển
        </h2>

        <div class="dropdown">
          <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            <i class="fas fa-user me-2"></i>
            {{ currentUser?.name }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user-edit me-2"></i>
                Thông tin cá nhân
              </router-link>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button class="dropdown-item" @click="logout">
                <i class="fas fa-sign-out-alt me-2"></i>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-3" v-if="isAdmin">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-users fa-2x text-primary mb-3"></i>
              <h5>Quản lý nhân viên</h5>
              <router-link to="/employees" class="btn btn-primary"> Xem danh sách </router-link>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-user-friends fa-2x text-success mb-3"></i>
              <h5>Quản lý khách hàng</h5>
              <router-link to="/customers" class="btn btn-success"> Xem danh sách </router-link>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-film fa-2x text-info mb-3"></i>
              <h5>Quản lý phim</h5>
              <button class="btn btn-info" disabled>Đang phát triển</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
