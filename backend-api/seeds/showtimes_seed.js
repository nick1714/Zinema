/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('Seeding showtimes for 7 days, 5 rooms × 4 movies × 5 slots...');

  // Xóa showtimes cũ
  await knex('showtimes').del();

  // Lấy 4 phim đã seed trước
  const movies = await knex('movies')
    .select('id', 'title')
    .limit(4);

  // Lấy 5 phòng active
  const rooms = await knex('cinema_rooms')
    .select('id', 'name')
    .where('status', 'active')
    .limit(5);

  if (movies.length < 4) {
    console.error('Cần seed trước 4 movies');
    return;
  }
  if (rooms.length < 5) {
    console.error('Cần seed trước 5 cinema_rooms (status=active)');
    return;
  }

  // Các khung giờ cố định
  const slots = [
    { startHour: 8,  endHour: 10 },
    { startHour: 11, endHour: 13 },
    { startHour: 14, endHour: 16 },
    { startHour: 17, endHour: 19 },
    { startHour: 20, endHour: 22 },
  ];

  const showtimes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 7 ngày liên tiếp
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const showDate = new Date(today);
    showDate.setDate(showDate.getDate() + dayOffset);

    movies.forEach((movie, mi) => {
      slots.forEach((slot, si) => {
        // Tính start_time và end_time
        const startTime = new Date(showDate);
        startTime.setHours(slot.startHour, 0, 0, 0);

        const endTime = new Date(showDate);
        endTime.setHours(slot.endHour, 0, 0, 0);

        // Chọn phòng theo vòng (round-robin)
        const room = rooms[(mi + si) % rooms.length];

        showtimes.push({
          movie_id: movie.id,
          cinema_room_id: room.id,
          start_time: startTime,
          end_time: endTime,
          price: 45000,          // giá vé mặt định
          status: 'scheduled',
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    });
  }

  // Chèn tất cả vào DB
  await knex('showtimes').insert(showtimes);
  console.log(`Đã thêm ${showtimes.length} suất chiếu (4 movies × 5 slots × 7 days)`);
};
