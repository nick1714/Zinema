const express = require('express');
const { z } = require('zod');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const showtimeController = require('../controllers/showtime.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const { validateRequest } = require('../middlewares/validator.middleware');
const { ROLES } = require('../constants');
const {
  showtimeSchema,
  getShowtimesQuerySchema,
  createShowtimeSchema,
  updateShowtimeSchema,
} = require('../schemas/showtime.schemas');

const router = express.Router();

module.exports.setup = (app) => {
  app.use('/api/showtimes', router);

  // GET /api/showtimes - Lấy tất cả suất chiếu với query parameters
  router.get(
    '/',
    validateRequest(
      z.object({
        input: getShowtimesQuerySchema.strict(),
      })
    ),
    showtimeController.getAllShowtimes
  );

  // POST /api/showtimes - Tạo suất chiếu mới (Admin/Staff only)
  router.post(
    '/',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    validateRequest(
      z.object({
        input: createShowtimeSchema.strict(),
      })
    ),
    showtimeController.createShowtime
  );

  // DELETE /api/showtimes - Xóa tất cả suất chiếu (Admin only)
  router.delete(
    '/',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    showtimeController.deleteAllShowtimes
  );

  router.all('/', methodNotAllowed);

  // GET /api/showtimes/:id - Lấy suất chiếu theo ID
  router.get(
    '/:id',
    validateRequest(
      z.object({
        input: showtimeSchema.pick({ id: true }).strict(),
      })
    ),
    showtimeController.getShowtimeById
  );

  // GET /api/showtimes/:id/seats - Lấy sơ đồ ghế và trạng thái cho suất chiếu
  router.get(
    '/:id/seats',
    // Bất kỳ ai cũng có thể xem ghế
    showtimeController.getSeatsForShowtime
  );

  // PUT /api/showtimes/:id - Cập nhật suất chiếu (Admin/Staff only)
  router.put(
    '/:id',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    validateRequest(
      z.object({
        input: updateShowtimeSchema.strict(),
        id: z.coerce.number().positive("ID phải là số dương")
      })
    ),
    showtimeController.updateShowtime
  );

  // DELETE /api/showtimes/:id - Xóa suất chiếu theo ID (Admin/Staff only)
  router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    validateRequest(
      z.object({
        input: showtimeSchema.pick({ id: true }).strict(),
      })
    ),
    showtimeController.deleteShowtime
  );

  router.all('/:id', methodNotAllowed);
}; 