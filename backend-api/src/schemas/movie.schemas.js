const { z } = require("zod");

// Schema cơ bản cho movie
const movieSchema = z.object({
  id: z.coerce.number().positive("ID phải là số dương"),
  title: z.string().min(1, "Tiêu đề không được để trống").max(255, "Tiêu đề quá dài"),
  description: z.string().min(1, "Mô tả không được để trống").max(2000, "Mô tả quá dài"),
  duration: z.coerce.number().int("Thời lượng phải là số nguyên").min(1, "Thời lượng phải lớn hơn 0").max(600, "Thời lượng không được quá 600 phút"),
  release_date: z.string().date("Ngày phát hành không hợp lệ"),
  genre: z.string().min(1, "Thể loại không được để trống").max(100, "Thể loại quá dài"),
  director: z.string().min(1, "Đạo diễn không được để trống").max(255, "Tên đạo diễn quá dài"),
  cast: z.string().min(1, "Diễn viên không được để trống").max(1000, "Danh sách diễn viên quá dài"),
  country: z.string().min(1, "Quốc gia không được để trống").max(100, "Quốc gia quá dài"),
  rating: z.enum(["G", "PG", "PG-13", "R", "NC-17", "T13", "T16", "T18", "C"], {
    errorMap: () => ({ message: "Rating phải là G, PG, PG-13, R, NC-17, T13, T16, T18 hoặc C" })
  }),
  poster_url: z.string().url("URL poster không hợp lệ").optional(),
  trailer_url: z.string().url("URL trailer không hợp lệ").optional(),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Trạng thái phải là active hoặc inactive" })
  }).optional().default("active"),
  // Field cho file upload
  posterFile: z.any().optional()
});

// Schema cho query parameters khi lấy danh sách phim
const getMoviesQuerySchema = z.object({
  title: z.string().max(255).optional(),
  genre: z.string().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  director: z.string().max(255).optional(),
  page: z.coerce.number().nonnegative().default(1),
  limit: z.coerce.number().nonnegative().default(10),
});

// Schema cho tạo phim mới (poster_url sẽ được tự động tạo từ file upload)
const createMovieSchema = movieSchema.omit({ 
  id: true, 
  poster_url: true 
}).extend({
  posterFile: z.any().optional()
});

// Schema cho cập nhật phim (partial) 
const updateMovieSchema = movieSchema.omit({ 
  id: true,
  poster_url: true
}).partial().extend({
  posterFile: z.any().optional()
});

module.exports = {
  movieSchema,
  getMoviesQuerySchema,
  createMovieSchema,
  updateMovieSchema,
}; 