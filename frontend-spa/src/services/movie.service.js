import { API_BASE_URL, DEFAULT_IMAGE, STATIC_BASE_URL } from '@/constants'

/**
 * Custom fetch wrapper với error handling
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function efetch(url, options = {}) {
  let result = {}
  let json = {}

  try {
    result = await fetch(url, options)
    json = await result.json()
  } catch (error) {
    throw new Error(error.message)
  }

  if (!result.ok || json.status !== 'success') {
    throw new Error(json.message || 'Request failed')
  }

  return json.data
}

function makeMovieService() {
  const baseUrl = `${API_BASE_URL}/movies`

  function getFullPosterUrl(posterPath) {
    if (posterPath) {
      return `${STATIC_BASE_URL}${posterPath}`
    }
    return `${STATIC_BASE_URL}/public${DEFAULT_IMAGE}`
  }

  function getAuthHeaders() {
    const token = localStorage.getItem('cinema_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function getMovies(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const url = `${baseUrl}?${queryParams}`
    const data = await efetch(url, { headers: getAuthHeaders() })

    if (data.movies && Array.isArray(data.movies)) {
      data.movies = data.movies.map((movie) => ({
        ...movie,
        poster_url: getFullPosterUrl(movie.poster_url),
      }))
    }

    return data
  }

  async function getMovieById(id) {
    const { movie } = await efetch(`${baseUrl}/${id}`, { headers: getAuthHeaders() })
    return {
      ...movie,
      poster_url: getFullPosterUrl(movie.poster_url),
    }
  }

  async function createMovie(movieData) {
    return efetch(baseUrl, {
      method: 'POST',
      headers: { ...getAuthHeaders() }, // Không cần Content-Type, browser tự xử lý cho FormData
      body: movieData,
    })
  }

  async function updateMovie(id, movieData) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders() }, // Không cần Content-Type
      body: movieData,
    })
  }

  async function deleteMovie(id) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  }

  return {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
  }
}

export default makeMovieService()
