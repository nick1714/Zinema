/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

faker.locale = 'vi';

exports.seed = async function(knex) {
  // Lấy ID của vai trò customer
  const customerRole = await knex('roles')
    .where('name', 'customer')
    .first();
  
  if (!customerRole) {
    console.error('Không tìm thấy vai trò customer, vui lòng chạy seed roles trước');
    return;
  }
  
  // Xóa dữ liệu khách hàng cũ
  await knex('customers')
    .whereIn('account_id', function() {
      this.select('id')
        .from('accounts')
        .where('role_id', customerRole.id);
    })
    .del();
  
  await knex('accounts')
    .where('role_id', customerRole.id)
    .del();
  
  // Tạo một tài khoản khách hàng mặc định để test
  const defaultSalt = await bcrypt.genSalt(10);
  const defaultHashedPassword = await bcrypt.hash('Customer123', defaultSalt);
  
  const defaultResult = await knex('accounts')
    .insert({
      phone_number: '0987654320',
      email: 'customer@example.com',
      password: defaultHashedPassword,
      role_id: customerRole.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning('id');
  
  const defaultAccountId = defaultResult[0].id || defaultResult[0];
  
  await knex('customers')
    .insert({
      account_id: defaultAccountId,
      full_name: 'Khách Hàng',
      phone_number: '0987954320',
      address: '123 Đường Khách Hàng, Q.1, TP.HCM',
      gender: 'other',
      date_of_birth: new Date('1990-01-01'),
      loyalty_points: 100,
      created_at: new Date(),
      updated_at: new Date()
    });
  
  // Tạo mẫu 10 khách hàng ngẫu nhiên
  for (let i = 0; i < 10; i++) {
    // Tạo tài khoản khách hàng
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phoneNumber = '09' + faker.string.numeric(8); // Tạo số điện thoại bắt đầu từ 09
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    
    // Thêm tài khoản khách hàng
    const result = await knex('accounts')
      .insert({
        phone_number: phoneNumber,
        email: email,
        password: hashedPassword,
        role_id: customerRole.id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');
    
    const accountId = result[0].id || result[0];
    
    // Thêm thông tin khách hàng
    await knex('customers')
      .insert({
        account_id: accountId,
        full_name: `${firstName} ${lastName}`,
        phone_number: phoneNumber,
        address: faker.location.streetAddress(true).substring(0, 255), // Đảm bảo độ dài address
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        date_of_birth: faker.date.between({ from: '1970-01-01', to: '2003-12-31' }),
        loyalty_points: faker.number.int({ min: 0, max: 500 }),
        created_at: new Date(),
        updated_at: new Date()
      });
  }
  
  console.log('Đã tạo tài khoản khách hàng mặc định với phone: 0987654320, email: customer@example.com và mật khẩu: Customer123');
  console.log('Đã tạo thêm 10 tài khoản khách hàng ngẫu nhiên với mật khẩu: Password123');
}; 