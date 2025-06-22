const knex = require('../database/knex');
const { ROLES } = require('../constants');

/**
 * Repository pattern cho các bảng liên quan đến booking
 */
function ticketBookingRepository() {
    return knex('ticket_bookings');
}

function ticketRepository() {
    return knex('tickets');
}

function foodOrderRepository() {
    return knex('food_orders');
}

function invoiceRepository() {
    return knex('invoices');
}

function showtimeRepository() {
    return knex('showtimes');
}

function seatRepository() {
    return knex('seats');
}

function customerRepository() {
    return knex('customers');
}

/**
 * Helper function: Tạo mã booking duy nhất
 * @returns {string} - Mã booking dạng BK20241201001
 */
function generateBookingCode() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.getTime().toString().slice(-3); // 3 số cuối của timestamp
    return `BK${dateStr}${timeStr}`;
}

/**
 * Helper function: Kiểm tra quyền truy cập booking
 * @param {Object} user - Thông tin user từ token
 * @param {Object} booking - Thông tin booking
 * @returns {boolean} - True nếu user có quyền truy cập
 */
function canAccessBooking(user, booking) {
    // Admin và Staff có thể truy cập tất cả
    if (user.role === ROLES.ADMIN || user.role === ROLES.STAFF) {
        return true;
    }
    
    // Customer chỉ có thể truy cập booking của mình
    if (user.role === ROLES.CUSTOMER) {
        return booking.customer_id === user.id;
    }
    
    return false;
}

/**
 * Lấy danh sách tất cả bookings với phân trang và lọc
 * @param {Object} queryParams - Tham số query
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<Object>} - Danh sách bookings và metadata
 */
async function getAllBookings(queryParams, user) {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            customer_id,
            showtime_id,
            booking_date
        } = queryParams;

        let query = ticketBookingRepository()
            .leftJoin('customers', 'ticket_bookings.customer_id', 'customers.id')
            .leftJoin('showtimes', 'ticket_bookings.showtime_id', 'showtimes.id')
            .leftJoin('movies', 'showtimes.movie_id', 'movies.id')
            .leftJoin('cinema_rooms', 'showtimes.cinema_room_id', 'cinema_rooms.id')
            .select(
                'ticket_bookings.*',
                'customers.full_name as customer_name',
                'customers.phone_number as customer_phone',
                'movies.title as movie_title',
                'cinema_rooms.name as room_name',
                'showtimes.start_time',
                'showtimes.end_time'
            );

        // Phân quyền: Customer chỉ xem được booking của mình
        if (user.role === ROLES.CUSTOMER) {
            query = query.where('ticket_bookings.customer_id', user.id);
        }

        // Áp dụng các filter
        if (status) {
            query = query.where('ticket_bookings.status', status);
        }

        if (customer_id && (user.role === ROLES.ADMIN || user.role === ROLES.STAFF)) {
            query = query.where('ticket_bookings.customer_id', customer_id);
        }

        if (showtime_id) {
            query = query.where('ticket_bookings.showtime_id', showtime_id);
        }

        if (booking_date) {
            query = query.whereRaw('DATE(ticket_bookings.created_at) = ?', [booking_date]);
        }

        // Đếm tổng số bản ghi - tạo query riêng cho count
        let countQuery = ticketBookingRepository()
            .leftJoin('customers', 'ticket_bookings.customer_id', 'customers.id')
            .leftJoin('showtimes', 'ticket_bookings.showtime_id', 'showtimes.id')
            .leftJoin('movies', 'showtimes.movie_id', 'movies.id')
            .leftJoin('cinema_rooms', 'showtimes.cinema_room_id', 'cinema_rooms.id');

        // Áp dụng cùng các filter cho count query
        if (user.role === ROLES.CUSTOMER) {
            countQuery = countQuery.where('ticket_bookings.customer_id', user.id);
        }

        if (status) {
            countQuery = countQuery.where('ticket_bookings.status', status);
        }

        if (customer_id && (user.role === ROLES.ADMIN || user.role === ROLES.STAFF)) {
            countQuery = countQuery.where('ticket_bookings.customer_id', customer_id);
        }

        if (showtime_id) {
            countQuery = countQuery.where('ticket_bookings.showtime_id', showtime_id);
        }

        if (booking_date) {
            countQuery = countQuery.whereRaw('DATE(ticket_bookings.created_at) = ?', [booking_date]);
        }

        const totalResult = await countQuery.count('ticket_bookings.id as count').first();
        const totalRecords = parseInt(totalResult.count);

        // Phân trang
        const offset = (page - 1) * limit;
        const bookings = await query
            .orderBy('ticket_bookings.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            bookings,
            metadata: {
                totalRecords,
                firstPage: 1,
                lastPage: Math.ceil(totalRecords / limit),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Get all bookings error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin chi tiết booking theo ID
 * @param {number} id - ID của booking
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<Object|null>} - Thông tin booking hoặc null nếu không tìm thấy
 */
async function getBookingById(id, user) {
    try {
        const booking = await ticketBookingRepository()
            .leftJoin('customers', 'ticket_bookings.customer_id', 'customers.id')
            .leftJoin('showtimes', 'ticket_bookings.showtime_id', 'showtimes.id')
            .leftJoin('movies', 'showtimes.movie_id', 'movies.id')
            .leftJoin('cinema_rooms', 'showtimes.cinema_room_id', 'cinema_rooms.id')
            .where('ticket_bookings.id', id)
            .select(
                'ticket_bookings.*',
                'customers.full_name as customer_name',
                'customers.phone_number as customer_phone',
                'movies.title as movie_title',
                'movies.duration_min as movie_duration',
                'movies.age_rating as movie_rating',
                'cinema_rooms.name as room_name',
                'showtimes.start_time',
                'showtimes.end_time',
                'showtimes.price as base_price'
            )
            .first();

        if (!booking) {
            return null;
        }

        // Kiểm tra quyền truy cập
        if (!canAccessBooking(user, booking)) {
            return null;
        }

        // Lấy thông tin vé (tickets)
        const tickets = await ticketRepository()
            .leftJoin('seats', 'tickets.seat_id', 'seats.id')
            .leftJoin('seat_types', 'seats.seat_type_id', 'seat_types.id')
            .where('tickets.ticket_booking_id', id)
            .select(
                'tickets.*',
                'seats.row',
                'seats.column',
                'seats.name as seat_name',
                'seat_types.name as seat_type_name',
                'seat_types.price as seat_type_price'
            );

        // Lấy thông tin đồ ăn (food orders)
        const foodOrders = await foodOrderRepository()
            .leftJoin('foods', 'food_orders.food_id', 'foods.id')
            .where('food_orders.ticket_booking_id', id)
            .select(
                'food_orders.*',
                'foods.name as food_name',
                'foods.price as food_unit_price'
            );

        // Lấy thông tin hóa đơn
        const invoice = await invoiceRepository()
            .where('ticket_booking_id', id)
            .first();

        return {
            ...booking,
            tickets,
            food_orders: foodOrders,
            invoice
        };
    } catch (error) {
        console.error('Get booking by ID error:', error);
        throw error;
    }
}

/**
 * Cập nhật trạng thái booking
 * @param {number} id - ID của booking
 * @param {Object} updateData - Dữ liệu cập nhật
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<Object|null>} - Booking sau khi cập nhật hoặc null
 */
async function updateBooking(id, updateData, user) {
    try {
        // Kiểm tra booking có tồn tại và quyền truy cập
        const existingBooking = await getBookingById(id, user);
        if (!existingBooking) {
            return null;
        }

        // Lọc ra các trường được phép cập nhật trong ticket_bookings
        const allowedBookingFields = ['status'];
        const bookingUpdate = {};
        
        if (updateData.status !== undefined) {
            bookingUpdate.status = updateData.status;
        }

        // Lọc ra các trường được phép cập nhật trong invoices
        const allowedInvoiceFields = ['payment_method', 'payment_status'];
        const invoiceUpdate = {};
        
        if (updateData.payment_method !== undefined) {
            invoiceUpdate.payment_method = updateData.payment_method;
        }
        
        if (updateData.payment_status !== undefined) {
            invoiceUpdate.payment_status = updateData.payment_status;
            if (updateData.payment_status === 'paid') {
                invoiceUpdate.payment_date = new Date();
            }
        }

        // Cập nhật trong transaction
        await knex.transaction(async (trx) => {
            // Cập nhật booking nếu có thay đổi
            if (Object.keys(bookingUpdate).length > 0) {
                await ticketBookingRepository()
                    .transacting(trx)
                    .where('id', id)
                    .update({
                        ...bookingUpdate,
                        updated_at: new Date()
                    });
            }

            // Cập nhật invoice nếu có thay đổi
            if (Object.keys(invoiceUpdate).length > 0) {
                await invoiceRepository()
                    .transacting(trx)
                    .where('ticket_booking_id', id)
                    .update({
                        ...invoiceUpdate,
                        updated_at: new Date()
                    });
            }
        });

        // Lấy lại dữ liệu mới
        return await getBookingById(id, user);
    } catch (error) {
        console.error('Update booking error:', error);
        throw error;
    }
}

/**
 * Xóa booking (chỉ admin)
 * @param {number} id - ID của booking
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<boolean>} - True nếu xóa thành công
 */
async function deleteBooking(id, user) {
    try {
        // Chỉ admin mới được xóa
        if (user.role !== ROLES.ADMIN) {
            return false;
        }

        const booking = await ticketBookingRepository()
            .where('id', id)
            .first();

        if (!booking) {
            return false;
        }

        // Xóa trong transaction để đảm bảo tính toàn vẹn
        await knex.transaction(async (trx) => {
            // Xóa food orders
            await foodOrderRepository()
                .transacting(trx)
                .where('ticket_booking_id', id)
                .del();

            // Xóa tickets
            await ticketRepository()
                .transacting(trx)
                .where('ticket_booking_id', id)
                .del();

            // Xóa invoice nếu có
            await invoiceRepository()
                .transacting(trx)
                .where('ticket_booking_id', id)
                .del();

            // Xóa booking
            await ticketBookingRepository()
                .transacting(trx)
                .where('id', id)
                .del();
        });

        return true;
    } catch (error) {
        console.error('Delete booking error:', error);
        throw error;
    }
}

/**
 * Tạo booking mới
 * @param {Object} bookingData - Dữ liệu booking
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<Object>} - Booking mới được tạo
 */
async function createBooking(bookingData, user) {
    try {
        const {
            showtime_id,
            seats: seatIds,
            food_items = [],
            customer_phone
        } = bookingData;

        console.log('Create booking request:', {
            showtimeId: showtime_id,
            seatIds,
            foodItems: food_items,
            userId: user.id,
            userRole: user.role,
            customerPhone: customer_phone
        });

        // Validate showtime exists và chưa bắt đầu
        const showtime = await showtimeRepository()
            .leftJoin('movies', 'showtimes.movie_id', 'movies.id')
            .leftJoin('cinema_rooms', 'showtimes.cinema_room_id', 'cinema_rooms.id')
            .where('showtimes.id', showtime_id)
            .select(
                'showtimes.*',
                'movies.title as movie_title',
                'cinema_rooms.name as room_name'
            )
            .first();

        if (!showtime) {
            throw new Error('Suất chiếu không tồn tại');
        }

        const now = new Date();
        if (new Date(showtime.start_time) <= now) {
            throw new Error('Không thể đặt vé cho suất chiếu đã bắt đầu');
        }

        // Kiểm tra ghế đã được đặt chưa
        const bookedSeats = await ticketRepository()
            .leftJoin('ticket_bookings', 'tickets.ticket_booking_id', 'ticket_bookings.id')
            .whereIn('tickets.seat_id', seatIds)
            .where('ticket_bookings.showtime_id', showtime_id)
            .whereIn('ticket_bookings.status', ['pending', 'confirmed'])
            .select('tickets.seat_id');

        if (bookedSeats.length > 0) {
            const bookedSeatIds = bookedSeats.map(seat => seat.seat_id);
            throw new Error(`Một số ghế đã được đặt: ${bookedSeatIds.join(', ')}`);
        }

        // Xác định customer_id
        let customerId = user.id;
        
        // Nếu là staff đặt hộ khách hàng
        if ((user.role === ROLES.STAFF || user.role === ROLES.ADMIN) && customer_phone) {
            const customer = await customerRepository()
                .where('phone_number', customer_phone)
                .first();
            
            if (!customer) {
                throw new Error(`Không tìm thấy khách hàng với số điện thoại ${customer_phone}`);
            }
            
            customerId = customer.id;
        }

        // Validate seats và tính toán giá
        const seats = await seatRepository()
            .leftJoin('seat_types', 'seats.seat_type_id', 'seat_types.id')
            .whereIn('seats.id', seatIds)
            .select(
                'seats.*',
                'seat_types.name as seat_type_name',
                'seat_types.price as seat_type_price'
            );

        if (seats.length !== seatIds.length) {
            throw new Error('Một số ghế không tồn tại');
        }

        // Tính tổng tiền vé - sử dụng giá base của showtime
        const ticketTotal = seats.reduce((total, seat) => {
            return total + parseFloat(showtime.price);
        }, 0);

        // Validate và tính tiền đồ ăn
        let foodTotal = 0;
        let validatedFoodItems = [];
        
        if (food_items && food_items.length > 0) {
            const foodIds = food_items.map(item => item.food_id);
            const foods = await knex('foods')
                .whereIn('id', foodIds)
                .where('is_available', true)
                .select('*');

            for (const item of food_items) {
                const food = foods.find(f => f.id === item.food_id);
                if (!food) {
                    throw new Error(`Đồ ăn ID ${item.food_id} không tồn tại hoặc không khả dụng`);
                }
                
                const itemTotal = parseFloat(food.price) * item.quantity;
                foodTotal += itemTotal;
                
                validatedFoodItems.push({
                    food_id: item.food_id,
                    quantity: item.quantity,
                    unit_price: parseFloat(food.price),
                    total_price: itemTotal
                });
            }
        }

        const totalAmount = ticketTotal + foodTotal;

        // Tạo booking trong transaction
        const result = await knex.transaction(async (trx) => {
            // 1. Tạo ticket_booking
            const [bookingId] = await ticketBookingRepository()
                .transacting(trx)
                .insert({
                    customer_id: customerId,
                    showtime_id: showtime_id,
                    booking_date: new Date(),
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('id');

            // 2. Tạo tickets
            const ticketInserts = seats.map(seat => ({
                ticket_booking_id: bookingId.id,
                seat_id: seat.id,
                price: parseFloat(showtime.price),
                created_at: new Date()
            }));

            await ticketRepository()
                .transacting(trx)
                .insert(ticketInserts);

            // 3. Tạo food orders (nếu có)
            if (validatedFoodItems.length > 0) {
                const foodOrderInserts = validatedFoodItems.map(item => ({
                    ticket_booking_id: bookingId.id,
                    food_id: item.food_id,
                    quantity: item.quantity,
                    price: item.total_price,
                    created_at: new Date(),
                    updated_at: new Date()
                }));

                await foodOrderRepository()
                    .transacting(trx)
                    .insert(foodOrderInserts);
            }

            // 4. Tạo invoice
            await invoiceRepository()
                .transacting(trx)
                .insert({
                    ticket_booking_id: bookingId.id,
                    payment_method: 'cash',
                    payment_status: 'pending',
                    amount: totalAmount,
                    created_at: new Date(),
                    updated_at: new Date()
                });

            return bookingId.id;
        });

        console.log('Booking created successfully:', {
            bookingId: result,
            customerId,
            totalAmount
        });

        // Lấy thông tin booking vừa tạo
        const newBooking = await getBookingById(result, user);
        
        return newBooking;
    } catch (error) {
        console.error('Create booking error:', error);
        throw error;
    }
}

/**
 * Confirm booking và thanh toán
 * @param {number} bookingId - ID của booking
 * @param {Object} confirmData - Dữ liệu xác nhận
 * @param {Object} user - Thông tin user từ token
 * @returns {Promise<Object|null>} - Booking sau khi confirm
 */
async function confirmBooking(bookingId, confirmData, user) {
    try {
        const { payment_method, payment_details = {} } = confirmData;

        console.log('Confirm booking request:', {
            bookingId,
            paymentMethod: payment_method,
            userId: user.id
        });

        // Lấy booking hiện tại
        const booking = await getBookingById(bookingId, user);
        if (!booking) {
            return null;
        }

        if (booking.status !== 'pending') {
            throw new Error('Chỉ có thể xác nhận booking đang ở trạng thái pending');
        }

        // Cập nhật booking và invoice trong transaction
        await knex.transaction(async (trx) => {
            // Cập nhật booking
            await ticketBookingRepository()
                .transacting(trx)
                .where('id', bookingId)
                .update({
                    status: 'confirmed',
                    updated_at: new Date()
                });

            // Cập nhật invoice
            await invoiceRepository()
                .transacting(trx)
                .where('ticket_booking_id', bookingId)
                .update({
                    payment_method: payment_method,
                    payment_status: 'paid',
                    payment_date: new Date(),
                    updated_at: new Date()
                });
        });

        console.log('Booking confirmed successfully:', { bookingId });

        // Lấy lại thông tin booking đã cập nhật
        return await getBookingById(bookingId, user);
    } catch (error) {
        console.error('Confirm booking error:', error);
        throw error;
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    confirmBooking,
    updateBooking,
    deleteBooking,
    generateBookingCode,
    canAccessBooking
}; 