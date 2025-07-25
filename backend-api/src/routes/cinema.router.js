const express = require("express");
const { z } = require("zod");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const cinemaController = require("../controllers/cinema.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { ROLES } = require("../constants");
const ApiError = require("../api-error");
const {
  cinemaRoomSchema,
  getRoomsQuerySchema,
  createRoomSchema,
  updateRoomSchema,
} = require("../schemas/cinema.schemas");

const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/rooms", router);

  // GET /api/rooms - Lấy tất cả phòng chiếu với query parameters
  router.get(
    "/",
    validateRequest(
      z.object({
        input: getRoomsQuerySchema.strict(),
      })
    ),
    cinemaController.getAllRooms
  );

  // POST /api/rooms - Tạo phòng chiếu mới (chỉ admin)
  router.post(
    "/",
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    validateRequest(
      z.object({
        input: createRoomSchema.strict(),
      })
    ),
    cinemaController.createRoom
  );

  // DELETE /api/rooms - Xóa tất cả phòng chiếu (chỉ admin)
  router.delete(
    "/",
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    cinemaController.deleteAllRooms
  );

  router.all("/", methodNotAllowed);

  // GET /api/rooms/:id - Lấy phòng theo ID
  router.get(
    "/:id",
    validateRequest(
      z.object({
        input: cinemaRoomSchema.pick({ id: true }).strict(),
      })
    ),
    cinemaController.getRoomById
  );

  // PUT /api/rooms/:id - Cập nhật phòng (chỉ admin)
  router.put(
    "/:id",
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    validateRequest(
      z.object({
        input: updateRoomSchema.strict().refine(
          (data) => {
            const keys = Object.keys(data);
            return keys.some((key) => data[key] !== undefined);
          },
          {
            message: "At least one field is required",
          }
        ),
        id: z.coerce.number().positive("ID phải là số dương"),
      })
    ),
    cinemaController.updateRoom
  );

  // DELETE /api/rooms/:id - Xóa phòng theo ID (chỉ admin)
  router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles([ROLES.ADMIN]),
    validateRequest(
      z.object({
        input: cinemaRoomSchema.pick({ id: true }).strict(),
      })
    ),
    cinemaController.deleteRoom
  );

  router.all("/:id", methodNotAllowed);
};
