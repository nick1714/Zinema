const showtimeService = require('../services/showtime.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

/**
 * Lấy tất cả suất chiếu với phân trang và filtering
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getAllShowtimes(req, res, next) {
    // Khởi tạo kết quả mặc định
    let result = {
        showtimes: [],
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
        result = await showtimeService.getAllShowtimes(req.query);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }

    // Trả về kết quả với JSend format
    return res.json(
        JSend.success({
            showtimes: result.showtimes,
            metadata: result.metadata,
        })
    );
}

/**
 * Lấy suất chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getShowtimeById(req, res, next) {
    const { id } = req.params;
    
    try {
        // Gọi service để lấy suất chiếu theo ID
        const showtime = await showtimeService.getShowtimeById(id);
        
        if (!showtime) {
            return next(new ApiError(404, 'Showtime not found'));
        }
        
        return res.json(JSend.success({
            showtime 
        }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Tạo mới suất chiếu
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createShowtime(req, res, next) {
    try {
        // Lấy dữ liệu từ request body.input (do có wrapper input)
        const showtimeData = {
            ...(req.body.input || req.body)
        };

        console.log("Received showtime data:", showtimeData);

        // Gọi service để tạo suất chiếu mới
        const showtime = await showtimeService.createShowtime(showtimeData);

        // Trả về kết quả với status 201 (Created)
        return res.status(201).json(
            JSend.success({ showtime }, "Showtime created successfully")
        );
    } catch (error) {
        console.error("Error in createShowtime controller:", error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Cập nhật suất chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function updateShowtime(req, res, next) {
    const { id } = req.params;
    
    try {
        // Lấy dữ liệu cập nhật từ request body.input (do có wrapper input)
        const updateData = {
            ...(req.body.input || req.body)
        };

        console.log("Updating showtime with data:", updateData);

        // Gọi service để cập nhật suất chiếu
        const updatedShowtime = await showtimeService.updateShowtime(id, updateData);

        if (!updatedShowtime) {
            return next(new ApiError(404, 'Showtime not found'));
        }

        return res.json(
            JSend.success({ showtime: updatedShowtime }, "Showtime updated successfully")
        );
    } catch (error) {
        console.error("Error in updateShowtime controller:", error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Xóa suất chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteShowtime(req, res, next) {
    const { id } = req.params;
    
    try {
        // Gọi service để xóa suất chiếu
        const deletedShowtime = await showtimeService.deleteShowtime(id);

        if (!deletedShowtime) {
            return next(new ApiError(404, 'Showtime not found'));
        }

        return res.json(
            JSend.success({ showtime: deletedShowtime }, "Showtime deleted successfully")
        );
    } catch (error) {
        console.error("Error in deleteShowtime controller:", error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Xóa tất cả suất chiếu
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteAllShowtimes(req, res, next) {
    try {
        // Gọi service để xóa tất cả suất chiếu
        await showtimeService.deleteAllShowtimes();

        return res.json(
            JSend.success(null, "All showtimes deleted successfully")
        );
    } catch (error) {
        console.error("Error in deleteAllShowtimes controller:", error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

module.exports = {
    getAllShowtimes,
    getShowtimeById,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    deleteAllShowtimes
}; 