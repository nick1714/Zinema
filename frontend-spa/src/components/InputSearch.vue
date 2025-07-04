<script setup>
import { defineModel } from 'vue'

/**
 * Component ô tìm kiếm tùy chỉnh
 * Sử dụng defineModel để kết hợp v-model giữa parent và component
 */
const searchValue = defineModel()

/**
 * Props component
 */
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm...',
  },
})
</script>

<template>
  <div class="cinema-search">
    <div class="search-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        class="search-input"
        :placeholder="props.placeholder"
        v-model="searchValue"
      />
      <button v-if="searchValue" class="clear-button" @click="searchValue = ''">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Container tìm kiếm */
.cinema-search {
  width: 100%;
  margin-bottom: 1rem;
}

/* Wrapper ô input */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-wrapper:focus-within {
  border-color: var(--cinema-primary);
  box-shadow: 0 0 0 3px rgba(247, 197, 72, 0.25);
}

/* Icon tìm kiếm */
.search-icon {
  position: absolute;
  left: 15px;
  color: var(--cinema-primary);
  font-size: 1rem;
  pointer-events: none;
}

/* Input tìm kiếm */
.search-input {
  width: 100%;
  background-color: transparent;
  border: none;
  color: var(--cinema-text);
  font-size: 1rem;
  padding: 12px 40px 12px 40px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Nút xóa */
.clear-button {
  position: absolute;
  right: 15px;
  background-color: transparent;
  border: none;
  color: var(--cinema-text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  transition: all 0.2s ease;
}

.clear-button:hover {
  color: var(--cinema-primary);
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
