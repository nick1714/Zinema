/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('Seeding optimized showtimes for 7 days, 5 rooms...');

  // Xóa showtimes cũ
  await knex('showtimes').del();

  // Lấy dữ liệu phim và phòng
  const movies = await knex('movies')
    .select('id', 'title', 'duration_min')
    .where('status', 'active');
  const rooms = await knex('cinema_rooms')
    .select('id', 'name')
    .where('status', 'active')
    .limit(5);

  if (!movies.length || rooms.length < 5) {
    console.error('Cần seed đủ movies và cinema_rooms trước khi chạy!');
    return;
  }

  // Thông số chung
  const DAYS = 7;
  const OPEN_HOUR = 8;
  const CLOSE_HOUR = 22;
  const CLEANUP_MIN = 10;     // thời gian dọn dẹp sau mỗi suất
  const showtimes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Hàm xáo phim mỗi ngày để tránh lặp lịch
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  for (let d = 0; d < DAYS; d++) {
    const showDate = new Date(today);
    showDate.setDate(showDate.getDate() + d);

    // Xác định mốc đóng cửa ngày đó (timestamp)
    const closeTimestamp = new Date(showDate)
      .setHours(CLOSE_HOUR, 0, 0, 0);

    // Xáo danh sách phim để mỗi ngày có thứ tự khác nhau
    let dayQueue = shuffle(movies);

    // Với mỗi phòng, “nhồi” phim liên tục từ 8h–22h
    for (const room of rooms) {
      let cursor = new Date(showDate);
      cursor.setHours(OPEN_HOUR, 0, 0, 0);

      // Chạy cho đến khi cursor vượt mốc đóng cửa
      while (cursor.getTime() < closeTimestamp) {
        // Lấy phim kế tiếp trong hàng đợi; nếu hết thì quay vòng
        const movie = dayQueue.shift();
        dayQueue.push(movie);

        const startTime = new Date(cursor);
        const endTime = new Date(
          startTime.getTime() + (movie.duration_min + CLEANUP_MIN) * 60_000
        );

        // Nếu kết thúc vượt giờ đóng cửa thì không tạo thêm
        if (endTime.getTime() > closeTimestamp) {
          break;
        }

        // Giá vé: tuỳ theo khung giờ bắt đầu
        const h = startTime.getHours();
        let price;
        if (h < 12)       price = 35000;
        else if (h < 17)  price = 45000;
        else              price = 55000;

        showtimes.push({
          movie_id: movie.id,
          cinema_room_id: room.id,
          start_time: startTime,
          end_time: endTime,
          price,
          status: 'scheduled',
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Di chuyển cursor đến ngay sau endTime
        cursor = new Date(endTime);
      }
    }
  }

  // Chèn vào DB
  await knex('showtimes').insert(showtimes);
  console.log(`Đã tạo ${showtimes.length} suất chiếu trong ${DAYS} ngày cho ${rooms.length} phòng.`);
};
