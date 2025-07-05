<template>
  <div class="movie-list-page">
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-title">
            <h1 class="page-title">
              <i class="fas fa-film me-2"></i>
              Quản lý phim
            </h1>
            <p class="page-subtitle">Thêm, sửa, xóa thông tin phim</p>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="resetFilters">
              <i class="fas fa-sync-alt"></i>
              <span>Làm mới</span>
            </button>
            <router-link to="/admin/movies/add" class="action-btn-primary">
              <i class="fas fa-plus"></i>
              <span>Thêm phim mới</span>
            </router-link>
          </div>
        </div>
        
        <!-- Search and Filters -->
        <div class="search-filters-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchTitle" 
              placeholder="Tìm theo tên phim..."
              @input="debounceSearch"
            >
            <i class="fas fa-search"></i>
          </div>
          
          <div class="filter-group">
            <select v-model="filters.status" @change="applyFilters">
              <option value="active">Đang chiếu</option>
              <option value="inactive">Ngừng chiếu</option>
              <option value="">Tất cả</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="container py-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchMovies" class="btn-retry">
          Thử lại
        </button>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="movies.length === 0" class="empty-container">
        <i class="fas fa-film"></i>
        <p>Không có phim nào</p>
        <router-link to="/admin/movies/add" class="btn-add">
          Thêm phim mới
        </router-link>
      </div>
      
      <!-- Movie grid -->
      <div v-else class="movie-grid">
        <movie-card 
          v-for="movie in movies" 
          :key="movie.id" 
          :movie="movie"
          @delete="confirmDelete"
        />
      </div>
      
      <!-- Pagination -->
      <main-pagination 
        v-if="movies.length > 0"
        :current-page="metadata.page" 
        :total-pages="totalPages"
        @page-change="changePage"
      />
    </div>
    
    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Xác nhận xóa phim</h3>
        <p class="modal-text">
          Bạn có chắc chắn muốn xóa phim này không? Hành động này không thể hoàn tác.
        </p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">
            Hủy
          </button>
          <button class="btn-confirm" @click="handleDelete">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMovies } from '@/composables/useMovies';
import MovieCard from '@/components/MovieCard.vue';
import MainPagination from '@/components/MainPagination.vue';

// Composable
const { 
  movies, 
  isLoading, 
  error, 
  metadata, 
  filters,
  totalPages,
  fetchMovies, 
  changePage,
  applyFilters: applyMovieFilters,
  resetFilters: resetMovieFilters,
  deleteMovie
} = useMovies();

// Search state
const searchTitle = ref('');
const searchTimeout = ref(null);

// Delete modal
const showDeleteModal = ref(false);
const movieToDelete = ref(null);

// Debounce search
function debounceSearch() {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    applyFilters();
  }, 300);
}

// Apply filters
function applyFilters() {
  applyMovieFilters({
    title: searchTitle.value,
    status: filters.status
  });
}

// Reset filters
function resetFilters() {
  searchTitle.value = '';
  resetMovieFilters();
}

// Confirm delete
function confirmDelete(id) {
  movieToDelete.value = id;
  showDeleteModal.value = true;
}

// Handle delete
async function handleDelete() {
  if (!movieToDelete.value) return;
  
  try {
    await deleteMovie(movieToDelete.value);
    showDeleteModal.value = false;
    movieToDelete.value = null;
  } catch (err) {
    console.error('Lỗi khi xóa phim:', err);
  }
}

// Load data on mount
onMounted(() => {
  fetchMovies();
});
</script>

<style scoped>
/* Header */
.page-header {
  background: var(--cinema-gradient-dark);
  padding: 2rem 0;
  margin-bottom: 1rem;
  position: relative;
  border-bottom: 1px solid rgba(247, 197, 72, 0.2);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: var(--cinema-text);
  font-size: 0.9rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cinema-text-muted);
}

.filter-group {
  position: relative;
  z-index: 1;
}

.filter-group select {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: var(--cinema-text);
  font-size: 0.9rem;
  min-width: 150px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.action-btn, .action-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none; /* For router-link */
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--cinema-text);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-btn-primary {
  background: var(--cinema-gradient-gold);
  border: 1px solid rgba(247, 197, 72, 0.5);
  color: var(--cinema-darker);
}

.action-btn-primary:hover {
  filter: brightness(1.1);
}

/* Movie grid */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(247, 197, 72, 0.1);
  border-left-color: var(--cinema-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #ef4444;
}

.error-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Empty state */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: var(--cinema-text-muted);
}

.empty-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-container .btn-add {
  margin-top: 1.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--cinema-darker);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-title {
  color: var(--cinema-text);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal-text {
  color: var(--cinema-text-muted);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-confirm:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .search-filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style> 