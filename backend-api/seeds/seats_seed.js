const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding seats...');
  
  // Xóa dữ liệu cũ
  await knex('seats').del();
  
  // Lấy danh sách phòng và loại ghế
  const cinemaRooms = await knex('cinema_rooms').select('*');
  const seatTypes = await knex('seat_types').select('*');
  
  if (cinemaRooms.length === 0) {
    console.log('Không có phòng chiếu nào. Vui lòng chạy seed cinema_rooms_seed trước.');
    return;
  }
  
  if (seatTypes.length === 0) {
    console.log('Không có loại ghế nào. Vui lòng chạy seed seat_types_seed trước.');
    return;
  }
  
  // Map các loại ghế theo tên để dễ truy cập
  const seatTypeMap = {};
  seatTypes.forEach(type => {
    seatTypeMap[type.name] = type.id;
  });
  
  const standardTypeId = seatTypeMap['Standard'] || seatTypes[0].id;
  const vipTypeId = seatTypeMap['VIP'] || seatTypes[1].id;
  const coupleTypeId = seatTypeMap['Couple'] || seatTypes[2].id;
  
  // Tạo ghế cho mỗi phòng
  const allSeats = [];
  
  for (const room of cinemaRooms) {
    // Bỏ qua các phòng không hoạt động
    if (room.status !== 'active') continue;
    
    const rows = room.rows;
    const columns = room.columns;
    
    // Tạo mảng chữ cái cho hàng (A, B, C, ...)
    const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));
    
    for (let r = 0; r < rows; r++) {
      const rowLetter = rowLetters[r];
      
      for (let c = 1; c <= columns; c++) {
        // Xác định loại ghế dựa vào vị trí
        let seatTypeId = standardTypeId;
        
        // Ghế VIP thường ở giữa phòng
        if (r >= Math.floor(rows * 0.3) && r < Math.floor(rows * 0.7) && 
            c >= Math.floor(columns * 0.3) && c < Math.floor(columns * 0.7)) {
          seatTypeId = vipTypeId;
        }
        
        // Ghế đôi thường ở hàng cuối
        if (r === rows - 1 && c % 2 === 1 && c < columns) {
          seatTypeId = coupleTypeId;
          
          // Tạo ghế đôi (chiếm 2 cột)
          const seatName = `${rowLetter}${c}-${c+1}`;
          
          allSeats.push({
            cinema_room_id: room.id,
            seat_type_id: seatTypeId,
            name: seatName,
            row: rowLetter,
            column: c,
            status: faker.helpers.arrayElement(['available', 'available', 'available', 'unavailable']), // 75% available
            created_at: faker.date.past(),
            updated_at: new Date()
          });
          
          // Bỏ qua cột tiếp theo vì đã được sử dụng cho ghế đôi
          c++;
          continue;
        }
        
        // Tạo ghế thường
        const seatName = `${rowLetter}${c}`;
        
        allSeats.push({
          cinema_room_id: room.id,
          seat_type_id: seatTypeId,
          name: seatName,
          row: rowLetter,
          column: c,
          status: faker.helpers.arrayElement(['available', 'available', 'available', 'unavailable']), // 75% available
          created_at: faker.date.past(),
          updated_at: new Date()
        });
      }
    }
  }
  
  // Chèn dữ liệu vào database theo lô để tránh quá tải
  const batchSize = 500;
  for (let i = 0; i < allSeats.length; i += batchSize) {
    const batch = allSeats.slice(i, i + batchSize);
    await knex('seats').insert(batch);
    console.log(`Đã thêm ${batch.length} ghế (${i + batch.length}/${allSeats.length})`);
  }
  
  console.log(`Đã thêm tổng cộng ${allSeats.length} ghế`);
}; 