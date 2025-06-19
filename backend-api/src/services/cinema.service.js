const knex = require('../database/knex');

/**
 * Lấy tất cả phòng chiếu
 * @returns {Promise<Array>} Danh sách phòng chiếu
 */
async function getAllRooms() {
    const rooms = await knex('cinema_rooms')
        .select('*')
        .orderBy('id', 'asc');
    
    return rooms;
}

/**
 * Lấy phòng chiếu theo ID
 * @param {number} id - ID của phòng chiếu
 * @returns {Promise<Object>} Thông tin phòng chiếu
 */
async function getRoomById(id) {
    const room = await knex('cinema_rooms')
        .where('id', id)
        .first();
    
    if (!room) {
        throw new Error('Room not found');
    }
    
    return room;
}

module.exports = {
    getAllRooms,
    getRoomById
}; 