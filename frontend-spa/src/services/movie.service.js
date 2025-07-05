import axios from 'axios'
import { API_BASE_URL, STATIC_BASE_URL } from '@/constants'

const API_URL = API_BASE_URL

/**
 * Hàm lấy headers xác thực
 * @returns {Object} - Headers với token xác thực
 */
function getAuthHeaders() {
  const token = localStorage.getItem('cinema_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Hàm xử lý URL poster
 * @param {string} posterUrl - Đường dẫn poster từ API
 * @returns {string} - URL đầy đủ của poster
 */
function processImageUrl(posterUrl) {
  if (!posterUrl) return null

  // Nếu là URL đầy đủ, trả về nguyên vẹn
  if (posterUrl.startsWith('http')) {
    return posterUrl
  }

  // Chỉ cần nối STATIC_BASE_URL vì backend trả về đường dẫn bắt đầu bằng /public
  return `${STATIC_BASE_URL}${posterUrl}`
}

/**
 * Service xử lý các API liên quan đến phim
 */
class MovieService {
  /**
   * Lấy danh sách phim với phân trang và lọc
   * @param {Object} params - Các tham số query
   * @returns {Promise<Object>} - Promise chứa danh sách phim và metadata
   */
  async getMovies(params = {}) {
    const response = await axios.get(`${API_URL}/movies`, {
      params,
      headers: getAuthHeaders(),
    })

    // Xử lý URL poster cho từng phim
    const movies = response.data.data.movies
    if (movies && Array.isArray(movies)) {
      movies.forEach((movie) => {
        movie.poster_url = processImageUrl(movie.poster_url)
      })
    }

    return response.data.data
  }

  /**
   * Lấy thông tin chi tiết của phim
   * @param {number} id - ID của phim
   * @returns {Promise<Object>} - Promise chứa thông tin phim
   */
  async getMovieById(id) {
    const response = await axios.get(`${API_URL}/movies/${id}`, {
      headers: getAuthHeaders(),
    })

    // Xử lý URL poster cho phim
    const movie = response.data.data.movie
    if (movie && movie.poster_url) {
      movie.poster_url = processImageUrl(movie.poster_url)
    }

    return response.data.data.movie
  }

  /**
   * Tạo phim mới
   * @param {Object} movieData - Dữ liệu phim
   * @param {File} posterFile - File poster của phim
   * @returns {Promise<Object>} - Promise chứa thông tin phim vừa tạo
   */
  async createMovie(movieData, posterFile) {
    const formData = new FormData()

    // Thêm dữ liệu phim vào FormData
    Object.keys(movieData).forEach((key) => {
      formData.append(key, movieData[key])
    })

    // Thêm file poster nếu có
    if (posterFile) {
      formData.append('posterFile', posterFile)
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders(),
    }

    const response = await axios.post(`${API_URL}/movies`, formData, { headers })
    return response.data.data.movie
  }

  /**
   * Cập nhật thông tin phim
   * @param {number} id - ID của phim
   * @param {Object} movieData - Dữ liệu phim cần cập nhật
   * @param {File} posterFile - File poster mới (nếu có)
   * @returns {Promise<Object>} - Promise chứa thông tin phim sau khi cập nhật
   */
  async updateMovie(id, movieData, posterFile) {
    const formData = new FormData()

    // Thêm dữ liệu phim vào FormData
    Object.keys(movieData).forEach((key) => {
      if (movieData[key] !== undefined) {
        formData.append(key, movieData[key])
      }
    })

    // Thêm file poster nếu có
    if (posterFile) {
      formData.append('posterFile', posterFile)
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders(),
    }

    const response = await axios.put(`${API_URL}/movies/${id}`, formData, { headers })
    return response.data.data.movie
  }

  /**
   * Xóa phim (cập nhật trạng thái thành inactive)
   * @param {number} id - ID của phim cần xóa
   * @returns {Promise<Object>} - Promise chứa kết quả xóa
   */
  async deleteMovie(id) {
    const response = await axios.delete(`${API_URL}/movies/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.data
  }
}

export default new MovieService()
