<template>
  <div class="movie-card">
    <div class="poster-container">
      <img 
        :src="posterUrl" 
        :alt="movie.title" 
        class="movie-poster"
        @error="handleImageError"
      >
      <div class="movie-status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      
      <div class="movie-meta">
        <span class="movie-duration">
          <i class="fas fa-clock"></i> {{ movie.duration_min }} phút
        </span>
        <span class="movie-rating">
          <i class="fas fa-star"></i> {{ movie.age_rating }}
        </span>
      </div>
      
      <div class="movie-genre">
        <i class="fas fa-film"></i> {{ movie.genre }}
      </div>
      
      <div class="card-actions">
        <router-link 
          :to="`/admin/movies/${movie.id}`" 
          class="btn-view"
        >
          <i class="fas fa-eye"></i> Chi tiết
        </router-link>
        
        <button 
          @click="$emit('delete', movie.id)" 
          class="btn-delete"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { STATIC_BASE_URL } from '@/constants';

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
});

defineEmits(['delete']);

// Xử lý ảnh lỗi
const imageError = ref(false);
const defaultPoster = '/public/images/default-movie-poster.png';

function handleImageError() {
  imageError.value = true;
}

const posterUrl = computed(() => {
  if (imageError.value) {
    return `${STATIC_BASE_URL}${defaultPoster}`;
  }
  
  // movie.poster_url đã được xử lý thành URL đầy đủ trong service
  return props.movie.poster_url || `${STATIC_BASE_URL}${defaultPoster}`;
});

// Hiển thị trạng thái
const statusClass = computed(() => {
  return props.movie.status === 'active' ? 'status-active' : 'status-inactive';
});

const statusText = computed(() => {
  return props.movie.status === 'active' ? 'Đang chiếu' : 'Ngừng chiếu';
});
</script>

<style scoped>
.movie-card {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(247, 197, 72, 0.3);
}

.poster-container {
  position: relative;
  width: 100%;
  padding-top: 150%; /* Tỷ lệ 2:3 cho poster phim */
  overflow: hidden;
}

.movie-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.movie-card:hover .movie-poster {
  transform: scale(1.05);
}

.movie-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background-color: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-inactive {
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
}

.movie-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--cinema-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
}

.movie-meta {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--cinema-text-muted);
}

.movie-duration {
  margin-right: 1rem;
}

.movie-genre {
  font-size: 0.85rem;
  color: var(--cinema-text-muted);
  margin-bottom: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-view {
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
  flex-grow: 1;
  text-align: center;
  margin-right: 0.5rem;
}

.btn-view:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(247, 197, 72, 0.3);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}
</style> 