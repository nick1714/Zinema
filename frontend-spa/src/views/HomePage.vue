<template>
  <div class="home-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <i class="fas fa-film me-2"></i>
          Phim Đang Chiếu
        </h1>
        <p class="page-subtitle">Chọn phim yêu thích và đặt vé ngay hôm nay!</p>
      </div>
    </div>
    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin"></i>
        <p>Đang tải danh sách phim...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Đã xảy ra lỗi</h3>
        <p>{{ error }}</p>
        <button @click="retryFetch" class="btn-retry">Thử lại</button>
      </div>

      <!-- Movie Grid -->
      <div v-else-if="movies.length > 0" class="movie-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-video-slash"></i>
        <h3>Chưa có phim đang chiếu</h3>
        <p>Vui lòng quay lại sau để cập nhật những bộ phim mới nhất.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNowShowingMovies } from '@/composables/useMovies'
import MovieCard from '@/components/MovieCard.vue'

const { data: moviesResponse, isLoading, error, refetch } = useNowShowingMovies({ limit: 20 })

// Extract movies array from response
const movies = computed(() => moviesResponse.value?.movies || [])

function retryFetch() {
  refetch()
}
</script>

<style scoped>
/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-title {
  color: var(--cinema-primary);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--cinema-text-muted);
  font-size: 1.1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Movie Grid */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--cinema-primary);
  opacity: 0.8;
}

.error-state i {
  color: var(--cinema-secondary);
}

.empty-state i {
  opacity: 0.5;
}

h3 {
  color: var(--cinema-text);
  margin-bottom: 0.5rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--cinema-gradient-gold);
  border: none;
  color: var(--cinema-darker);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  filter: brightness(1.1);
}
</style>
