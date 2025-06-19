const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const cinemaController = require('../controllers/cinema.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const { ROLES } = require('../constants');

function setup(app) {
  const router = express.Router();

  // Lấy tất cả phòng chiếu
  router.route('/')
    .get(cinemaController.getAllRooms)
    .all(methodNotAllowed);

  // Lấy phòng chiếu theo ID
  router.route('/:id')
    .get(cinemaController.getRoomById)
    .all(methodNotAllowed);

  app.use('/api/rooms', router);
  
}

module.exports = {
  setup,
}; 