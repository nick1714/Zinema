const movieService = require("../services/movie.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

const DEFAULT_POSTER = "/public/images/default-movie-poster.png";

function getPosterUrlPath(file) {
  return file ? `/public/uploads/${file.filename}` : DEFAULT_POSTER;
}

/**
 * Lấy tất cả phim
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getAllMovies(req, res, next) {
  let result = {
    movies: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 10,
    },
  };

  try {
    result = await movieService.getAllMovies(req.query);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }

  return res.json(
    JSend.success({
      movies: result.movies,
      metadata: result.metadata,
    })
  );
}

/**
 * Lấy phim theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getMovieById(req, res, next) {
  const { id } = req.params;
  try {
    const movie = await movieService.getMovieById(id);
    if (!movie) {
      return next(new ApiError(404, "Movie not found"));
    }
    return res.json(
      JSend.success({
        movie,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Tạo phim mới
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createMovie(req, res, next) {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const movieData = {
      ...req.body.input,
      poster_url: getPosterUrlPath(req.file),
    };

    console.log("Movie data:", movieData);

    const movie = await movieService.createMovie(movieData);
    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${movie.id}`,
      })
      .json(
        JSend.success({
          movie,
        })
      );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Cập nhật phim
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function updateMovie(req, res, next) {
  const { id } = req.params;
  try {
    const updateData = {
      ...req.body.input,
      ...(req.file && { poster_url: getPosterUrlPath(req.file) }),
    };

    const updated = await movieService.updateMovie(id, updateData);
    if (!updated) {
      return next(new ApiError(404, "Movie not found"));
    }

    return res.json(
      JSend.success({
        movie: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Xóa phim theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteMovie(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await movieService.deleteMovie(id);
    if (!deleted) {
      return next(new ApiError(404, "Movie not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

/**
 * Xóa tất cả phim
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function deleteAllMovies(req, res, next) {
  try {
    await movieService.deleteAllMovies();
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
};
