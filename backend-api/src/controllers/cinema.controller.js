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
        result = await cinemaService.getAllRooms(req.query);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }

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
        const room = await cinemaService.getRoomById(id);
        if (!room) {
            return next(new ApiError(404, 'Room not found'));
        }
        return res.json(JSend.success({
            room 
        }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

module.exports = {
    getAllRooms,
    getRoomById
}