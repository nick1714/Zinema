import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import movieService from '@/services/movie.service'

const MOVIE_QUERY_KEY = 'movies'

// Helper to unwrap refs without using unref (available to all functions in this module)
function toVal(source) {
  return source && typeof source === 'object' && 'value' in source ? source.value : source
}

/**
 * Composable hook để quản lý phim
 */
export function useMovies() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Local state for filters (using ref instead of reactive)
  const _filtersRef = ref({
    title: '',
    genre: '',
    status: 'active',
    director: '',
    page: 1,
    limit: 10,
  })

  // Expose a proxy so components can keep using `filters.xxx` without `.value`
  const filters = new Proxy(_filtersRef.value, {
    get(target, prop) {
      return _filtersRef.value[prop]
    },
    set(target, prop, value) {
      _filtersRef.value[prop] = value
      return true
    },
  })

  // Mutations
  const createMovieMutation = useMutation({
    mutationFn: movieService.createMovie,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [MOVIE_QUERY_KEY] })
      if (data && data.movie) {
        queryClient.setQueryData([MOVIE_QUERY_KEY, data.movie.id], data.movie)
      }
    },
    onError: (error) => {
      console.error('Create movie error:', error)
    },
  })

  const updateMovieMutation = useMutation({
    mutationFn: ({ id, data }) => movieService.updateMovie(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MOVIE_QUERY_KEY] })
      if (data && data.movie) {
        queryClient.setQueryData([MOVIE_QUERY_KEY, variables.id], data.movie)
      }
    },
    onError: (error) => {
      console.error('Update movie error:', error)
    },
  })

  const deleteMovieMutation = useMutation({
    mutationFn: movieService.deleteMovie,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MOVIE_QUERY_KEY] })
      queryClient.removeQueries({ queryKey: [MOVIE_QUERY_KEY, variables] })
    },
  })

  /**
   * Thay đổi trang
   * @param {number} page - Số trang mới
   */
  function changePage(page) {
    _filtersRef.value.page = page
  }

  /**
   * Áp dụng bộ lọc mới
   * @param {Object} newFilters - Bộ lọc mới
   */
  function applyFilters(newFilters) {
    Object.assign(_filtersRef.value, newFilters, { page: 1 }) // Reset về trang 1 khi lọc
  }

  /**
   * Reset bộ lọc về mặc định
   */
  function resetFilters() {
    Object.assign(_filtersRef.value, {
      title: '',
      genre: '',
      status: 'active',
      director: '',
      page: 1,
      limit: 10,
    })
  }

  return {
    // Local state
    filters,

    // Mutations
    createMovie: createMovieMutation,
    updateMovie: updateMovieMutation,
    deleteMovie: deleteMovieMutation,

    // Loading states
    isCreatingMovie: computed(() => createMovieMutation.isPending.value),
    isUpdatingMovie: computed(() => updateMovieMutation.isPending.value),
    isDeletingMovie: computed(() => deleteMovieMutation.isPending.value),

    // Error states
    createMovieError: computed(() => createMovieMutation.error),
    updateMovieError: computed(() => updateMovieMutation.error),
    deleteMovieError: computed(() => deleteMovieMutation.error),

    // Methods
    changePage,
    applyFilters,
    resetFilters,
  }
}

/**
 * Composable để lấy danh sách phim với filter và phân trang
 */
export function useMoviesList(filters = {}) {
  // Loại bỏ các tham số rỗng khỏi bộ lọc
  const cleanFilters = computed(() => {
    const src = toVal(filters)
    return Object.fromEntries(
      Object.entries(src).filter(([_, value]) => value !== '' && value !== null)
    )
  })

  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'list', cleanFilters],
    queryFn: () => movieService.getMovies(cleanFilters.value),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Giữ data cũ khi refetch
  })
}

/**
 * Composable để lấy chi tiết phim theo ID
 */
export function useMovieById(movieId) {
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, toVal(movieId)],
    queryFn: () => movieService.getMovieById(toVal(movieId)),
    enabled: computed(() => !!toVal(movieId)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi 404
      if (error.response?.status === 404) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Composable để lấy movies theo genre
 */
export function useMoviesByGenre(genre, params = {}) {
  const queryParams = computed(() => ({ ...toVal(params), genre: toVal(genre) }))
  
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'genre', toVal(genre), params],
    queryFn: () => movieService.getMovies(queryParams.value),
    enabled: computed(() => !!toVal(genre)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Composable để lấy movies theo status
 */
export function useMoviesByStatus(status, params = {}) {
  const queryParams = computed(() => ({ ...toVal(params), status: toVal(status) }))
  
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'status', toVal(status), params],
    queryFn: () => movieService.getMovies(queryParams.value),
    enabled: computed(() => !!toVal(status)),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Composable để search movies theo title
 */
export function useMoviesSearch(searchTerm, params = {}) {
  const queryParams = computed(() => ({ ...toVal(params), title: toVal(searchTerm) }))
  
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'search', toVal(searchTerm), params],
    queryFn: () => movieService.getMovies(queryParams.value),
    enabled: computed(() => {
      const term = toVal(searchTerm)
      return !!term && term.length > 2
    }),
    staleTime: 1 * 60 * 1000, // 1 minute - search results có thể thay đổi
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Composable để lấy now showing movies
 */
export function useNowShowingMovies(params = {}) {
  const queryParams = computed(() => ({ ...toVal(params), status: 'active' }))
  
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'now-showing', params],
    queryFn: () => movieService.getMovies(queryParams.value),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Composable để lấy upcoming movies
 */
export function useUpcomingMovies(params = {}) {
  const queryParams = computed(() => ({ ...toVal(params), status: 'upcoming' }))
  
  return useQuery({
    queryKey: [MOVIE_QUERY_KEY, 'upcoming', params],
    queryFn: () => movieService.getMovies(queryParams.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}
