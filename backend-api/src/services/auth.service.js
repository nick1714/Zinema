const bcrypt = require('bcrypt');
const knex = require('../database/knex');
const { ROLES } = require('../constants');
const { OAuth2Client } = require('google-auth-library');
const { generateToken } = require('../middlewares/auth.middleware');

// Số rounds để hash password
const SALT_ROUNDS = 10;

// OAuth2Client configuration
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Repository pattern cho các tables
 */
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
 * Helper function: Filter và transform dữ liệu employee từ request payload
 * @param {Object} payload - Raw data từ request body
 * @returns {Object} - Filtered data object cho database operations
 */
function readEmployeeData(payload) {
    return {
        ...(payload.email && { email: payload.email }),
        ...(payload.full_name && { full_name: payload.full_name }),
        ...(payload.phone_number && { phone_number: payload.phone_number }),
        ...(payload.date_of_birth && { date_of_birth: payload.date_of_birth }),
        ...(payload.address && { address: payload.address }),
        ...(payload.position && { position: payload.position }),
    };
}

/**
 * Helper function: Lấy thông tin user (customer/employee) bằng account_id
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

/**
 * Đăng ký tài khoản nhân viên mới
 * @param {Object} payload - Dữ liệu đăng ký từ request body
 * @returns {Promise<Object>} - Object chứa thông tin nhân viên vừa tạo
 */
async function registerEmployee(payload) {
    try {
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingAccount = await accountRepository()
            .where('phone_number', payload.phone_number)
            .first();
        
        if (existingAccount) {
            throw new Error('Phone number already exists');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);
        
        // Filter data cho employee
        const employeeData = readEmployeeData(payload);
        
        // Lấy role_id của STAFF
        const staffRole = await getRoleByName(ROLES.STAFF);
        
        // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
        const result = await knex.transaction(async (trx) => {
            // Tạo tài khoản
            const [accountId] = await accountRepository()
                .transacting(trx)
                .insert({
                    phone_number: payload.phone_number,
                    email: payload.email,
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
                    ...employeeData,
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
 * Đăng nhập người dùng
 * @param {String} phone_number - Số điện thoại đăng nhập
 * @param {String} password - Mật khẩu đăng nhập
 * @returns {Promise<Object>} - Object chứa thông tin đăng nhập và token
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
        
        // Tạo token với role
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
 * Lấy danh sách tất cả vai trò
 * @returns {Promise<Array>} - Danh sách vai trò
 */
async function getAllRoles() {
    try {
        const roles = await roleRepository()
            .select('*')
            .orderBy('id', 'asc');
        
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
 * Lấy danh sách tất cả nhân viên
 * @returns {Promise<Array>} - Danh sách nhân viên
 */
async function getAllEmployees() {
    try {
        const employees = await employeeRepository()
            .select('*')
            .orderBy('created_at', 'desc');
        
        return employees;
    } catch (error) {
        console.error('Get all employees error:', error);
        throw error;
    }
}

/**
 * Lấy danh sách tất cả khách hàng
 * @returns {Promise<Array>} - Danh sách khách hàng
 */
async function getAllCustomers() {
    try {
        const customers = await customerRepository()
            .select('*')
            .orderBy('created_at', 'desc');
        
        return customers;
    } catch (error) {
        console.error('Get all customers error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin chi tiết khách hàng theo ID
 * @param {Number} id - ID của khách hàng
 * @returns {Promise<Object|null>} - Thông tin khách hàng hoặc null nếu không tìm thấy
 */
async function getCustomerById(id) {
    try {
        const customer = await customerRepository()
            .where('id', id)
            .first();
        
        return customer;
    } catch (error) {
        console.error('Get customer by ID error:', error);
        throw error;
    }
}

/**
 * Lấy thông tin chi tiết nhân viên theo ID
 * @param {Number} id - ID của nhân viên
 * @returns {Promise<Object|null>} - Thông tin nhân viên hoặc null nếu không tìm thấy
 */
async function getEmployeeById(id) {
    try {
        const employee = await employeeRepository()
            .where('id', id)
            .first();
        
        return employee;
    } catch (error) {
        console.error('Get employee by ID error:', error);
        throw error;
    }
}

/**
 * Cập nhật thông tin khách hàng
 * @param {Number} id - ID của khách hàng
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object|null>} - Thông tin khách hàng sau khi cập nhật hoặc null nếu không tìm thấy
 */
async function updateCustomer(id, updateData) {
    try {
        const customer = await customerRepository()
            .where('id', id)
            .first();
        
        if (!customer) {
            return null;
        }

        // Lọc ra các trường hợp lệ và có giá trị từ updateData
        const allowedFields = ['full_name', 'phone_number', 'address', 'gender', 'date_of_birth'];
        const customerDataToUpdate = {};

        if (updateData) { // Đảm bảo updateData không phải là undefined/null
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    customerDataToUpdate[field] = updateData[field];
                }
            });
        }
        
        // Chỉ cập nhật nếu có dữ liệu thay đổi
        if (Object.keys(customerDataToUpdate).length > 0) {
            await customerRepository()
                .where('id', id)
                .update({
                    ...customerDataToUpdate,
                    updated_at: new Date()
                });
        }
        
        // Lấy lại dữ liệu mới từ database sau khi cập nhật
        const updatedCustomer = await customerRepository()
            .where('id', id)
            .first();
            
        return updatedCustomer;
    } catch (error) {
        console.error('Update customer error:', error);
        throw error;
    }
}

/**
 * Cập nhật thông tin nhân viên
 * @param {Number} id - ID của nhân viên
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object|null>} - Thông tin nhân viên sau khi cập nhật hoặc null nếu không tìm thấy
 */
async function updateEmployee(id, updateData) {
    try {
        const employee = await employeeRepository()
            .where('id', id)
            .first();
        
        if (!employee) {
            return null;
        }
        
        // Chỉ lấy các trường có trong updateData (được gửi từ client)
        const employeeData = {};
        
        // Kiểm tra từng trường có trong updateData hay không (bao gồm cả giá trị falsy)
        if (updateData.hasOwnProperty('email')) {
            employeeData.email = updateData.email;
        }
        if (updateData.hasOwnProperty('full_name')) {
            employeeData.full_name = updateData.full_name;
        }
        if (updateData.hasOwnProperty('phone_number')) {
            employeeData.phone_number = updateData.phone_number;
        }
        if (updateData.hasOwnProperty('date_of_birth')) {
            employeeData.date_of_birth = updateData.date_of_birth;
        }
        if (updateData.hasOwnProperty('address')) {
            employeeData.address = updateData.address;
        }
        if (updateData.hasOwnProperty('position')) {
            employeeData.position = updateData.position;
        }
        
        // Chỉ cập nhật nếu có dữ liệu thay đổi
        if (Object.keys(employeeData).length > 0) {
            await employeeRepository()
                .where('id', id)
                .update({
                    ...employeeData,
                    updated_at: new Date()
                });
            
            // Lấy lại dữ liệu mới từ database sau khi cập nhật
            const updatedEmployee = await employeeRepository()
                .where('id', id)
                .first();
            
            return updatedEmployee;
        }
        
        // Không có gì thay đổi, trả về dữ liệu hiện tại
        return employee;
    } catch (error) {
        console.error('Update employee error:', error);
        throw error;
    }
}

async function getGoogleAuthUrl() {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];
    
    console.log('DEBUG: Generating Google Auth URL');
    console.log('DEBUG: GOOGLE_REDIRECT_URI for URL generation:', process.env.GOOGLE_REDIRECT_URI);
    
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI, // Ensure this is set in .env
    });
    
    console.log('DEBUG: Generated Auth URL (without sensitive parts):', authorizeUrl.substring(0, 100) + '...');
    
    return authorizeUrl;
}

async function exchangeCodeForTokens(code) {
    try {
        console.log('DEBUG: Starting token exchange');
        console.log('DEBUG: Authorization code length:', code?.length);
        console.log('DEBUG: GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
        console.log('DEBUG: GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
        console.log('DEBUG: GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
        
        const { tokens } = await client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI, // Must match the one used in getGoogleAuthUrl
        });
        
        console.log('DEBUG: Token exchange successful');
        client.setCredentials(tokens);
        return tokens;
    } catch (error) {
        console.error('Failed to exchange authorization code for tokens:', error.message);
        console.error('Full error details:', error);
        throw new Error('Failed to authenticate with Google.');
    }
}

async function handleGoogleCallback(code) {
    try {
        console.log('DEBUG: handleGoogleCallback called with code length:', code?.length);
        
        const tokens = await exchangeCodeForTokens(code);
        const { id_token, access_token, refresh_token } = tokens;

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const {
            sub: googleId,
            email,
            name: fullName,
            picture: avatarUrl,
        } = payload;
        
        let account = await accountRepository().where({ google_id: googleId }).first();
        let user;
        let roleName;
        
        if (!account) {
            const customerRole = await getRoleByName(ROLES.CUSTOMER);
            await knex.transaction(async (trx) => {
                const [newAccountId] = await trx('accounts').insert({
                    email: email,
                    google_id: googleId,
                    role_id: customerRole.id,
                }).returning('id');
                
                account = { id: newAccountId.id, role_id: customerRole.id };
                
                const [newCustomerId] = await trx('customers').insert({
                    account_id: account.id,
                    full_name: fullName,
                }).returning('id');
                
                user = await trx('customers').where('id', newCustomerId.id).first();
            });
            roleName = ROLES.CUSTOMER;
        } else {
            const role = await getRoleById(account.role_id);
            roleName = role.name;
            user = await getUserInfoByAccountId(account.id, roleName);
        }
        
        const accessTokenJWT = generateToken({ 
            id: account.id, 
            role_id: account.role_id,
            phone_number: null, // Google users không có phone_number ban đầu
            role: roleName 
        });

        return {
            user: { ...user, role: roleName },
            token: accessTokenJWT,
        };
    } catch (error) {
        console.error('Google callback handling error:', error);
        throw error;
    }
}

module.exports = {
    registerEmployee,
    login,
    getAllRoles,
    getRoleById,
    getRoleByName,
    getAllEmployees,
    getAllCustomers,
    getCustomerById,
    getEmployeeById,
    updateCustomer,
    updateEmployee,
    getUserInfoByAccountId,
    getGoogleAuthUrl,
    handleGoogleCallback
}; 