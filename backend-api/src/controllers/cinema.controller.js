const cinemaService = require("../services/cinema.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

/**
 * Lấy tất cả phòng chiếu
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getAllRooms(req, res, next) {
  // Khởi tạo kết quả mặc định
  let result = {
    rooms: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 10,
    },
  };

  try {
    // Gọi service để lấy dữ liệu
    result = await cinemaService.getAllRooms(req.query);
  } catch (error) {
    console.error("Error in getAllRooms controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }

  // Trả về kết quả với JSend format
  return res.json(
    JSend.success({
      rooms: result.rooms,
      metadata: result.metadata,
    })
  );
}

/**
 * Lấy phòng chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getRoomById(req, res, next) {
  const { id } = req.params;

  try {
    // Gọi service để lấy phòng chiếu theo ID
    const room = await cinemaService.getRoomById(id);

    if (!room) {
      return next(new ApiError(404, "Room not found"));
    }

    return res.json(
      JSend.success({
        room,
      })
    );
  } catch (error) {
    console.error("Error in getRoomById controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Tạo phòng chiếu mới
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createRoom(req, res, next) {
  try {
    // Lấy dữ liệu từ request body
    const roomData = {
      ...(req.body.input || req.body),
    };

    console.log("Received room data:", roomData);

    // Gọi service để tạo phòng chiếu mới
    const room = await cinemaService.createRoom(roomData);

    // Trả về kết quả với status 201 (Created)
    return res
      .status(201)
      .json(JSend.success({ room }, "Cinema room created successfully"));
  } catch (error) {
    console.error("Error in createRoom controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Cập nhật phòng chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function updateRoom(req, res, next) {
  const { id } = req.params;

  try {
    // Lấy dữ liệu cập nhật từ request body
    const updateData = {
      ...(req.body.input || req.body),
    };

    console.log("Updating room with data:", updateData);

    // Gọi service để cập nhật phòng chiếu
    const updatedRoom = await cinemaService.updateRoom(id, updateData);

    if (!updatedRoom) {
      return next(new ApiError(404, "Room not found"));
    }

    return res.json(
      JSend.success({ room: updatedRoom }, "Cinema room updated successfully")
    );
  } catch (error) {
    console.error("Error in updateRoom controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Xóa phòng chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteRoom(req, res, next) {
  const { id } = req.params;

  try {
    console.log("Deleting room with ID:", id);
    // Gọi service để xóa phòng chiếu
    const deletedRoom = await cinemaService.deleteRoom(id);

    if (!deletedRoom) {
      return next(new ApiError(404, "Room not found"));
    }

    return res.json(
      JSend.success({ room: deletedRoom }, "Cinema room deleted successfully")
    );
  } catch (error) {
    console.error("Error in deleteRoom controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Xóa tất cả phòng chiếu
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteAllRooms(req, res, next) {
  try {
    // Gọi service để xóa tất cả phòng chiếu
    await cinemaService.deleteAllRooms();

    return res.json(
      JSend.success(null, "All cinema rooms deleted successfully")
    );
  } catch (error) {
    console.error("Error in deleteAllRooms controller:", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteAllRooms,
};
