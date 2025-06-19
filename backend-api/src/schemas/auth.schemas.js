const z = require('zod');

// Schema cho đăng ký nhân viên (admin only)
const employeeRegisterSchema = z.object({
  // Thông tin tài khoản
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' }),
  password: z.string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(50, { message: 'Mật khẩu không được quá 50 ký tự' }),
  password_confirm: z.string(),
  
  // Thông tin nhân viên
  email: z.string()
    .email({ message: 'Email không hợp lệ' }),
  full_name: z.string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Họ tên không được quá 100 ký tự' }),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
}).strict().refine(data => data.password === data.password_confirm, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['password_confirm']
});

// Schema cho đăng nhập
const loginSchema = z.object({
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' }),
  password: z.string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
}).strict().refine(data => data.phone_number && data.password, {
  message: 'Số điện thoại và mật khẩu là bắt buộc',
  path: ['phone_number', 'password']
});

// Schema cho hoàn tất Google Auth
const googleCompleteSchema = z.object({
  temp_data: z.string()
    .min(1, { message: 'Dữ liệu tạm thời là bắt buộc' }),
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' }),
  full_name: z.string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Họ tên không được quá 100 ký tự' })
    .optional()
}).strict();

// Schemas để validate toàn bộ request body
const employeeRegisterRequestSchema = z.object({
  input: employeeRegisterSchema,
});

const loginRequestSchema = z.object({
  input: loginSchema,
});

const googleCompleteRequestSchema = z.object({
  input: googleCompleteSchema,
});

module.exports = {
  employeeRegisterRequestSchema,
  loginRequestSchema,
  googleCompleteRequestSchema
}; 