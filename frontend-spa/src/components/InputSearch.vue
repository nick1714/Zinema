<script setup>
import { defineModel } from 'vue'

const searchValue = defineModel()
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm...',
  },
})
</script>

<template>
  <div class="input-search">
    <div class="input-group">
      <span class="input-group-text">
        <i class="fas fa-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        :placeholder="props.placeholder"
        v-model="searchValue"
      />
    </div>
  </div>
</template>

<style scoped>
.input-search .input-group-text {
  background-color: #e50914;
  color: white;
  border-color: #e50914;
}

.input-search .form-control:focus {
  border-color: #e50914;
  box-shadow: 0 0 0 0.2rem rgba(229, 9, 20, 0.25);
}
</style>
