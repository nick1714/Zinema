const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding cinema rooms...');
  
  // Xóa dữ liệu cũ
  await knex('cinema_rooms').del();
  
  // Tạo dữ liệu mẫu cho phòng chiếu
  const roomTypes = ['2D', '3D', '4DX', 'IMAX'];
  const roomStatus = ['active', 'maintenance', 'inactive'];
  
  const rooms = [];
  
  // Tạo 10 phòng chiếu
  for (let i = 1; i <= 10; i++) {
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const status = roomStatus[Math.floor(Math.random() * roomStatus.length)];
    
    // Số hàng và cột ngẫu nhiên nhưng hợp lý
    const rows = faker.number.int({ min: 5, max: 15 });
    const columns = faker.number.int({ min: 8, max: 20 });
    const capacity = rows * columns;
    
    rooms.push({
      name: `Phòng ${i}`,
      capacity: capacity,
      rows: rows,
      columns: columns,
      type: roomType,
      status: i <= 8 ? 'active' : status, // Đảm bảo phần lớn phòng đều hoạt động
      created_at: faker.date.past(),
      updated_at: new Date()
    });
  }
  
  await knex('cinema_rooms').insert(rooms);
  console.log(`Đã thêm ${rooms.length} phòng chiếu`);
}; 