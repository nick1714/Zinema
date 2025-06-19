const express = require("express");
const { z } = require("zod");

const movieController = require("../controllers/movie.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { posterUpload } = require("../middlewares/poster-upload.middleware");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { ROLES } = require("../constants");
const {
  movieSchema,
  getMoviesQuerySchema,
  createMovieSchema,
  updateMovieSchema,
} = require("../schemas/movie.schemas");

const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/movies", router);

  // GET /api/movies - Lấy tất cả phim với query parameters
  router.get(
    "/",
    validateRequest(
      z.object({
        input: getMoviesQuerySchema.strict(),
      })
    ),
    movieController.getAllMovies
  );

  // POST /api/movies - Tạo phim mới (chỉ admin và staff) với upload poster
  router.post(
    "/",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
      posterUpload,
      validateRequest(
        z.object({
          input: createMovieSchema.strict(),
        })
      ),
    ],
    movieController.createMovie
  );

  // DELETE /api/movies - Xóa tất cả phim (chỉ admin)
  router.delete(
    "/", 
    [
      authenticateToken, 
      authorizeRoles([ROLES.ADMIN]),
      validateRequest(
        z.object({
          input: z.object({}).strict(),
        })
      )
    ],
    movieController.deleteAllMovies
  );

  router.all("/", methodNotAllowed);

  // GET /api/movies/:id - Lấy phim theo ID
  router.get(
    "/:id",
    validateRequest(
      z.object({
        input: movieSchema.pick({ id: true }).strict(),
      })
    ),
    movieController.getMovieById
  );

  // PUT /api/movies/:id - Cập nhật phim (chỉ admin và staff) với upload poster
  router.put(
    "/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
      posterUpload,
      validateRequest(
        z.object({
          input: updateMovieSchema
            .extend({
              id: z.coerce.number().positive("ID phải là số dương"),
            })
            .strict()
            .refine(
              (data) => {
                const keys = Object.keys(data);
                return keys.some(key => key !== 'id' && data[key] !== undefined);
              },
              {
                message: "At least one field is required",
              }
            ),
        })
      ),
    ],
    movieController.updateMovie
  );

  // DELETE /api/movies/:id - Xóa phim theo ID (chỉ admin và staff)
  router.delete(
    "/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
      validateRequest(
        z.object({
          input: movieSchema.pick({ id: true }).strict(),
        })
      ),
    ],
    movieController.deleteMovie
  );

  router.all("/:id", methodNotAllowed);
}; 