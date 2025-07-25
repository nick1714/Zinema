const knex = require("../database/knex");
const Paginator = require("./paginator");

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
  const results = await knex("cinema_rooms")
    .where((builder) => {
      // Tìm kiếm theo tên (case-insensitive, partial match)
      if (name) {
        builder.where("name", "ilike", `%${name}%`);
      }
      // Lọc theo trạng thái (exact match)
      if (status) {
        builder.where("status", status);
      }
    })
    .select(
      // Sử dụng window function để đếm tổng records
      knex.raw("COUNT(id) OVER() AS record_count"),
      "id",
      "name",
      "capacity",
      "status",
      "created_at",
      "updated_at"
    )
    .orderBy("id", "asc") // Sắp xếp theo ID tăng dần
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
  return knex("cinema_rooms").where("id", id).select("*").first();
}

/**
 * Tạo phòng chiếu mới
 * @param {Object} data - Dữ liệu của phòng chiếu mới
 * @returns {Promise<Object>} - Object chứa thông tin phòng vừa tạo
 */
async function createRoom(data) {
  console.log("CREATE ROOM INPUT:", data);

  try {
    // Đảm bảo các trường bắt buộc có giá trị
    if (!data || !data.name || typeof data.capacity !== "number") {
      throw new Error("Missing required fields: name and capacity");
    }

    // Thêm timestamp và các trường bắt buộc
    const roomData = {
      name: data.name,
      capacity: data.capacity,
      rows: data.rows || Math.ceil(data.capacity / 10),
      columns: data.columns || 10,
      type: data.screen_type || "2D",
      status: data.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log("ROOM DATA TO INSERT:", roomData);

    // Insert vào database và trả về ID của record vừa tạo
    const result = await knex("cinema_rooms").insert(roomData).returning("id");
    console.log("INSERT RESULT:", result);

    // Xử lý kết quả trả về cẩn thận hơn
    let roomId;
    if (Array.isArray(result) && result.length > 0) {
      roomId = typeof result[0] === "object" ? result[0].id : result[0];
    } else if (result && typeof result === "object") {
      roomId = result.id;
    } else {
      roomId = result;
    }

    console.log("PARSED ROOM ID:", roomId);

    // Truy vấn phòng mới tạo
    const newRoom = await knex("cinema_rooms").where("id", roomId).first();
    console.log("NEW ROOM CREATED:", newRoom);

    return newRoom;
  } catch (error) {
    console.error("ERROR IN createRoom:", error.message);
    console.error("ERROR STACK:", error.stack);
    throw error;
  }
}

/**
 * Cập nhật phòng chiếu theo ID
 * @param {number} id - ID của phòng chiếu
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object|null>} - Object chứa thông tin phòng sau khi cập nhật hoặc null nếu không tìm thấy
 */
async function updateRoom(id, data) {
  // Kiểm tra phòng tồn tại
  const room = await knex("cinema_rooms").where("id", id).first();
  if (!room) return null;

  // Chuẩn bị dữ liệu cập nhật
  const updateData = {
    updated_at: new Date(),
  };

  // Thêm các trường được phép cập nhật nếu có trong dữ liệu đầu vào
  if (data.name !== undefined) updateData.name = data.name;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.rows !== undefined) updateData.rows = data.rows;
  if (data.columns !== undefined) updateData.columns = data.columns;
  if (data.screen_type !== undefined) updateData.type = data.screen_type; // Chuyển đổi screen_type thành type
  if (data.status !== undefined) updateData.status = data.status;

  // Update và trả về số records đã update
  await knex("cinema_rooms").where("id", id).update(updateData);

  // Query và trả về record đã update
  return knex("cinema_rooms").where("id", id).first();
}

/**
 * Xóa phòng chiếu theo ID
 * @param {number} id - ID của phòng chiếu
 * @returns {Promise<Object|null>} - Object chứa thông tin phòng đã xóa hoặc null nếu không tìm thấy
 */
async function deleteRoom(id) {
  // Kiểm tra phòng tồn tại và lấy thông tin trước khi xóa
  const room = await knex("cinema_rooms").where("id", id).first();
  if (!room) return null;

  // Xóa phòng
  await knex("cinema_rooms").where("id", id).delete();

  // Trả về thông tin phòng đã xóa
  return room;
}

/**
 * Xóa tất cả phòng chiếu
 * @returns {Promise<number>} - Số lượng phòng đã xóa
 */
async function deleteAllRooms() {
  // Xóa tất cả phòng và trả về số lượng records đã xóa
  return knex("cinema_rooms").delete();
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteAllRooms,
};
