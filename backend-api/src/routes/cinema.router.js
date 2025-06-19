const express = require('express');
const { z } = require('zod');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const cinemaController = require('../controllers/cinema.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const { validateRequest } = require('../middlewares/validator.middleware');
const { ROLES } = require('../constants');
const {
  cinemaRoomSchema,
  getRoomsQuerySchema,
} = require('../schemas/cinema.schemas');

const router = express.Router();

module.exports.setup = (app) => {
  app.use('/api/rooms', router);

  // GET /api/rooms - Lấy tất cả phòng chiếu với query parameters
  router.get(
    '/',
    validateRequest(
      z.object({
        input: getRoomsQuerySchema.strict(),
      })
    ),
    cinemaController.getAllRooms
  );


  router.all('/', methodNotAllowed);

  // GET /api/rooms/:id - Lấy phòng theo ID
  router.get(
    '/:id',
    validateRequest(
      z.object({
        input: cinemaRoomSchema.pick({ id: true }).strict(),
      })
    ),
    cinemaController.getRoomById
  );

  // );

  router.all('/:id', methodNotAllowed);
}; 