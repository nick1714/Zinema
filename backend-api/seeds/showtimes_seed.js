const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding showtimes...');
  
  // Xóa dữ liệu cũ
  await knex('showtimes').del();
  
  // Lấy dữ liệu movies và cinema_rooms
  const movies = await knex('movies').select('id', 'duration_min', 'title');
  const cinemaRooms = await knex('cinema_rooms').select('id', 'name').where('status', 'active');
  
  if (movies.length === 0) {
    console.log('Không có phim nào. Vui lòng chạy seed movies_seed trước.');
    return;
  }
  
  if (cinemaRooms.length === 0) {
    console.log('Không có phòng chiếu nào. Vui lòng chạy seed cinema_rooms_seed trước.');
    return;
  }
  
  // Tạo danh sách suất chiếu
  const showtimes = [];
  
  // Tạo suất chiếu cho 30 ngày kể từ hôm nay
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  // Giờ chiếu phim trong ngày
  const showHours = [9, 11, 13, 15, 17, 19, 21, 23];
  
  // Tạo suất chiếu cho mỗi ngày
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Mỗi phòng sẽ chiếu 3-6 suất mỗi ngày
    for (const room of cinemaRooms) {
      // Chọn ngẫu nhiên số suất chiếu cho phòng này trong ngày
      const numShowtimes = faker.number.int({ min: 3, max: 6 });
      
      // Chọn ngẫu nhiên các giờ chiếu
      const selectedHours = faker.helpers.arrayElements(showHours, numShowtimes).sort((a, b) => a - b);
      
      // Với mỗi giờ chiếu, chọn một bộ phim ngẫu nhiên
      for (const hour of selectedHours) {
        const movie = faker.helpers.arrayElement(movies);
        
        // Tính thời gian bắt đầu và kết thúc
        const startTime = new Date(currentDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + movie.duration_min);
        
        // Tính giá vé dựa trên giờ chiếu và ngày trong tuần
        let basePrice = 80000; // Giá cơ bản
        
        // Tăng giá vào buổi tối
        if (hour >= 17) {
          basePrice += 20000;
        }
        
        // Tăng giá vào cuối tuần (thứ 6, 7, chủ nhật)
        const dayOfWeek = startTime.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
          basePrice += 30000;
        }
        
        // Tạo suất chiếu
        showtimes.push({
          movie_id: movie.id,
          cinema_room_id: room.id,
          start_time: startTime,
          end_time: endTime,
          price: basePrice,
          status: faker.helpers.arrayElement(['scheduled', 'scheduled', 'scheduled', 'canceled']), // 75% scheduled
          created_at: faker.date.past(),
          updated_at: new Date()
        });
      }
    }
    
    // Chuyển sang ngày tiếp theo
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Chèn dữ liệu vào database theo lô để tránh quá tải
  const batchSize = 500;
  for (let i = 0; i < showtimes.length; i += batchSize) {
    const batch = showtimes.slice(i, i + batchSize);
    await knex('showtimes').insert(batch);
    console.log(`Đã thêm ${batch.length} suất chiếu (${i + batch.length}/${showtimes.length})`);
  }
  
  console.log(`Đã thêm tổng cộng ${showtimes.length} suất chiếu`);
}; 