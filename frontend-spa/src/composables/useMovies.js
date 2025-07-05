import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import movieService from '@/services/movie.service'

/**
 * Composable hook để quản lý phim
 */
export function useMovies() {
  const router = useRouter()

  // State
  const movies = ref([])
  const currentMovie = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Metadata cho phân trang
  const metadata = reactive({
    totalRecords: 0,
    firstPage: 1,
    lastPage: 1,
    page: 1,
    limit: 10,
  })

  // Filters
  const filters = reactive({
    title: '',
    genre: '',
    status: 'active',
    director: '',
    page: 1,
    limit: 10,
  })

  // Computed
  const totalPages = computed(() => metadata.lastPage)

  /**
   * Lấy danh sách phim với filter và phân trang
   */
  async function fetchMovies() {
    isLoading.value = true
    error.value = null

    try {
      const result = await movieService.getMovies(filters)
      movies.value = result.movies

      // Cập nhật metadata
      Object.assign(metadata, result.metadata)
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phim:', err)
      error.value = 'Không thể tải danh sách phim. Vui lòng thử lại sau.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy chi tiết phim theo ID
   * @param {number} id - ID của phim
   */
  async function fetchMovieById(id) {
    isLoading.value = true
    error.value = null

    try {
      currentMovie.value = await movieService.getMovieById(id)
    } catch (err) {
      console.error('Lỗi khi lấy thông tin phim:', err)
      
      // Xử lý thông báo lỗi chi tiết hơn
      if (err.response) {
        // Lỗi từ server với response
        if (err.response.status === 401) {
          error.value = 'Bạn không có quyền xem thông tin phim này. Vui lòng đăng nhập lại.'
        } else if (err.response.status === 404) {
          error.value = 'Không tìm thấy phim này. Có thể phim đã bị xóa.'
        } else {
          error.value = `Lỗi từ server: ${err.response.status} - ${err.response.data?.message || 'Không thể tải thông tin phim'}`
        }
      } else if (err.request) {
        // Không nhận được response
        error.value = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      } else {
        // Lỗi khác
        error.value = 'Không thể tải thông tin phim. Vui lòng thử lại sau.'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo phim mới
   * @param {Object} movieData - Dữ liệu phim
   * @param {File} posterFile - File poster
   */
  async function createMovie(movieData, posterFile) {
    isLoading.value = true
    error.value = null

    try {
      const createdMovie = await movieService.createMovie(movieData, posterFile)
      return createdMovie
    } catch (err) {
      console.error('Lỗi khi tạo phim:', err)
      error.value = 'Không thể tạo phim. Vui lòng thử lại sau.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cập nhật thông tin phim
   * @param {number} id - ID của phim
   * @param {Object} movieData - Dữ liệu phim cần cập nhật
   * @param {File} posterFile - File poster mới (nếu có)
   */
  async function updateMovie(id, movieData, posterFile) {
    isLoading.value = true
    error.value = null

    try {
      const updatedMovie = await movieService.updateMovie(id, movieData, posterFile)
      currentMovie.value = updatedMovie
      return updatedMovie
    } catch (err) {
      console.error('Lỗi khi cập nhật phim:', err)

      // Xử lý thông báo lỗi chi tiết hơn
      if (err.response) {
        // Lỗi từ server với response
        if (err.response.status === 401) {
          error.value = 'Bạn không có quyền cập nhật phim. Vui lòng đăng nhập lại.'
        } else if (err.response.status === 400) {
          error.value = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
        } else {
          error.value = `Lỗi từ server: ${err.response.status} - ${err.response.data?.message || 'Không thể cập nhật phim'}`
        }
      } else if (err.request) {
        // Không nhận được response
        error.value = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      } else {
        // Lỗi khác
        error.value = 'Không thể cập nhật phim. Vui lòng thử lại sau.'
      }

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa phim
   * @param {number} id - ID của phim cần xóa
   */
  async function deleteMovie(id) {
    isLoading.value = true
    error.value = null

    try {
      await movieService.deleteMovie(id)
      // Cập nhật lại danh sách sau khi xóa
      await fetchMovies()
    } catch (err) {
      console.error('Lỗi khi xóa phim:', err)
      error.value = 'Không thể xóa phim. Vui lòng thử lại sau.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Thay đổi trang
   * @param {number} page - Số trang mới
   */
  function changePage(page) {
    filters.page = page
    fetchMovies()
  }

  /**
   * Áp dụng bộ lọc mới
   * @param {Object} newFilters - Bộ lọc mới
   */
  function applyFilters(newFilters) {
    Object.assign(filters, newFilters, { page: 1 }) // Reset về trang 1 khi lọc
    fetchMovies()
  }

  /**
   * Reset bộ lọc về mặc định
   */
  function resetFilters() {
    Object.assign(filters, {
      title: '',
      genre: '',
      status: 'active',
      director: '',
      page: 1,
      limit: 10,
    })
    fetchMovies()
  }

  return {
    // State
    movies,
    currentMovie,
    isLoading,
    error,
    metadata,
    filters,
    totalPages,

    // Methods
    fetchMovies,
    fetchMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    changePage,
    applyFilters,
    resetFilters,
  }
}
 