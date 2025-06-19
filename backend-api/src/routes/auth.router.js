const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { employeeRegisterSchema, loginSchema, googleCompleteSchema } = require("../schemas/auth.schemas");
const { ROLES } = require("../constants");


function setup(app) {
  const router = express.Router();
  app.use("/api/v1/auth", router);  
  
  // Đăng ký tài khoản nhân viên (chỉ admin)
  router.post(
    "/employee/register",
    [
      authenticateToken,
      authorizeRoles([ROLES.ADMIN]),
      validateRequest(employeeRegisterSchema),
    ],
    authController.registerEmployee
  );
  router.all("/employee/register", methodNotAllowed);

  // Đăng nhập
  router.post(
    "/login",
    validateRequest(loginSchema),
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

  // Google Auth routes
  router.get('/google', authController.initiateGoogleAuth);
  router.all('/google', methodNotAllowed);

  router.get('/google/callback', authController.googleCallback);
  router.all('/google/callback', methodNotAllowed);

  router.post('/google/complete', 
    validateRequest(googleCompleteSchema), 
    authController.completeProfile
  );
  router.all('/google/complete', methodNotAllowed);
}

module.exports = setup; 