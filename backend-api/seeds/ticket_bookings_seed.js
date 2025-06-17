/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const { faker } = require('@faker-js/faker');

faker.locale = 'vi';

exports.seed = async function(knex) {
  // Xóa dữ liệu cũ
  await knex('tickets').del();
  await knex('food_orders').del();
  await knex('invoices').del();
  await knex('ticket_bookings').del();
  
  // Lấy dữ liệu cần thiết
  const customers = await knex('customers').select('id', 'account_id');
  const showtimes = await knex('showtimes')
    .select('id', 'movie_id', 'cinema_room_id', 'start_time')
    .where('start_time', '>', new Date()); // Chỉ lấy suất chiếu tương lai
  
  // Kiểm tra dữ liệu
  if (customers.length === 0 || showtimes.length === 0) {
    console.error('Không tìm thấy dữ liệu khách hàng hoặc suất chiếu');
    return;
  }
  
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const paymentMethods = ['cash', 'credit_card', 'momo', 'zalopay', 'banking'];
  
  // Tạo một số đặt vé
  const bookings = [];
  const tickets = [];
  const invoices = [];
  const foodOrders = [];
  
  // Tạo 20 đặt vé ngẫu nhiên
  for (let i = 0; i < 20; i++) {
    // Chọn ngẫu nhiên khách hàng và suất chiếu
    const customer = faker.helpers.arrayElement(customers);
    const showtime = faker.helpers.arrayElement(showtimes);
    
    // Lấy thông tin phòng chiếu và ghế
    const cinemaRoom = await knex('cinema_rooms')
      .where('id', showtime.cinema_room_id)
      .first();
    
    const seats = await knex('seats')
      .where('cinema_room_id', cinemaRoom.id)
      .select('id', 'seat_type_id', 'name');
    
    if (!cinemaRoom || seats.length === 0) continue;
    
    // Chọn ngẫu nhiên 1-4 ghế
    const numTickets = faker.number.int({ min: 1, max: 4 });
    const selectedSeats = faker.helpers.shuffle(seats).slice(0, numTickets);
    
    // Tạo đặt vé
    const bookingDate = new Date(showtime.start_time);
    bookingDate.setDate(bookingDate.getDate() - faker.number.int({ min: 1, max: 7 }));
    
    const status = faker.helpers.arrayElement(statuses);
    
    const booking = {
      customer_id: customer.id,
      showtime_id: showtime.id,
      booking_date: bookingDate,
      status: status,
      created_at: bookingDate,
      updated_at: bookingDate
    };
    
    // Thêm đặt vé vào database
    const result = await knex('ticket_bookings')
      .insert(booking)
      .returning('id');
    
    // Lấy bookingId một cách chính xác
    const bookingId = result[0].id || result[0];
    
    // Tính tổng giá vé
    let totalTicketPrice = 0;
    
    // Tạo vé cho mỗi ghế
    for (const seat of selectedSeats) {
      // Lấy thông tin loại ghế
      const seatType = await knex('seat_types')
        .where('id', seat.seat_type_id)
        .first();
      
      if (!seatType) continue;
      
      // Giá vé = giá loại ghế
      const ticketPrice = parseFloat(seatType.price);
      totalTicketPrice = totalTicketPrice + ticketPrice;
      
      const ticket = {
        ticket_booking_id: bookingId,
        seat_id: seat.id,
        price: ticketPrice,
        created_at: bookingDate,
        updated_at: bookingDate
      };
      
      // Thêm vé vào database
      await knex('tickets').insert(ticket);
    }
    
    // Có 70% khả năng đặt thêm đồ ăn
    let totalFoodPrice = 0;
    if (faker.number.int({ min: 1, max: 10 }) <= 7) {
      // Lấy danh sách đồ ăn
      const foods = await knex('foods')
        .where('is_available', true)
        .select('id', 'name', 'price');
      
      if (foods.length > 0) {
        // Chọn ngẫu nhiên 1-3 món
        const numFoods = faker.number.int({ min: 1, max: 3 });
        const selectedFoods = faker.helpers.shuffle(foods).slice(0, numFoods);
        
        for (const food of selectedFoods) {
          const quantity = faker.number.int({ min: 1, max: 3 });
          const foodPrice = parseFloat(food.price) * quantity;
          totalFoodPrice = totalFoodPrice + foodPrice;
          
          const foodOrder = {
            ticket_booking_id: bookingId,
            food_id: food.id,
            quantity: quantity,
            price: foodPrice,
            created_at: bookingDate,
            updated_at: bookingDate
          };
          
          // Thêm đơn đồ ăn vào database
          await knex('food_orders').insert(foodOrder);
        }
      }
    }
    
    // Tạo hóa đơn nếu đặt vé đã hoàn tất hoặc xác nhận
    if (status === 'confirmed' || status === 'completed') {
      const totalAmount = parseFloat(totalTicketPrice) + parseFloat(totalFoodPrice);
      
      const invoice = {
        ticket_booking_id: bookingId,
        payment_method: faker.helpers.arrayElement(paymentMethods),
        payment_status: 'paid',
        amount: totalAmount,
        payment_date: status === 'completed' ? bookingDate : null,
        created_at: bookingDate,
        updated_at: bookingDate
      };
      
      // Thêm hóa đơn vào database
      await knex('invoices').insert(invoice);
    }
  }
  
  console.log('Đã tạo dữ liệu mẫu cho đặt vé, vé, đồ ăn và hóa đơn');
}; 