const { z } = require("zod");

// Schema cơ bản cho showtime
const showtimeSchema = z.object({
  id: z.coerce.number().positive("ID phải là số dương"),
  movie_id: z.coerce.number().positive("Movie ID phải là số dương"),
  cinema_room_id: z.coerce.number().positive("Cinema Room ID phải là số dương"),
  start_time: z.string().datetime("Thời gian bắt đầu không hợp lệ"),
  end_time: z.string().datetime("Thời gian kết thúc không hợp lệ"),
  price: z.coerce.number().positive("Giá vé phải là số dương").max(1000000, "Giá vé không được quá 1,000,000 VNĐ"),
  status: z.enum(["scheduled", "canceled", "completed"], {
    errorMap: () => ({ message: "Trạng thái phải là scheduled, canceled hoặc completed" })
  }).optional().default("scheduled"),
});

// Schema cho query parameters khi lấy danh sách suất chiếu
const getShowtimesQuerySchema = z.object({
  movie_id: z.coerce.number().positive().optional(),
  cinema_room_id: z.coerce.number().positive().optional(),
  status: z.enum(["scheduled", "canceled", "completed"]).optional(),
  date: z.string().date("Ngày không hợp lệ (YYYY-MM-DD)").optional(),
  page: z.coerce.number().nonnegative().default(1),
  limit: z.coerce.number().nonnegative().default(10),
});

// Schema cho tạo suất chiếu mới
const createShowtimeSchema = showtimeSchema.omit({ 
  id: true 
});

// Schema cho cập nhật suất chiếu (partial)
const updateShowtimeSchema = showtimeSchema.omit({ 
  id: true
}).partial();

module.exports = {
  showtimeSchema,
  getShowtimesQuerySchema,
  createShowtimeSchema,
  updateShowtimeSchema,
}; 