/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('=== THÔNG TIN VỀ THỨ TỰ CHẠY SEED ===');
  
  // Các seed files sẽ chạy theo thứ tự:
  // 1. 000_init_db.js - Khởi tạo toàn bộ database
  // 2. admin_seed.js - Tạo tài khoản admin
  // 3. staff_seed.js - Tạo tài khoản nhân viên
  // 4. customers_seed.js - Tạo tài khoản khách hàng
  // 5. seat_types_seed.js - Thêm loại ghế
  // 6. cinema_rooms_seed.js - Thêm phòng chiếu
  // 7. seats_seed.js - Thêm ghế
  // 8. movies_seed.js - Thêm phim
  // 9. showtimes_seed.js - Thêm suất chiếu
  // 10. foods_seed.js - Thêm đồ ăn
  // 11. ticket_bookings_seed.js - Thêm đơn đặt vé

  console.log(`
  Để khởi tạo database mới và thêm dữ liệu mẫu, hãy chạy:
  
  npx knex seed:run
  
  Database sẽ được tạo mới và các dữ liệu mẫu sẽ được thêm theo thứ tự phù hợp.
  `);
}; 