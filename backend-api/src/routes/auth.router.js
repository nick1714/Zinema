const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest, validate } = require("../middlewares/validator.middleware");
const { 
  employeeRegisterRequestSchema, 
  loginRequestSchema, 
  googleCompleteRequestSchema,
  updateCustomerRequestSchema,
  updateEmployeeRequestSchema,
  changePasswordRequestSchema,
  createCustomerWithoutAccountRequestSchema,
  linkPhoneNumberRequestSchema
} = require("../schemas/auth.schemas");
const { ROLES } = require("../constants");


module.exports.setup = (app) => {
  const router = express.Router();
  app.use("/api/auth", router);  
  
  // Đăng ký tài khoản nhân viên (chỉ admin)
  router.post(
    "/employee/register",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
      validate(employeeRegisterRequestSchema, 'body'),
    ],
    authController.registerEmployee
  );
  router.all("/employee/register", methodNotAllowed);

  // Đăng nhập
  router.post(
    "/login",
    validate(loginRequestSchema, 'body'),
    authController.login
  );
  router.all("/login", methodNotAllowed);

  // Lấy thông tin người dùng đăng nhập
  router.get(
    "/me",
    authenticateToken,
    authController.getCurrentUser
  );
  router.all("/me", methodNotAllowed);
  
  // Đổi mật khẩu (tất cả user đã đăng nhập)
  router.put(
    "/change-password",
    [
      authenticateToken,
      validateRequest(changePasswordRequestSchema),
    ],
    authController.changePassword
  );
  router.all("/change-password", methodNotAllowed);
  
  // Lấy danh sách vai trò
  router.get(
    "/roles",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
    ],
    authController.getRoles
  );
  router.all("/roles", methodNotAllowed);

  // Lấy danh sách nhân viên (chỉ admin)
  router.get(
    "/employees",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
    ],
    authController.getEmployees
  );
  router.all("/employees", methodNotAllowed);

  // Lấy danh sách khách hàng (chỉ admin và nhân viên)
  router.get(
    "/customers",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    ],
    authController.getCustomers
  );
  router.all("/customers", methodNotAllowed);

  // Lấy thông tin chi tiết khách hàng theo ID (chỉ admin và nhân viên)
  router.get(
    "/customers/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    ],
    authController.getCustomerById
  );

  // Cập nhật thông tin khách hàng theo ID (chỉ admin và nhân viên)
  router.put(
    "/customers/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]),
      validateRequest(updateCustomerRequestSchema),
    ],
    authController.updateCustomer
  );
  
  // Bất kỳ phương thức nào khác sẽ bị chặn ở đây
  router.all("/customers/:id", methodNotAllowed);

  // Lấy thông tin chi tiết nhân viên theo ID (chỉ admin)
  router.get(
    "/employees/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
    ],
    authController.getEmployeeById
  );

  // Cập nhật thông tin nhân viên theo ID (chỉ admin)
  router.put(
    "/employees/:id",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
      validateRequest(updateEmployeeRequestSchema),
    ],
    authController.updateEmployee
  );
  
  // Method not allowed cho employees/:id
  router.all("/employees/:id", methodNotAllowed);

  // Google OAuth routes
  router.get('/google/url', authController.getGoogleAuthUrl);
  router.post('/google/callback', authController.googleCallback);

  // Kiểm tra khách hàng theo số điện thoại (Staff/Admin only)
  router.get(
    "/check-customer/:phone",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
    ],
    authController.checkCustomerByPhone
  );
  router.all("/check-customer/:phone", methodNotAllowed);

  // Tạo khách hàng mới không có tài khoản (Staff/Admin only)
  router.post(
    "/create-customer",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN, ROLES.STAFF]),
      validateRequest(createCustomerWithoutAccountRequestSchema),
    ],
    authController.createCustomerWithoutAccount
  );
  router.all("/create-customer", methodNotAllowed);

  // Merge customer POS với Google account (Admin only)
  router.post(
    "/merge-customer",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
    ],
    authController.mergePosCustomerWithGoogleAccount
  );
  router.all("/merge-customer", methodNotAllowed);

  // Lấy danh sách customer POS (không có account) để merge (Admin only)
  router.get(
    "/pos-customers",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
    ],
    authController.getPosCustomers
  );
  router.all("/pos-customers", methodNotAllowed);

  // Link số điện thoại với Google account (Customer only)
  router.post(
    "/link-phone",
    [
      authenticateToken,
      authorizeRoles([ROLES.CUSTOMER]),
      validateRequest(linkPhoneNumberRequestSchema),
    ],
    authController.linkPhoneNumberToGoogleAccount
  );
  router.all("/link-phone", methodNotAllowed);
}

