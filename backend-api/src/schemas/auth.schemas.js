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
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' })
  }).optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  position: z.enum(['Nhân viên bán vé', 'Nhân viên vệ sinh'], {
    errorMap: () => ({ message: 'Vị trí phải là Nhân viên bán vé, Nhân viên vệ sinh' })
  }).optional(),
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
}).strict();

// Schema cho hoàn tất Google Auth
const googleCompleteSchema = z.object({
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' }),
  full_name: z.string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Họ tên không được quá 100 ký tự' })
    .optional() // full_name có thể không cần thiết nếu đã có từ Google
}).strict();

// Schema cho cập nhật thông tin khách hàng
const updateCustomerSchema = z.object({
  full_name: z.string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
    .max(255, { message: 'Họ tên không được quá 255 ký tự' })
    .optional(),
  
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' })
    .optional(),
  
  address: z.string()
    .max(500, { message: 'Địa chỉ không được quá 500 ký tự' })
    .optional()
    .nullable(),
  
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' })
  }).optional()
    .nullable(),
  
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày sinh phải có định dạng YYYY-MM-DD' })
    .optional()
    .nullable(),
}).strict();

// Schema cho cập nhật thông tin nhân viên
const updateEmployeeSchema = z.object({
  email: z.string()
    .email({ message: 'Email không đúng định dạng' })
    .max(255, { message: 'Email không được quá 255 ký tự' })
    .optional(),
  
  full_name: z.string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Họ tên không được quá 100 ký tự' })
    .optional(),
  
  phone_number: z.string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
    .max(15, { message: 'Số điện thoại không được quá 15 ký tự' })
    .optional(),
  
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày sinh phải có định dạng YYYY-MM-DD' })
    .optional()
    .nullable(),
  
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' })
  }).optional()
    .nullable(),
  
  address: z.string()
    .max(500, { message: 'Địa chỉ không được quá 500 ký tự' })
    .optional()
    .nullable(),
  
  position: z.enum(['Nhân viên bán vé', 'Nhân viên vệ sinh'], {
    errorMap: () => ({ message: 'Vị trí phải là Nhân viên bán vé, Nhân viên vệ sinh' })
  }).optional(),
}).strict();

// Schema cho đổi mật khẩu
const changePasswordSchema = z.object({
  current_password: z.string()
    .min(6, { message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' }),
  new_password: z.string()
    .min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    .max(50, { message: 'Mật khẩu mới không được quá 50 ký tự' }),
  confirm_password: z.string()
}).strict().refine(data => data.new_password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password']
});

// Schemas để validate toàn bộ request body
const employeeRegisterRequestSchema = employeeRegisterSchema;

const loginRequestSchema = loginSchema;

const googleCompleteRequestSchema = z.object({
  input: googleCompleteSchema,
});

const updateCustomerRequestSchema = z.object({
  input: updateCustomerSchema,
  id: z.string().optional(), // Cho phép id từ req.params
});

const updateEmployeeRequestSchema = z.object({
  input: updateEmployeeSchema,
  id: z.string().optional(), // Cho phép id từ req.params
});

const changePasswordRequestSchema = z.object({
  input: changePasswordSchema,
});

module.exports = {
  employeeRegisterRequestSchema,
  loginRequestSchema,
  googleCompleteRequestSchema,
  updateCustomerRequestSchema,
  updateEmployeeRequestSchema,
  changePasswordRequestSchema
}; 