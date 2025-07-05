<script setup>
/**
 * Props component
 */
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const $emit = defineEmits(['view-details'])

/**
 * Chuyển đổi role thành tên hiển thị
 * @param {string} role - Role của user: admin, employee, customer
 * @returns {string} Tên role hiển thị
 */
function formatRole(role) {
  const roleMap = {
    admin: 'Quản trị viên',
    employee: 'Nhân viên',
    customer: 'Khách hàng',
  }
  return roleMap[role] || role
}

/**
 * Lấy class cho badge theo role
 * @param {string} role - Role của user: admin, employee, customer
 * @returns {string} CSS class cho badge
 */
function getRoleClass(role) {
  const classMap = {
    admin: 'badge-admin',
    employee: 'badge-employee',
    customer: 'badge-customer',
  }
  return classMap[role] || 'badge-default'
}

/**
 * Lấy tên viết tắt cho avatar
 * @returns {string} Tên viết tắt
 */
function getInitials() {
  const name = props.user.name || props.user.full_name || ''
  if (!name) return '?'

  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
</script>

<template>
  <div class="cinema-user-card">
    <!-- Avatar và thông tin người dùng -->
    <div class="user-content">
      <div class="user-avatar" :class="getRoleClass(props.user.role)">
        {{ getInitials() }}
        </div>

      <div class="user-info">
        <h3 class="user-name">
          {{ props.user.name || props.user.full_name }}
          <span class="user-badge" :class="getRoleClass(props.user.role)">
            {{ formatRole(props.user.role) }}
          </span>
        </h3>

        <div class="user-details">
          <div class="detail-item">
            <i class="fas fa-phone"></i>
            <span>{{ props.user.phone_number }}</span>
          </div>

          <div class="detail-item" v-if="props.user.email">
            <i class="fas fa-envelope"></i>
            <span>{{ props.user.email }}</span>
          </div>

          <div class="detail-item" v-if="props.user.address">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ props.user.address }}</span>
          </div>
          </div>
        </div>
      </div>

    <!-- Các nút hành động -->
    <div v-if="props.showActions" class="user-actions">
      <button class="action-btn view-btn" @click="$emit('view-details', props.user)">
        <i class="fas fa-eye"></i>
        <span>Chi tiết</span>
        </button>
    </div>
  </div>
</template>

<style scoped>
/* User card container */
.cinema-user-card {
  background: rgba(13, 27, 42, 0.7);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.cinema-user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(247, 197, 72, 0.2);
}

/* User content */
.user-content {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Avatar */
.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

/* Avatar theo role */
.user-avatar.badge-admin {
  background: linear-gradient(135deg, var(--cinema-secondary) 0%, #aa1c1c 100%);
}

.user-avatar.badge-employee {
  background: linear-gradient(135deg, #eb9c38 0%, #c66f00 100%);
}

.user-avatar.badge-customer {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

/* Thông tin người dùng */
.user-info {
  flex: 1;
}

/* Tên người dùng */
.user-name {
  font-size: 1.1rem;
  color: var(--cinema-text);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-weight: 600;
}

/* Badge vai trò */
.user-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  margin-left: 0.5rem;
  font-weight: 600;
}

.badge-admin {
  background-color: rgba(254, 65, 65, 0.1);
  color: var(--cinema-secondary);
  border: 1px solid rgba(254, 65, 65, 0.3);
}

.badge-employee {
  background-color: rgba(247, 197, 72, 0.1);
  color: #eb9c38;
  border: 1px solid rgba(247, 197, 72, 0.3);
}

.badge-customer {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.badge-default {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text-muted);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Chi tiết người dùng */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--cinema-text-muted);
}

.detail-item i {
  width: 20px;
  margin-right: 0.5rem;
  color: var(--cinema-primary);
}

.detail-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Các nút hành động */
.user-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  color: var(--cinema-darker);
}

.action-btn i {
  margin-right: 0.35rem;
}

.view-btn {
  background: var(--cinema-gradient-gold);
  flex: 1;
}

.view-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
}
</style>
