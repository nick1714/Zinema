const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const { ROLES, JWT_CONFIG, SKIP_AUTH } = require('../constants');

/**
 * Tạo JWT token
 * @param {Object} accountData Thông tin tài khoản người dùng
 * @returns {String} JWT token
 */
function generateToken(accountData) {
  const payload = {
    id: accountData.id,
    role_id: accountData.role_id,
    phone_number: accountData.phone_number,
    role: accountData.role 
  };
  
  return jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
}

/**
 * Middleware xác thực token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
function authenticateToken(req, res, next) {
  // Debug
  console.log('DEBUG authenticateToken - SKIP_AUTH:', SKIP_AUTH);
  
  // Bỏ qua xác thực nếu cờ SKIP_AUTH được bật
  if (SKIP_AUTH) {
    console.log('SKIP_AUTH enabled - bypassing authentication');
    // Thiết lập user giả với role admin
    req.user = {
      id: 1,
      role_id: 1,
      phone_number: "0987654321",
      role: "admin"
    };
    return next();
  }
  
  console.log('SKIP_AUTH disabled - checking token');
  
  // Lấy token từ header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next(new ApiError(401, 'Unauthorized: No token provided'));
  }
  
  // Xác thực token
  jwt.verify(token, JWT_CONFIG.SECRET, (err, user) => {
    if (err) {
      return next(new ApiError(403, 'Forbidden: Invalid token'));
    }
    
    req.user = user;
    next();
  });
}

/**
 * Middleware phân quyền dựa trên vai trò
 * @param {Array|String} allowedRoles - Danh sách vai trò được phép truy cập
 * @returns {Function} Middleware function
 */
function authorizeRoles(allowedRoles) {
  return async (req, res, next) => {
    // Bỏ qua phân quyền nếu cờ SKIP_AUTH được bật
    if (SKIP_AUTH) {
      // Đảm bảo req.user có role
      if (!req.user.role) {
        req.user.role = "admin";
      }
      return next();
    }
    
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized: Authentication required'));
    }
    
    try {
      // Lấy thông tin role từ database
      const knex = require('../database/knex');
      const role = await knex('roles')
        .where('id', req.user.role_id)
        .first();
      
      if (!role) {
        return next(new ApiError(403, 'Forbidden: Invalid role'));
      }
      
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Kiểm tra vai trò người dùng
      if (!roles.includes(role.name)) {
        return next(new ApiError(403, 'Forbidden: Insufficient permissions'));
      }
      
      // Thêm thông tin role vào request để sử dụng sau này
      req.user.role = role.name;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return next(new ApiError(500, 'Internal Server Error'));
    }
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  authorizeRoles
}; 