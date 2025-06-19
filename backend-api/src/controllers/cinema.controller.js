const cinemaService = require('../services/cinema.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

/**
 * Lấy tất cả phòng chiếu
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getAllRooms(req, res, next) {
    try {
        const rooms = await cinemaService.getAllRooms();

        return res.json(
            JSend.success({
                rooms
            })
        );
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Lấy phòng chiếu theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getRoomById(req, res, next) {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return next(new ApiError(400, 'Invalid room ID'));
        }

        const room = await cinemaService.getRoomById(id);

        return res.json(
            JSend.success({
                room
            })
        );
    } catch (error) {
        console.log(error);

        if (error.message === 'Room not found') {
            return next(new ApiError(404, 'Room not found'));
        }

        return next(new ApiError(500, 'Internal Server Error'));
    }
}

module.exports = {
    getAllRooms,
    getRoomById
}