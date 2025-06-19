const knex = require('../database/knex');
const Paginator = require('./paginator');

/**
 * Lấy danh sách tất cả phòng chiếu với phân trang và lọc
 * @param {Object} query - Query parameters từ request
 * @param {string} query.name - Tên phòng để tìm kiếm (optional)
 * @param {string} query.status - Trạng thái phòng để lọc (optional)
 * @param {number} query.page - Số trang (default: 1)
 * @param {number} query.limit - Số items per page (default: 10)
 * @returns {Promise<Object>} - Object chứa danh sách rooms và metadata
 */
async function getAllRooms(query) {
    // Destructure các query parameters với default values
    const { name, status, page = 1, limit = 10 } = query;
    
    // Tạo paginator để xử lý phân trang
    const paginator = new Paginator(page, limit);
  
    // Query database với filtering và pagination
    const results = await knex('cinema_rooms')
      .where((builder) => {
        // Tìm kiếm theo tên (case-insensitive, partial match)
        if (name) {
          builder.where('name', 'ilike', `%${name}%`);
        }
        // Lọc theo trạng thái (exact match)
        if (status) {
          builder.where('status', status);
        }
      })
      .select(
        // Sử dụng window function để đếm tổng records
        knex.raw('COUNT(id) OVER() AS record_count'),
        'id',
        'name',
        'capacity',
        'status',
        'created_at',
        'updated_at'
      )
      .orderBy('id', 'asc') // Sắp xếp theo ID tăng dần
      .limit(paginator.limit) // Giới hạn số records per page
      .offset(paginator.offset); // Skip records của các trang trước
  
    // Lấy tổng số records từ window function
    const totalRecords = results[0]?.record_count ?? 0;
  
    // Xóa field record_count khỏi kết quả trả về
    const rooms = results.map((result) => {
      result.record_count = undefined;
      return result;
    });
  
    // Trả về data và metadata phân trang
    return {
      metadata: paginator.getMetadata(totalRecords),
      rooms,
    };
}

/**
 * Lấy thông tin chi tiết của một phòng chiếu theo ID
 * @param {number} id - ID của phòng chiếu
 * @returns {Promise<Object|null>} - Object chứa thông tin phòng hoặc null nếu không tìm thấy
 */
async function getRoomById(id) {
  // Query phòng chiếu theo ID và trả về record đầu tiên (hoặc null)
  return knex('cinema_rooms').where('id', id).select('*').first();
}

module.exports = {
    getAllRooms,
    getRoomById
}; 