const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding seat types...');
  
  // Xóa dữ liệu cũ
  await knex('seat_types').del();
  
  // Tạo dữ liệu mẫu cho loại ghế
  const seatTypes = [
    {
      name: 'Standard',
      price: 0,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'VIP',
      price: 20000,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Couple',
      price: 30000,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Premium',
      price: 40000,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Deluxe',
      price: 50000,
      created_at: faker.date.past(),
      updated_at: new Date()
    }
  ];
  
  await knex('seat_types').insert(seatTypes);
  console.log(`Đã thêm ${seatTypes.length} loại ghế`);
}; 