/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('Seeding seats (100 per room, 10x10)...');
  
  // Xóa dữ liệu cũ
  await knex('seats').del();
  
  // Lấy các phòng đang hoạt động
  const cinemaRooms = await knex('cinema_rooms')
    .select('id')
    .where('status', 'active');
  
  // Lấy loại ghế Standard
  const seatTypes = await knex('seat_types').select('id', 'name');
  const standardTypeId = seatTypes.find(t => t.name === 'Standard')?.id
    || seatTypes[0].id;
  
  const seats = [];
  const rowLetters = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));
  
  cinemaRooms.forEach(room => {
    for (let r = 0; r < 10; r++) {
      for (let c = 1; c <= 10; c++) {
        seats.push({
          cinema_room_id: room.id,
          seat_type_id: standardTypeId,
          name: `${rowLetters[r]}${c}`,
          row: rowLetters[r],
          column: c,
          status: 'available',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
  });
  
  // Chèn dữ liệu
  await knex('seats').insert(seats);
  console.log(`Đã thêm ${seats.length} ghế`);
};
