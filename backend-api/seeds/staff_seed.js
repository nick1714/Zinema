/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

faker.locale = 'vi';

exports.seed = async function(knex) {
  // Lấy ID của vai trò staff
  const staffRole = await knex('roles')
    .where('name', 'staff')
    .first();
  
  if (!staffRole) {
    console.error('Không tìm thấy vai trò staff, vui lòng chạy seed roles trước');
    return;
  }
  
  // Xóa dữ liệu nhân viên cũ (trừ admin)
  await knex('employees')
    .whereIn('account_id', function() {
      this.select('id')
        .from('accounts')
        .where('role_id', staffRole.id);
    })
    .del();
  
  await knex('accounts')
    .where('role_id', staffRole.id)
    .del();
  
  // Tạo mẫu 5 nhân viên
  const staffMembers = [];
  
  for (let i = 0; i < 10; i++) {
    // Tạo tài khoản nhân viên
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'cinema.com' }).toLowerCase();
    const phoneNumber = '0' + faker.string.numeric(9); // Tạo số điện thoại
    
    // Mã hóa mật khẩu (mặc định: Staff123)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Staff123', salt);
    
    // Thêm tài khoản nhân viên
    const result = await knex('accounts')
      .insert({
        phone_number: phoneNumber,
        email: email,
        password: hashedPassword,
        role_id: staffRole.id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');
    
    // Lấy account_id đúng cách
    const accountId = result[0].id || result[0];
    
    // Thêm thông tin nhân viên
    await knex('employees')
      .insert({
        account_id: accountId,
        email: email,
        full_name: `${firstName} ${lastName}`,
        phone_number: phoneNumber,
        address: faker.location.streetAddress(true).substring(0, 255), // Đảm bảo độ dài address
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        date_of_birth: faker.date.between({ from: '1985-01-01', to: '2000-12-31' }),
        position: faker.helpers.arrayElement(['Nhân viên bán vé', 'Nhân viên kỹ thuật', 'Nhân viên vệ sinh', 'Trưởng ca']),
        created_at: new Date(),
        updated_at: new Date()
      });
    
    staffMembers.push({
      phone: phoneNumber,
      email: email,
      name: `${firstName} ${lastName}`
    });
  }
  
  console.log('Đã tạo 5 tài khoản nhân viên mẫu với mật khẩu: Staff123');
  console.log('Danh sách nhân viên:');
  staffMembers.forEach(staff => {
    console.log(`- ${staff.phone} | ${staff.email} (${staff.name})`);
  });
}; 