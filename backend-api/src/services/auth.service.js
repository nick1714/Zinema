const bcrypt = require('bcrypt');
const knex = require('../database/knex');
const { ROLES } = require('../constants');
const { OAuth2Client } = require('google-auth-library');
const { generateToken } = require('../middlewares/auth.middleware');

// Số rounds để hash password
const SALT_ROUNDS = 10;

// Repository pattern
function roleRepository() {
    return knex('roles');
}

function accountRepository() {
    return knex('accounts');
}

function customerRepository() {
    return knex('customers');
}

function employeeRepository() {
    return knex('employees');
}

/**
 * Lấy danh sách tất cả vai trò
 * @returns {Promise<Array>} - Danh sách vai trò
 */
async function getAllRoles() {
    try {
        const roles = await roleRepository()
            .select('*');
        
        return roles;
    } catch (error) {
        console.error('Get all roles error:', error);
        throw error;
    }
}

/**
 * Lấy vai trò theo ID
 * @param {Number} id - ID của vai trò
 * @returns {Promise<Object>} - Thông tin vai trò
 */
async function getRoleById(id) {
    try {
        const role = await roleRepository()
            .where('id', id)
            .first();
        
        if (!role) {
            throw new Error('Role not found');
        }
        
        return role;
    } catch (error) {
        console.error('Get role by ID error:', error);
        throw error;
    }
}

/**
 * Lấy vai trò theo tên
 * @param {String} name - Tên vai trò
 * @returns {Promise<Object>} - Thông tin vai trò
 */
async function getRoleByName(name) {
    try {
        const role = await roleRepository()
            .where('name', name)
            .first();
        
        if (!role) {
            throw new Error('Role not found');
        }
        
        return role;
    } catch (error) {
        console.error('Get role by name error:', error);
        throw error;
    }
}


/**
 * Đăng ký tài khoản nhân viên
 * @param {Object} userData - Dữ liệu đăng ký
 * @returns {Promise<Object>} - Thông tin nhân viên đã tạo
 */
async function registerEmployee(userData) {
    try {
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingAccount = await accountRepository()
            .where('phone_number', userData.phone_number)
            .first();
        
        if (existingAccount) {
            throw new Error('Phone number already exists');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        
        // Loại bỏ password_confirm
        const { password_confirm, ...dataToSave } = userData;
        
        // Lấy role_id của STAFF
        const staffRole = await getRoleByName(ROLES.STAFF);
        
        // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
        const result = await knex.transaction(async (trx) => {
            // Tạo tài khoản
            const [accountId] = await accountRepository()
                .transacting(trx)
                .insert({
                    phone_number: dataToSave.phone_number,
                    password: hashedPassword,
                    role_id: staffRole.id,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('id');
            
            // Tạo thông tin nhân viên
            const [employeeId] = await employeeRepository()
                .transacting(trx)
                .insert({
                    email: dataToSave.email,
                    full_name: dataToSave.full_name,
                    date_of_birth: dataToSave.date_of_birth,
                    address: dataToSave.address,
                    phone_number: dataToSave.phone_number,
                    position: dataToSave.position,
                    account_id: accountId.id,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('id');
            
            // Lấy thông tin nhân viên vừa tạo
            const employee = await employeeRepository()
                .transacting(trx)
                .where('id', employeeId.id)
                .first();
            
            return {
                ...employee,
                account_id: accountId.id
            };
        });
        
        return result;
    } catch (error) {
        console.error('Register employee error:', error);
        throw error;
    }
}

/**
 * Đăng nhập
 * @param {String} phone_number - Số điện thoại đăng nhập
 * @param {String} password - Mật khẩu đăng nhập
 * @returns {Promise<Object>} - Thông tin đăng nhập và token
 */
async function login(phone_number, password) {
    try {
        // Tìm tài khoản theo số điện thoại
        const account = await accountRepository()
            .where('phone_number', phone_number)
            .first();
        
        if (!account) {
            throw new Error('Invalid credentials');
        }
        
        // So sánh password
        const isPasswordValid = await bcrypt.compare(password, account.password);
        
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        
        // Lấy thông tin vai trò
        const role = await getRoleById(account.role_id);
        
        // Lấy thông tin khách hàng hoặc nhân viên
        let userInfo = null;
        
        if (role.name === ROLES.CUSTOMER) {
            userInfo = await customerRepository()
                .where('account_id', account.id)
                .first();
        } else if (role.name === ROLES.STAFF || role.name === ROLES.ADMIN) {
            userInfo = await employeeRepository()
                .where('account_id', account.id)
                .first();
        }
        
        // Tạo token
        const tokenData = {
            ...account,
            role: role.name
        };
        
        const token = generateToken(tokenData);
        
        // Trả về thông tin đăng nhập và token
        return {
            account: {
                id: account.id,
                phone_number: account.phone_number,
                role: role.name
            },
            user: userInfo,
            token
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Lấy danh sách khách hàng
 * @returns {Promise<Array>} - Danh sách khách hàng
 */
async function getAllCustomers() {
    try {
        const customers = await customerRepository()
            .select('*');
        
        return customers;
    } catch (error) {
        console.error('Get all customers error:', error);
        throw error;
    }
}

/**
 * Lấy danh sách nhân viên
 * @returns {Promise<Array>} - Danh sách nhân viên
 */
async function getAllEmployees() {
    try {
        const employees = await employeeRepository()
            .select('*');
        
        return employees;
    } catch (error) {
        console.error('Get all employees error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin khách hàng theo ID
 * @param {Number} id - ID của khách hàng
 * @returns {Promise<Object>} - Thông tin khách hàng
 */
async function getCustomerById(id) {
    try {
        const customer = await customerRepository()
            .where('id', id)
            .first();
        
        if (!customer) {
            throw new Error('Customer not found');
        }
        
        return customer;
    } catch (error) {
        console.error('Get customer by ID error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin nhân viên theo ID
 * @param {Number} id - ID của nhân viên
 * @returns {Promise<Object>} - Thông tin nhân viên
 */
async function getEmployeeById(id) {
    try {
        const employee = await employeeRepository()
            .where('id', id)
            .first();
        
        if (!employee) {
            throw new Error('Employee not found');
        }
        
        return employee;
    } catch (error) {
        console.error('Get employee by ID error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin tài khoản theo ID
 * @param {Number} id - ID của tài khoản
 * @returns {Promise<Object>} - Thông tin tài khoản
 */
async function getAccountById(id) {
    try {
        const account = await accountRepository()
            .where('id', id)
            .select('id', 'phone_number', 'role_id')
            .first();
        
        if (!account) {
            throw new Error('Account not found');
        }
        
        return account;
    } catch (error) {
        console.error('Get account by ID error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin user (customer/employee) bằng account_id
 * @param {Number} accountId - ID của tài khoản
 * @param {String} role - Vai trò của tài khoản
 * @returns {Promise<Object>} - Thông tin user
 */
async function getUserInfoByAccountId(accountId, role) {
    try {
        let userInfo = null;
        if (role === ROLES.CUSTOMER) {
            userInfo = await customerRepository()
                .where('account_id', accountId)
                .first();
        } else if (role === ROLES.STAFF || role === ROLES.ADMIN) {
            userInfo = await employeeRepository()
                .where('account_id', accountId)
                .first();
        }
        return userInfo;
    } catch (error) {
        console.error(`Get user info by account id error:`, error);
        throw error;
    }
}

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

/**
 * Tạo URL để redirect đến Google OAuth
 */
function getGoogleAuthURL() {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
}

/**
 * Xác thực với Google và lấy thông tin user
 */
async function verifyGoogleToken(code) {
    try {
        const { tokens } = await client.getToken(code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        return {
            google_id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    } catch (error) {
        console.error('Google token verification error:', error);
        throw new Error('Invalid Google token');
    }
}

/**
 * Xử lý đăng nhập Google
 */
async function handleGoogleAuth(code) {
    try {
        console.log('DEBUG: Starting Google Auth with code:', code ? 'CODE_EXISTS' : 'NO_CODE');
        
        // Lấy thông tin từ Google
        const googleUser = await verifyGoogleToken(code);
        console.log('DEBUG: Google User info:', {
            google_id: googleUser.google_id,
            email: googleUser.email,
            name: googleUser.name
        });
        
        // Tìm user trong database
        const existingUser = await knex('accounts')
            .leftJoin('customers', 'accounts.id', 'customers.account_id')
            .leftJoin('roles', 'accounts.role_id', 'roles.id')
            .where('accounts.email', googleUser.email)
            .orWhere('accounts.google_id', googleUser.google_id)
            .select(
                'accounts.id',
                'accounts.email',
                'accounts.auth_provider',
                'roles.name as role',
                'customers.full_name',
                'customers.phone_number'
            )
            .first();
            
        console.log('DEBUG: Existing user found:', existingUser ? 'YES' : 'NO');

        if (existingUser) {
            // User đã tồn tại - đăng nhập luôn
            const tokenData = {
                id: existingUser.id,
                role_id: existingUser.role === 'customer' ? 3 : (existingUser.role === 'staff' ? 2 : 1),
                phone_number: existingUser.phone_number
            };
            const token = generateToken(tokenData);
            return {
                success: true,
                user: existingUser,
                token,
                isNewUser: false
            };
        } else {
            // User mới - tự động tạo account với thông tin từ Google
            const customerRole = await knex('roles')
                .where('name', ROLES.CUSTOMER)
                .first();

            // Tạo account mới với Google data
            const [newAccount] = await knex('accounts')
                .insert({
                    email: googleUser.email,
                    google_id: googleUser.google_id,
                    auth_provider: 'google',
                    role_id: customerRole.id,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('*');

            // Tạo customer record với placeholder phone
            await knex('customers')
                .insert({
                    account_id: newAccount.id,
                    full_name: googleUser.name,
                    phone_number: null, // Để NULL, user có thể update sau
                    created_at: new Date(),
                    updated_at: new Date()
                });

            // Lấy thông tin user đầy đủ
            const fullUser = await knex('accounts')
                .leftJoin('customers', 'accounts.id', 'customers.account_id')
                .leftJoin('roles', 'accounts.role_id', 'roles.id')
                .where('accounts.id', newAccount.id)
                .select(
                    'accounts.id',
                    'accounts.email',
                    'accounts.auth_provider',
                    'roles.name as role',
                    'customers.full_name',
                    'customers.phone_number'
                )
                .first();

            const tokenData = {
                id: fullUser.id,
                role_id: customerRole.id,
                phone_number: fullUser.phone_number
            };
            const token = generateToken(tokenData);

            return {
                success: true,
                user: fullUser,
                token,
                isNewUser: true,
                message: 'Account created successfully. You can update your phone number in profile.'
            };
        }
    } catch (error) {
        console.error('Google auth error:', error);
        throw error;
    }
}

/**
 * Hoàn tất đăng ký user mới từ Google
 */
async function completeGoogleRegistration(googleUser, additionalInfo) {
    try {
        // Kiểm tra phone_number đã được sử dụng chưa
        const existingPhone = await knex('customers')
            .where('phone_number', additionalInfo.phone_number)
            .first();

        if (existingPhone) {
            throw new Error('Phone number already exists');
        }

        // Lấy role customer
        const customerRole = await knex('roles')
            .where('name', ROLES.CUSTOMER)
            .first();

        // Tạo account mới
        const [newAccount] = await knex('accounts')
            .insert({
                email: googleUser.email,
                google_id: googleUser.google_id,
                auth_provider: 'google',
                role_id: customerRole.id,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');

        // Tạo customer record
        await knex('customers')
            .insert({
                account_id: newAccount.id,
                full_name: additionalInfo.full_name || googleUser.name,
                phone_number: additionalInfo.phone_number,
                created_at: new Date(),
                updated_at: new Date()
            });

        // Lấy thông tin user đầy đủ
        const fullUser = await knex('accounts')
            .leftJoin('customers', 'accounts.id', 'customers.account_id')
            .leftJoin('roles', 'accounts.role_id', 'roles.id')
            .where('accounts.id', newAccount.id)
            .select(
                'accounts.id',
                'accounts.email',
                'accounts.auth_provider',
                'roles.name as role',
                'customers.full_name',
                'customers.phone_number'
            )
            .first();

        const tokenData = {
            id: fullUser.id,
            role_id: customerRole.id,
            phone_number: fullUser.phone_number
        };
        const token = generateToken(tokenData);

        return {
            success: true,
            user: fullUser,
            token,
            isNewUser: true
        };
    } catch (error) {
        console.error('Complete Google registration error:', error);
        throw error;
    }
}

module.exports = {
    ROLES,
    registerEmployee,
    login,
    getAllRoles,
    getRoleById,
    getRoleByName,
    getAllCustomers,
    getAllEmployees,
    getCustomerById,
    getEmployeeById,
    getAccountById,
    getUserInfoByAccountId,
    getGoogleAuthURL,
    handleGoogleAuth,
    completeGoogleRegistration
}; 