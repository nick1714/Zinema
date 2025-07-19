<script setup>
import { computed } from 'vue'
const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    default: 3,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
})

const $emit = defineEmits(['update:currentPage'])

const pages = computed(() => {
  const pages = []
  const half = Math.floor(props.length / 2)
  let start = props.currentPage - half
  let end = props.currentPage + half

  if (start <= 0) {
    start = 1
    end = props.length
  }
  if (end > props.totalPages) {
    end = props.totalPages
    start = end - props.length + 1
    if (start <= 0) start = 1
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})
</script>

<template>
  <nav>
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a
          role="button"
          class="page-link"
          @click.prevent="$emit('update:currentPage', currentPage - 1)"
        >
          <span>&laquo;</span>
        </a>
      </li>
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: currentPage === page }"
      >
        <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', page)">
          {{ page }}</a
        >
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a
          role="button"
          class="page-link"
          @click.prevent="$emit('update:currentPage', currentPage + 1)"
          ><span>&raquo;</span></a
        >
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  gap: 0.5rem;
}

.page-item {
  margin: 0;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.page-link:hover:not(.disabled) {
  background: rgba(247, 197, 72, 0.1);
  border-color: rgba(247, 197, 72, 0.3);
  color: var(--cinema-primary);
  transform: translateY(-2px);
}

.page-item.active .page-link {
  background: var(--cinema-gradient-gold);
  border-color: rgba(247, 197, 72, 0.5);
  color: var(--cinema-darker);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(247, 197, 72, 0.3);
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.3);
  border-color: rgba(255, 255, 255, 0.05);
  color: var(--cinema-text-muted);
}

.page-item.disabled .page-link:hover {
  background: rgba(15, 23, 42, 0.3);
  border-color: rgba(255, 255, 255, 0.05);
  color: var(--cinema-text-muted);
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination {
    gap: 0.25rem;
  }

  .page-link {
    min-width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}
</style>
