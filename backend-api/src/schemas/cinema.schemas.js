const { z } = require("zod");

// Schema cơ bản cho cinema room
const cinemaRoomSchema = z.object({
  id: z.coerce.number().positive("ID phải là số dương"),
  name: z
    .string()
    .min(1, "Tên phòng không được để trống")
    .max(255, "Tên phòng quá dài"),
  capacity: z
    .number()
    .int("Sức chứa phải là số nguyên")
    .min(1, "Sức chứa phải lớn hơn 0")
    .max(500, "Sức chứa không được quá 500"),
  rows: z
    .number()
    .int("Số hàng phải là số nguyên")
    .min(1, "Số hàng phải lớn hơn 0")
    .max(50, "Số hàng không được quá 50")
    .optional(),
  columns: z
    .number()
    .int("Số cột phải là số nguyên")
    .min(1, "Số cột phải lớn hơn 0")
    .max(50, "Số cột không được quá 50")
    .optional(),
  type: z
    .enum(["2D", "3D", "IMAX", "4DX"], {
      errorMap: () => ({
        message: "Loại màn hình phải là 2D, 3D, IMAX hoặc 4DX",
      }),
    })
    .optional(),
  status: z
    .enum(["active", "inactive", "maintenance"], {
      errorMap: () => ({
        message: "Trạng thái phải là active, inactive hoặc maintenance",
      }),
    })
    .optional(),
});

// Schema cho query parameters khi lấy danh sách phòng
const getRoomsQuerySchema = z.object({
  name: z.string().max(255).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  page: z.coerce.number().nonnegative().default(1),
  limit: z.coerce.number().nonnegative().default(10),
});

// Schema cho tạo phòng mới
const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Tên phòng không được để trống")
    .max(255, "Tên phòng quá dài"),
  capacity: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Sức chứa phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 500, {
      message: "Sức chứa phải lớn hơn 0 và không quá 500",
    }),
  rows: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Số hàng phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 50, {
      message: "Số hàng phải lớn hơn 0 và không quá 50",
    })
    .optional(),
  columns: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Số cột phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 50, {
      message: "Số cột phải lớn hơn 0 và không quá 50",
    })
    .optional(),
  screen_type: z
    .enum(["2D", "3D", "IMAX", "4DX"], {
      errorMap: () => ({
        message: "Loại màn hình phải là 2D, 3D, IMAX hoặc 4DX",
      }),
    })
    .optional(),
  status: z
    .enum(["active", "inactive", "maintenance"], {
      errorMap: () => ({
        message: "Trạng thái phải là active, inactive hoặc maintenance",
      }),
    })
    .default("active"),
});

// Schema cho cập nhật phòng
const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Tên phòng không được để trống")
    .max(255, "Tên phòng quá dài")
    .optional(),
  capacity: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Sức chứa phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 500, {
      message: "Sức chứa phải lớn hơn 0 và không quá 500",
    })
    .optional(),
  rows: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Số hàng phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 50, {
      message: "Số hàng phải lớn hơn 0 và không quá 50",
    })
    .optional(),
  columns: z
    .union([
      z
        .string()
        .regex(/^\d+$/, "Số cột phải là số")
        .transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .refine((val) => val > 0 && val <= 50, {
      message: "Số cột phải lớn hơn 0 và không quá 50",
    })
    .optional(),
  screen_type: z
    .enum(["2D", "3D", "IMAX", "4DX"], {
      errorMap: () => ({
        message: "Loại màn hình phải là 2D, 3D, IMAX hoặc 4DX",
      }),
    })
    .optional(),
  status: z
    .enum(["active", "inactive", "maintenance"], {
      errorMap: () => ({
        message: "Trạng thái phải là active, inactive hoặc maintenance",
      }),
    })
    .optional(),
});

module.exports = {
  cinemaRoomSchema,
  getRoomsQuerySchema,
  createRoomSchema,
  updateRoomSchema,
};
