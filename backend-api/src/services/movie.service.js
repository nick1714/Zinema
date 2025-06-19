const { unlink } = require('node:fs');

const knex = require('../database/knex');
const Paginator = require('./paginator');

/**
 * Repository pattern cho table movies
 * @returns {Object} - Knex query builder cho table movies
 */
function movieRepository() {
    return knex('movies');
}

/**
 * Filter và transform dữ liệu movie từ request payload
 * Chỉ lấy các fields có giá trị và map field names cho khớp với database schema
 * @param {Object} payload - Raw data từ request body
 * @returns {Object} - Filtered data object cho database operations
 */
function readMovieData(payload) {
    return {
        // Chỉ thêm field nếu có giá trị (truthy)
        ...(payload.title && { title: payload.title }),
        ...(payload.description && { description: payload.description }),
        // Map 'duration' từ API thành 'duration_min' trong database
        ...(payload.duration && { duration_min: payload.duration }),
        ...(payload.release_date && { release_date: payload.release_date }),
        ...(payload.genre && { genre: payload.genre }),
        ...(payload.director && { director: payload.director }),
        ...(payload.cast && { cast: payload.cast }),
        ...(payload.country && { country: payload.country }),
        // Map 'rating' từ API thành 'age_rating' trong database
        ...(payload.rating && { age_rating: payload.rating }),
        ...(payload.poster_url && { poster_url: payload.poster_url }),
        ...(payload.trailer_url && { trailer_url: payload.trailer_url }),
        ...(payload.status && { status: payload.status }),
    };
}

/**
 * Tạo mới một bộ phim
 * @param {Object} payload - Dữ liệu phim từ request body
 * @returns {Promise<Object>} - Object chứa thông tin phim vừa tạo bao gồm ID
 */
async function createMovie(payload) {
    try {
        // Filter và transform dữ liệu cho database
        const movieData = readMovieData(payload);
        console.log("Data to insert:", movieData);
        
        // Thêm timestamps
        const now = new Date();
        const ids = await movieRepository().insert({
            ...movieData,
            created_at: now,
            updated_at: now
        }).returning('id');
        
        // Extract ID từ kết quả insert
        const id = ids[0].id;
        
        // Trả về object với ID và data vừa insert
        return { id, ...movieData };
    } catch (error) {
        console.error("Error in createMovie service:", error);
        throw error;
    }
}

/**
 * Lấy danh sách tất cả phim với phân trang và filtering
 * @param {Object} query - Query parameters từ request
 * @param {string} query.title - Tiêu đề phim để tìm kiếm (optional)
 * @param {string} query.genre - Thể loại phim để lọc (optional)
 * @param {string} query.status - Trạng thái phim để lọc (optional)
 * @param {string} query.director - Tên đạo diễn để tìm kiếm (optional)
 * @param {number} query.page - Số trang (default: 1)
 * @param {number} query.limit - Số items per page (default: 10)
 * @returns {Promise<Object>} - Object chứa danh sách movies và metadata
 */
async function getAllMovies(query) {
    // Destructure các query parameters với default values
    const { title, genre, status, director, page = 1, limit = 10 } = query;
    
    // Tạo paginator để xử lý phân trang
    const paginator = new Paginator(page, limit);
  
    // Query database với multiple filtering conditions
    const results = await movieRepository()
      .where((builder) => {
        // Tìm kiếm theo tiêu đề 
        if (title) {
          builder.where('title', 'ilike', `%${title}%`);
        }
        // Tìm kiếm theo thể loại 
        if (genre) {
          builder.where('genre', 'ilike', `%${genre}%`);
        }
        // Lọc theo trạng thái 
        if (status) {
          builder.where('status', status);
        }
        // Tìm kiếm theo tên đạo diễn
        if (director) {
          builder.where('director', 'ilike', `%${director}%`);
        }
      })
      .select(
        // Sử dụng window function để đếm tổng records
        knex.raw('COUNT(id) OVER() AS record_count'),
        'id',
        'title',
        'description',
        'duration_min',
        'release_date',
        'end_date',
        'genre',
        'director',
        'cast',
        'country',
        'age_rating',
        'poster_url',
        'trailer_url',
        'status',
        'created_at',
        'updated_at'
      )
      .orderBy('created_at', 'desc') // Sắp xếp theo ngày tạo mới nhất
      .limit(paginator.limit) // Giới hạn số records / page
      .offset(paginator.offset); // Skip records của các trang trước
  
    // Lấy tổng số records từ window function
    const totalRecords = results[0]?.record_count ?? 0;
  
    // Xóa field record_count khỏi kết quả trả về
    const movies = results.map((result) => {
      result.record_count = undefined;
      return result;
    });
  
    // Trả về data và metadata phân trang
    return {
      metadata: paginator.getMetadata(totalRecords),
      movies,
    };
}

/**
 * Lấy thông tin chi tiết của một bộ phim theo ID
 * @param {number} id - ID của bộ phim
 * @returns {Promise<Object|null>} - Object chứa thông tin phim hoặc null nếu không tìm thấy
 */
async function getMovieById(id) {
  // Query phim theo ID và trả về record đầu tiên (hoặc null)
  return movieRepository().where('id', id).select('*').first();
}

/**
 * Cập nhật thông tin bộ phim
 * @param {number} id - ID của bộ phim cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật từ request body
 * @returns {Promise<Object|null>} - Object chứa thông tin phim sau khi cập nhật hoặc null nếu không tìm thấy
 */
async function updateMovie(id, updateData) {
  // Lấy thông tin phim hiện tại để kiểm tra tồn tại và cleanup file
  const updatedMovie = await movieRepository()
      .where('id', id)
      .select('*')
      .first();

  // Trả về null nếu phim không tồn tại
  if (!updatedMovie) {
      return null;
  }

  // Filter và transform dữ liệu cập nhật
  const movieData = readMovieData(updateData);

  // Chỉ update nếu có dữ liệu hợp lệ
  if (Object.keys(movieData).length > 0) {
      await movieRepository().where('id', id).update({
          ...movieData,
          updated_at: new Date() // Cập nhật timestamp
      });
  }

  // File cleanup: Xóa file poster cũ nếu có poster mới và poster cũ không phải default
  if (
      movieData.poster_url &&
      updatedMovie.poster_url &&
      movieData.poster_url !== updatedMovie.poster_url &&
      updatedMovie.poster_url.startsWith('/public/uploads')
  ) {
      unlink(`.${updatedMovie.poster_url}`, () => {}); 
  }

  // Merge old data với new data và trả về
  return { ...updatedMovie, ...movieData };
}

/**
 * Xóa một bộ phim theo ID
 * @param {number} id - ID của bộ phim cần xóa
 * @returns {Promise<Object|null>} - Object chứa thông tin phim vừa xóa hoặc null nếu không tìm thấy
 */
async function deleteMovie(id) {
  // Lấy thông tin poster trước khi xóa để cleanup file
  const deletedMovie = await movieRepository()
      .where('id', id)
      .select('poster_url')
      .first();

  // Trả về null nếu phim không tồn tại
  if (!deletedMovie) {
      return null;
  }

  // Xóa record khỏi database
  await movieRepository().where('id', id).del();

  // File cleanup: Xóa file poster nếu không phải default
  if (
      deletedMovie.poster_url &&
      deletedMovie.poster_url.startsWith('/public/uploads')
  ) {
      unlink(`.${deletedMovie.poster_url}`, () => {}); // Async file delete, ignore errors
  }

  return deletedMovie;
}

/**
 * Xóa tất cả bộ phim trong database
 * @returns {Promise<void>} - Không trả về gì
 */
async function deleteAllMovies() {
  // Lấy danh sách poster URLs trước khi xóa để cleanup files
  const movies = await movieRepository().select('poster_url');
  
  // Xóa tất cả records khỏi database
  await movieRepository().del();

  // File cleanup: Xóa tất cả file poster (trừ default)
  movies.forEach((movie) => {
      if (movie.poster_url && movie.poster_url.startsWith('/public/uploads')) {  
          unlink(`.${movie.poster_url}`, () => {}); // Async file delete, ignore errors
      }
  });
}

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    deleteAllMovies
}; 