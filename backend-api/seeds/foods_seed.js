const { faker } = require('@faker-js/faker/locale/vi');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Seeding foods...');
  
  // Xóa dữ liệu cũ
  await knex('foods').del();
  
  // Danh sách danh mục đồ ăn
  const categories = ['Popcorn', 'Nước uống', 'Snack', 'Combo', 'Đồ ăn nhanh', 'Đồ ngọt'];
  
  // Tạo dữ liệu mẫu cho đồ ăn
  const foods = [];
  
  // Popcorn
  foods.push(
    {
      name: 'Popcorn nhỏ',
      description: 'Hộp bắp rang nhỏ, phù hợp cho 1 người',
      price: 45000,
      image_url: '/public/images/foods/popcorn-small.jpg',
      category: 'Popcorn',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Popcorn vừa',
      description: 'Hộp bắp rang cỡ vừa, phù hợp cho 1-2 người',
      price: 55000,
      image_url: '/public/images/foods/popcorn-medium.jpg',
      category: 'Popcorn',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Popcorn lớn',
      description: 'Hộp bắp rang lớn, phù hợp cho 2-3 người',
      price: 65000,
      image_url: '/public/images/foods/popcorn-large.jpg',
      category: 'Popcorn',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Popcorn caramel',
      description: 'Bắp rang vị caramel ngọt ngào',
      price: 60000,
      image_url: '/public/images/foods/popcorn-caramel.jpg',
      category: 'Popcorn',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Popcorn phô mai',
      description: 'Bắp rang vị phô mai béo ngậy',
      price: 60000,
      image_url: '/public/images/foods/popcorn-cheese.jpg',
      category: 'Popcorn',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    }
  );
  
  // Nước uống
  foods.push(
    {
      name: 'Coca-Cola nhỏ',
      description: 'Ly Coca-Cola cỡ nhỏ 350ml',
      price: 25000,
      image_url: '/public/images/foods/coke-small.jpg',
      category: 'Nước uống',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Coca-Cola vừa',
      description: 'Ly Coca-Cola cỡ vừa 500ml',
      price: 35000,
      image_url: '/public/images/foods/coke-medium.jpg',
      category: 'Nước uống',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Coca-Cola lớn',
      description: 'Ly Coca-Cola cỡ lớn 700ml',
      price: 45000,
      image_url: '/public/images/foods/coke-large.jpg',
      category: 'Nước uống',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Sprite vừa',
      description: 'Ly Sprite cỡ vừa 500ml',
      price: 35000,
      image_url: '/public/images/foods/sprite-medium.jpg',
      category: 'Nước uống',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Fanta vừa',
      description: 'Ly Fanta cỡ vừa 500ml',
      price: 35000,
      image_url: '/public/images/foods/fanta-medium.jpg',
      category: 'Nước uống',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    }
  );
  
  // Snack
  foods.push(
    {
      name: 'Khoai tây chiên',
      description: 'Khoai tây chiên giòn',
      price: 40000,
      image_url: '/public/images/foods/french-fries.jpg',
      category: 'Snack',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Nachos phô mai',
      description: 'Bánh Nachos với sốt phô mai',
      price: 50000,
      image_url: '/public/images/foods/nachos.jpg',
      category: 'Snack',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Gà rán',
      description: 'Gà rán giòn 3 miếng',
      price: 65000,
      image_url: '/public/images/foods/fried-chicken.jpg',
      category: 'Đồ ăn nhanh',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    }
  );
  
  // Combo
  foods.push(
    {
      name: 'Combo cặp đôi',
      description: 'Popcorn lớn + 2 nước vừa + 1 snack tùy chọn',
      price: 120000,
      image_url: '/public/images/foods/couple-combo.jpg',
      category: 'Combo',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Combo gia đình',
      description: 'Popcorn lớn + 4 nước vừa + 2 snack tùy chọn',
      price: 200000,
      image_url: '/public/images/foods/family-combo.jpg',
      category: 'Combo',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    },
    {
      name: 'Combo đơn',
      description: 'Popcorn vừa + 1 nước vừa',
      price: 80000,
      image_url: '/public/images/foods/single-combo.jpg',
      category: 'Combo',
      is_available: true,
      created_at: faker.date.past(),
      updated_at: new Date()
    }
  );
  
  // Thêm một số đồ ăn ngẫu nhiên
  for (let i = 0; i < 5; i++) {
    const category = faker.helpers.arrayElement(categories);
    
    foods.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 30000, max: 100000 }),
      image_url: `/public/images/foods/food-${i + 1}.jpg`,
      category: category,
      is_available: faker.datatype.boolean(),
      created_at: faker.date.past(),
      updated_at: new Date()
    });
  }
  
  await knex('foods').insert(foods);
  console.log(`Đã thêm ${foods.length} món ăn/đồ uống`);
}; 
