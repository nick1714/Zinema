/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  console.log("Seeding 2 admins and 6 staff users...");

  // Lấy ID role admin và staff
  const adminRole = await knex("roles").where("name", "admin").first();
  const staffRole = await knex("roles").where("name", "staff").first();

  if (!adminRole || !staffRole) {
    console.error(
      "Không tìm thấy role admin hoặc staff. Vui lòng seed roles trước."
    );
    return;
  }

  // Xóa tài khoản và nhân viên cũ cho admin và staff
  const deleteIds = await knex("accounts")
    .whereIn("role_id", [adminRole.id, staffRole.id])
    .pluck("id");
  if (deleteIds.length) {
    await knex("employees").whereIn("account_id", deleteIds).del();
    await knex("accounts").whereIn("id", deleteIds).del();
  }

  // Hàm tạo account và employee
  async function createUser({
    phone,
    email,
    password,
    roleId,
    fullName,
    position,
  }) {
    const hashed = await bcrypt.hash(password, 10);
    const [acc] = await knex("accounts")
      .insert({
        phone_number: phone,
        email,
        password: hashed,
        role_id: roleId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("id");

    const accountId = acc.id || acc;
    await knex("employees").insert({
      account_id: accountId,
      email,
      full_name: fullName,
      phone_number: phone,
      address: "Can Tho",
      gender: "male",
      date_of_birth: "1990-01-01",
      position,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Tạo 2 admin
  await createUser({
    phone: "0912345678",
    email: "admin1@cinema.com",
    password: "admin123",
    roleId: adminRole.id,
    fullName: "Admin Nhut",
    position: "Administrator",
  });
  await createUser({
    phone: "0987654322",
    email: "admin2@cinema.com",
    password: "admin1234",
    roleId: adminRole.id,
    fullName: "Admin Dat",
    position: "Administrator",
  });

  // Tạo 4 nhân viên bán vé
  for (let i = 1; i <= 4; i++) {
    await createUser({
      phone: `097000000${i}`,
      email: `seller${i}@cinema.com`,
      password: "Staff123",
      roleId: staffRole.id,
      fullName: `Nhân viên bán vé ${i}`,
      position: "Nhân viên bán vé",
    });
  }

  // Tạo 2 nhân viên vệ sinh
  for (let i = 1; i <= 2; i++) {
    await createUser({
      phone: `097000001${i}`,
      email: `cleaner${i}@cinema.com`,
      password: "Staff123",
      roleId: staffRole.id,
      fullName: `Nhân viên vệ sinh ${i}`,
      position: "Nhân viên vệ sinh",
    });
  }

  console.log(
    "Đã seed xong 2 admins, 4 seller và 2 cleaner với mật khẩu mặc định."
  );
};
