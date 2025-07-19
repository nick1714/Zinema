<script setup></script>

<template>
  <div class="staff-dashboard">
    <div class="dashboard-header">
      <div class="container">
        <h1 class="dashboard-title">
          <i class="fas fa-clipboard-user me-2"></i>
          Bảng Điều Khiển Nhân Viên
        </h1>
        <p class="dashboard-subtitle">Chào mừng trở lại!</p>
      </div>
    </div>

    <div class="container py-5">
      <h2 class="section-title mb-4">
        <i class="fas fa-th-large me-2"></i>
        Quản Lý Nhanh
      </h2>

      <!-- Danh sách chức năng quản lý -->
      <div class="management-cards">
        <!--        <div class="management-card">
          <div class="card-icon">
            <i class="fas fa-user-friends"></i>
          </div>
          <div class="card-content">
            <h3>Quản lý khách hàng</h3>
            <p>Xem và cập nhật thông tin khách hàng</p>
            <router-link to="/customers" class="dashboard-btn">
              <span>Truy cập</span>
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
-->
        <div class="management-card">
          <div class="card-icon">
            <i class="fas fa-search"></i>
          </div>
          <div class="card-content">
            <h3>Kiểm tra mã đặt vé</h3>
            <p>Tra cứu thông tin chi tiết của một mã đặt vé</p>
            <router-link to="/staff/check-booking" class="dashboard-btn">
              <span>Truy cập</span>
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <div class="management-card">
          <div class="card-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="card-content">
            <h3>Đặt vé tại quầy</h3>
            <p>Xem danh sách phim và đặt vé cho khách hàng</p>
            <router-link to="/" class="dashboard-btn">
              <span>Bắt đầu</span>
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Using a different class to avoid potential style conflicts if needed */
.staff-dashboard .dashboard-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 2rem;
  position: relative;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.staff-dashboard .dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.staff-dashboard .dashboard-title {
  color: var(--cinema-primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.staff-dashboard .dashboard-subtitle {
  color: var(--cinema-text-muted);
  font-size: 1.1rem;
}

.staff-dashboard .stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.staff-dashboard .stat-card {
  background: linear-gradient(145deg, rgba(27, 38, 59, 0.8), rgba(13, 27, 42, 0.8));
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.staff-dashboard .stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.staff-dashboard .stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--cinema-gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1.5rem;
  color: var(--cinema-darker);
  flex-shrink: 0;
}

.staff-dashboard .stat-content h3 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--cinema-text);
}

.staff-dashboard .stat-content p {
  color: var(--cinema-text-muted);
  margin: 0;
  font-size: 0.9rem;
}

.staff-dashboard .section-title {
  color: var(--cinema-primary);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.staff-dashboard .management-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.staff-dashboard .management-card {
  background: rgba(4, 4, 4, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.staff-dashboard .management-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(247, 197, 72, 0.3);
}

.staff-dashboard .management-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: var(--cinema-gradient-gold);
  transition: all 0.3s ease;
}

.staff-dashboard .management-card:hover::before {
  background: var(--cinema-gradient-primary);
}

.staff-dashboard .card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--cinema-primary);
}

.staff-dashboard .card-content h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--cinema-text);
}

.staff-dashboard .card-content p {
  color: var(--cinema-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.staff-dashboard .dashboard-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--cinema-primary);
  color: var(--cinema-primary);
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.staff-dashboard .dashboard-btn span {
  margin-right: 0.5rem;
}

.staff-dashboard .dashboard-btn:hover {
  background-color: var(--cinema-primary);
  color: white;
}

.staff-dashboard .dashboard-btn.disabled {
  border-color: #6c757d;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.staff-dashboard .dashboard-btn.disabled:hover {
  background-color: transparent;
  color: #6c757d;
}
</style>
