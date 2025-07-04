<script setup>
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

const $emit = defineEmits(['edit', 'view-details'])
</script>

<template>
  <div class="card user-card">
    <div class="card-body">
      <div class="d-flex align-items-start">
        <div class="avatar me-3">
          <i class="fas fa-user-circle fa-3x text-muted"></i>
        </div>

        <div class="flex-grow-1">
          <h5 class="card-title mb-1">{{ props.user.full_name }}</h5>

          <div class="user-info">
            <p class="mb-1">
              <i class="fas fa-phone me-2"></i>
              {{ props.user.phone_number }}
            </p>
            <p class="mb-1" v-if="props.user.email">
              <i class="fas fa-envelope me-2"></i>
              {{ props.user.email }}
            </p>
            <p class="mb-0" v-if="props.user.address">
              <i class="fas fa-map-marker-alt me-2"></i>
              {{ props.user.address }}
            </p>
            <p class="mb-0" v-if="props.user.gender">
              <i class="fas fa-venus-mars me-2"></i>
              {{ props.user.gender }}
            </p>
            <p class="mb-0" v-if="props.user.position">
              <i class="fas fa-briefcase me-2"></i>
              {{ props.user.position }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="props.showActions" class="card-actions mt-3">
        <button
          class="btn btn-sm btn-outline-primary me-2"
          @click="$emit('view-details', props.user)"
        >
          <i class="fas fa-eye me-1"></i>
          Chi tiết
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-info {
  font-size: 0.9rem;
  color: #6c757d;
}

.card-actions {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}
</style>
