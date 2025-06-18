/**
 * File chứa các hằng số được sử dụng trong toàn bộ ứng dụng
 */

// Các role trong hệ thống
const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    CUSTOMER: 'customer'
};

// JWT config
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || "cinema-management-secret-key",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h"
};

// Cờ để bỏ qua xác thực token khi test API
// Mặc định true nếu không có .env file (để dễ test)
const SKIP_AUTH = process.env.SKIP_AUTH === "false" ? false : true;

// Debug: In ra giá trị để kiểm tra
console.log('🔧 DEBUG - Environment variables:');
console.log('process.env.SKIP_AUTH:', process.env.SKIP_AUTH);
console.log('SKIP_AUTH final value:', SKIP_AUTH);

module.exports = {
    ROLES,
    JWT_CONFIG,
    SKIP_AUTH
}; 