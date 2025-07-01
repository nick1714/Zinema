const { z } = require("zod");

// Schema cơ bản cho food
const foodSchema = z.object({
    id: z.coerce.number().positive("ID phải là số dương"),
    name: z.string().min(1, "Tên món ăn không được để trống").max(255, "Tên món ăn quá dài"),
    description: z.string().min(1, "Mô tả không được để trống").max(1000, "Mô tả quá dài"),
    price: z.coerce.number().positive("Giá phải là số dương").max(10000000, "Giá không được quá 10 triệu"),
    image_url: z.string().max(500, "URL hình ảnh quá dài").optional(),
    category: z.string().min(1, "Danh mục không được để trống").max(100, "Danh mục quá dài"),
    is_available: z.boolean().default(true),
});

// Schema cho query parameters khi lấy danh sách food
const getFoodsQuerySchema = z.object({
    name: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
    is_available: z.coerce.boolean().optional(),
    min_price: z.coerce.number().nonnegative().optional(),
    max_price: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().nonnegative().default(1),
    limit: z.coerce.number().nonnegative().default(10),
});

// Schema cho tạo food mới
const createFoodSchema = foodSchema.omit({
    id: true
});

// Schema cho cập nhật food (partial)
const updateFoodSchema = foodSchema.omit({
    id: true
}).partial();

module.exports = {
    foodSchema,
    getFoodsQuerySchema,
    createFoodSchema,
    updateFoodSchema,
};
