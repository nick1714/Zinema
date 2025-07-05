/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log("Seeding 4 currently showing movies...");

  // Xóa dữ liệu cũ
  await knex("movies").del();

  // 4 phim đang chiếu
  const movies = [
    {
      title: "Chiến Binh Cuối Cùng",
      description:
        "Một bộ phim hành động-phiêu lưu kịch tính, theo chân đội lính đánh thuê giải cứu con tin tại vùng đất hoang dã.",
      director: "Christopher Nolan",
      cast: "Leonardo DiCaprio, Tom Hardy, Joseph Gordon-Levitt",
      genre: "Hành động, Phiêu lưu",
      duration_min: 130,
      release_date: new Date("2025-05-15"),
      end_date: new Date("2025-07-15"),
      country: "Mỹ",
      age_rating: "PG-13",
      status: "active",
      poster_url: "/public/images/posters/poster-sample1.jpg",
      trailer_url: "https://www.youtube.com/watch?v=ABC123DEF45",
      created_at: new Date("2025-04-01T09:00:00Z"),
      updated_at: new Date(),
    },
    {
      title: "Hành Trình Sao Hỏa",
      description:
        "Phim khoa học viễn tưởng đỉnh cao, theo tiểu đoàn đầu tiên lên sao Hỏa đối mặt với hiểm nguy và bí ẩn ngoài hành tinh.",
      director: "Denis Villeneuve",
      cast: "Matt Damon, Jessica Chastain, Bill Skarsgård",
      genre: "Khoa học viễn tưởng, Ly kỳ",
      duration_min: 120,
      release_date: new Date("2025-06-01"),
      end_date: new Date("2025-08-01"),
      country: "Mỹ",
      age_rating: "T13",
      status: "active",
      poster_url: "/public/images/posters/poster-sample2.jpg",
      trailer_url: "https://www.youtube.com/watch?v=XYZ678GHI90",
      created_at: new Date("2025-05-01T10:30:00Z"),
      updated_at: new Date(),
    },
    {
      title: "Tiếng Gọi Rừng Sâu",
      description:
        "Từ màn ảnh hoạt hình, câu chuyện cảm động về hành trình khám phá và bảo vệ khu rừng nguyên sinh của cậu bé nhỏ Ella.",
      director: "Bong Joon-ho",
      cast: "Ella Tran, Minh Bùi, Hương Giang",
      genre: "Hoạt hình, Gia đình",
      duration_min: 100,
      release_date: new Date("2025-04-20"),
      end_date: new Date("2025-07-01"),
      country: "Hàn Quốc",
      age_rating: "G",
      status: "active",
      poster_url: "/public/images/posters/poster-sample3.jpg",
      trailer_url: "https://www.youtube.com/watch?v=LMN234OPQ56",
      created_at: new Date("2025-03-15T08:45:00Z"),
      updated_at: new Date(),
    },
    {
      title: "Bóng Ma Đêm Khuya",
      description:
        "Phim kinh dị-huyền bí, hé lộ những bí mật đen tối trong một ngôi làng hẻo lánh bị bóng ma ám ảnh.",
      director: "James Wan",
      cast: "Lily Collins, Robert Pattinson, Anya Taylor-Joy",
      genre: "Kinh dị, Bí ẩn",
      duration_min: 120,
      release_date: new Date("2025-06-10"),
      end_date: new Date("2025-07-30"),
      country: "Anh",
      age_rating: "R",
      status: "active",
      poster_url: "/public/images/posters/default-movie-poster.png",
      trailer_url: "https://www.youtube.com/watch?v=QRS345TUV78",
      created_at: new Date("2025-05-20T11:15:00Z"),
      updated_at: new Date(),
    },
  ];

  // Chèn vào DB
  await knex("movies").insert(movies);
  console.log(`Đã thêm ${movies.length} phim đang chiếu.`);
};
