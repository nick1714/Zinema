const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding movies...');
  
  // Xóa dữ liệu cũ
  await knex('movies').del();
  
  // Danh sách thể loại phim
  const genres = [
    'Hành động', 'Phiêu lưu', 'Hoạt hình', 'Hài', 'Tội phạm', 
    'Tài liệu', 'Chính kịch', 'Gia đình', 'Giả tưởng', 'Lịch sử', 
    'Kinh dị', 'Âm nhạc', 'Bí ẩn', 'Lãng mạn', 'Khoa học viễn tưởng', 
    'Ly kỳ', 'Siêu anh hùng', 'Chiến tranh'
  ];
  
  // Danh sách đạo diễn
  const directors = [
    'Christopher Nolan', 'Steven Spielberg', 'Martin Scorsese', 
    'Quentin Tarantino', 'James Cameron', 'Denis Villeneuve', 
    'David Fincher', 'Bong Joon-ho', 'Greta Gerwig', 'Ngô Thanh Vân',
    'Trấn Thành', 'Victor Vũ', 'Charlie Nguyễn', 'Phan Gia Nhật Linh'
  ];
  
  // Danh sách quốc gia
  const countries = ['Việt Nam', 'Mỹ', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Anh', 'Pháp'];
  
  // Danh sách xếp hạng độ tuổi
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'T13', 'T16', 'T18', 'C'];
  
  // Tạo dữ liệu phim
  const movies = [];
  const numMovies = 30; // Số lượng phim cần tạo
  
  for (let i = 0; i < numMovies; i++) {
    const releaseDate = faker.date.between({ 
      from: new Date('2023-01-01'), 
      to: new Date('2024-12-31') 
    });
    
    const genre = faker.helpers.arrayElements(genres, { min: 1, max: 3 }).join(', ');
    const director = faker.helpers.arrayElement(directors);
    const country = faker.helpers.arrayElement(countries);
    const ageRating = faker.helpers.arrayElement(ageRatings);
    
    // Tạo ngày kết thúc (sau ngày khởi chiếu 1-6 tháng)
    const endDate = new Date(releaseDate);
    endDate.setMonth(endDate.getMonth() + faker.number.int({ min: 1, max: 6 }));
    
    // Tạo danh sách diễn viên
    const numActors = faker.number.int({ min: 3, max: 8 });
    const actors = [];
    for (let j = 0; j < numActors; j++) {
      actors.push(faker.person.fullName());
    }
    
    movies.push({
      title: faker.helpers.maybe(() => faker.word.words({ count: { min: 2, max: 5 } }), { probability: 0.7 }) || 
             faker.music.songName(),
      description: faker.lorem.paragraph(),
      director: director,
      cast: actors.join(', '),
      genre: genre,
      duration_min: faker.number.int({ min: 90, max: 180 }),
      release_date: releaseDate,
      end_date: endDate,
      country: country,
      age_rating: ageRating,
      status: faker.helpers.arrayElement(['active', 'inactive']),
      poster_url: `/public/images/posters/poster-${i + 1}.jpg`,
      trailer_url: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
      created_at: faker.date.past(),
      updated_at: new Date()
    });
  }
  
  await knex('movies').insert(movies);
  console.log(`Đã thêm ${movies.length} bộ phim`);
}; 