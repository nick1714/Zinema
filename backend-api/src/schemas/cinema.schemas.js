const { z } = require("zod");

// Schema cơ bản cho cinema room
const cinemaRoomSchema = z.object({
  id: z.coerce.number().positive("ID phải là số dương"),
  name: z.string().min(1, "Tên phòng không được để trống").max(255, "Tên phòng quá dài"),
  capacity: z.number().int("Sức chứa phải là số nguyên").min(1, "Sức chứa phải lớn hơn 0").max(500, "Sức chứa không được quá 500"),
  screen_type: z.enum(["2D", "3D", "IMAX", "4DX"], {
    errorMap: () => ({ message: "Loại màn hình phải là 2D, 3D, IMAX hoặc 4DX" })
  }).optional(),
  status: z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "Trạng thái phải là active, inactive hoặc maintenance" })
  }).optional()
});

// Schema cho query parameters khi lấy danh sách phòng
const getRoomsQuerySchema = z.object({
  name: z.string().max(255).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  page: z.coerce.number().nonnegative().default(1),
  limit: z.coerce.number().nonnegative().default(10),
});

module.exports = {
  cinemaRoomSchema,
  getRoomsQuerySchema,
}; 