const { faker } = require('@faker-js/faker/locale/vi');
const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding admin...');
  
  // Lấy ID của role admin
  const adminRole = await knex('roles').where('name', 'admin').first();
  
  if (!adminRole) {
    console.log('Không tìm thấy role admin. Vui lòng chạy seed 000_init_db.js trước.');
    return;
  }
  
  // Tạo tài khoản admin mặc định
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
    // Kiểm tra xem đã có tài khoản admin chưa
  const existingAdmin = await knex('accounts')
    .where('phone_number', '0987654321')
    .first();

  if (existingAdmin) {
    console.log('Tài khoản admin đã tồn tại.');
    return;
  }

  // Tạo tài khoản admin
  const [accountId] = await knex('accounts')
    .insert({
      phone_number: '0987654321',
      email: 'admin@cinema.com',
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    })
    .returning('id');
  
  // Tạo thông tin nhân viên cho admin
  await knex('employees')
    .insert({
      account_id: accountId.id,
      email: 'admin@cinema.com',
      full_name: 'Admin System',
      phone_number: '0987654321',
      address: faker.location.streetAddress(),
      gender: faker.helpers.arrayElement(['male', 'female']),
      date_of_birth: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
      position: 'Administrator',
      created_at: faker.date.past(),
      updated_at: new Date()
    });
  
  console.log(`Đã tạo tài khoản admin mặc định với phone: 0987654321, email: admin@cinema.com và password: ${password}`);
}; 