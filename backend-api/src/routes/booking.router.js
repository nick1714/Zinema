const express = require('express');

const bookingController = require('../controllers/booking.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateRequest, validate } = require('../middlewares/validator.middleware');
const { 
    getBookingsQuerySchema,
    bookingParamsSchema,
    createBookingSchema,
    confirmBookingSchema,
    updateBookingSchema
} = require('../schemas/booking.schemas');
const { ROLES } = require('../constants');

const router = express.Router();

/**
 * @route POST /api/bookings
 * @desc Tạo booking mới
 * @access Private (All authenticated users)
 * @permission Customer: tạo booking cho mình, Admin/Staff: tạo booking cho bất kỳ ai
 */
router.post('/',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
    validate(createBookingSchema, 'body'),
    bookingController.createBooking
);

/**
 * @route GET /api/bookings
 * @desc Lấy danh sách tất cả bookings với phân trang và lọc
 * @access Private (All authenticated users)
 * @permission Customer: chỉ xem booking của mình, Admin/Staff: xem tất cả
 */
router.get('/', 
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
    validate(getBookingsQuerySchema, 'query'),
    bookingController.getAllBookings
);

/**
 * @route GET /api/bookings/:id
 * @desc Lấy thông tin chi tiết booking theo ID
 * @access Private (All authenticated users)
 * @permission Customer: chỉ xem booking của mình, Admin/Staff: xem tất cả
 */
router.get('/:id',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
    validate(bookingParamsSchema, 'params'),
    bookingController.getBookingById
);

/**
 * @route POST /api/bookings/:id/confirm
 * @desc Xác nhận booking và thanh toán
 * @access Private (All authenticated users)
 * @permission Customer: xác nhận booking của mình, Admin/Staff: xác nhận bất kỳ booking nào
 */
router.post('/:id/confirm',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
    validate(confirmBookingSchema, 'body'),
    bookingController.confirmBooking
);

/**
 * @route PUT /api/bookings/:id
 * @desc Cập nhật booking (trạng thái, thanh toán, etc.)
 * @access Private (Admin, Staff, Customer owner)
 * @permission Customer: chỉ cập nhật booking của mình, Admin/Staff: cập nhật tất cả
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
    validate(bookingParamsSchema, 'params'),
    validate(updateBookingSchema, 'body'),
    bookingController.updateBooking
);

/**
 * @route POST /api/bookings/cleanup
 * @desc Dọn dẹp các booking pending đã hết hạn
 * @access Private (Admin only)
 */
router.post('/cleanup',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    bookingController.cleanupExpiredBookings
);

/**
 * @route DELETE /api/bookings/:id
 * @desc Xóa booking (chỉ admin)
 * @access Private (Admin only)
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    bookingController.deleteBooking
);

// Export router setup function theo pattern của project
module.exports.setup = (app) => {
    app.use('/api/bookings', router);
};