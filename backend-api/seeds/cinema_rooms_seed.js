/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding cinema rooms (5 rooms, all active)...');
  
  // Xóa dữ liệu cũ
  await knex('cinema_rooms').del();
  
  // Dữ liệu mẫu cho 5 phòng chiếu
  const rooms = [
    {
      name: 'Phòng 1',
      capacity: 100,
      rows: 10,
      columns: 10,
      type: '2D',
      status: 'active',
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date(),
    },
    {
      name: 'Phòng 2',
      capacity: 100,
      rows: 10,
      columns: 10,
      type: '2D',
      status: 'active',
      created_at: new Date('2024-02-10T14:30:00Z'),
      updated_at: new Date(),
    },
    {
      name: 'Phòng 3',
      capacity: 100,
      rows: 10,
      columns: 10,
      type: '2D',
      status: 'active',
      created_at: new Date('2024-03-05T09:15:00Z'),
      updated_at: new Date(),
    },
    {
      name: 'Phòng 4',
      capacity: 100,
      rows: 10,
      columns: 10,
      type: '2D',
      status: 'active',
      created_at: new Date('2024-04-20T16:45:00Z'),
      updated_at: new Date(),
    },
    {
      name: 'Phòng 5',
      capacity: 100,
      rows: 10,
      columns: 10,
      type: '2D',
      status: 'active',
      created_at: new Date('2024-05-12T11:20:00Z'),
      updated_at: new Date(),
    },
  ];
  
  // Chèn dữ liệu
  await knex('cinema_rooms').insert(rooms);
  console.log(`Đã thêm ${rooms.length} phòng chiếu (all active)`);
};
