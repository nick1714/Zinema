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
    const employeeData = {};
    if (payload.hasOwnProperty('email')) employeeData.email = payload.email;
    if (payload.hasOwnProperty('full_name')) employeeData.full_name = payload.full_name;
    if (payload.hasOwnProperty('phone_number')) employeeData.phone_number = payload.phone_number;
    if (payload.hasOwnProperty('date_of_birth')) employeeData.date_of_birth = payload.date_of_birth;
    if (payload.hasOwnProperty('address')) employeeData.address = payload.address;
    if (payload.hasOwnProperty('gender')) employeeData.gender = payload.gender;
    if (payload.hasOwnProperty('position')) employeeData.position = payload.position;
    return employeeData;
}

/**
 * Helper function: Lấy thông tin user (customer/employee) bằng account_id
 * @param {Number} accountId - ID của tài khoản
 * @param {String} role - Vai trò của tài khoản
 * @returns {Promise<Object>} - Thông tin user
 */
async function getUserInfoByAccountId(accountId, role) {
    try {
        let userQuery;

        if (role === ROLES.CUSTOMER) {
            userQuery = customerRepository()
                .where('customers.account_id', accountId);
        } else if (role === ROLES.STAFF || role === ROLES.ADMIN) {
            userQuery = employeeRepository()
                .where('employees.account_id', accountId);
        } else {
            return null; // Role không hợp lệ
        }

        // Join với bảng accounts để lấy thông tin đầy đủ
        const userProfile = await userQuery
            .join('accounts', `${role === ROLES.CUSTOMER ? 'customers' : 'employees'}.account_id`, 'accounts.id')
            .select(
                `${role === ROLES.CUSTOMER ? 'customers' : 'employees'}.*`, // Lấy tất cả các trường từ bảng customer/employee
                'accounts.email',
                'accounts.google_id'
            )
            .first();
            
        return userProfile;

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
            // const employee = await employeeRepository()
            //     .transacting(trx)
            //     .where('id', employeeId.id)
            //     .first();
            
            // return {
            //     ...employee,
            //     account_id: accountId.id
            // };
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
        const accounts = await accountRepository()
            .select('*')
            .orderBy('created_at', 'desc');
        //const roles = await roleRepository()
        //    .select('*')
        //    .orderBy('created_at', 'desc');
        const customersWithAccount = customers.map(customer => ({
            ...customer,
            email: accounts.find(account => account.id === customer.account_id).email,
            //role: roles.find(role => role.id === customer.role_id)
        }));
        return customersWithAccount;
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
        const account = await accountRepository()
            .where('id', customer.account_id)
            .first();
        const customerWithAccount = {
            ...customer,
            email: account.email,
        };
        return customerWithAccount;
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

        // Use a transaction to ensure atomicity
        const updatedCustomerWithAccount = await knex.transaction(async (trx) => {
            const customerPayload = {};
            const accountPayload = {};

            // Separate payload for each table
            if (updateData.hasOwnProperty('full_name')) customerPayload.full_name = updateData.full_name;
            if (updateData.hasOwnProperty('address')) customerPayload.address = updateData.address;
            if (updateData.hasOwnProperty('date_of_birth')) customerPayload.date_of_birth = updateData.date_of_birth || null;
            if (updateData.hasOwnProperty('gender')) customerPayload.gender = updateData.gender;
            
            // Phone number goes to both tables for now due to messy schema
            if (updateData.hasOwnProperty('phone_number')) {
                // Check uniqueness in accounts table first
                const existingAccount = await trx('accounts')
                    .where('phone_number', updateData.phone_number)
                    .whereNot('id', customer.account_id)
                    .first();
                if (existingAccount) {
                    throw new Error('Phone number already exists');
                }
                customerPayload.phone_number = updateData.phone_number;
                accountPayload.phone_number = updateData.phone_number;
            }

            // Update customers table if there's data for it
            if (Object.keys(customerPayload).length > 0) {
                await trx('customers')
                    .where({ id })
                    .update({
                        ...customerPayload,
                        updated_at: new Date()
                    });
            }
            
            // Update accounts table if there's data for it
            if (Object.keys(accountPayload).length > 0) {
                 await trx('accounts')
                    .where({ id: customer.account_id })
                    .update(accountPayload);
            }

            // Refetch the updated customer data
            const freshCustomer = await trx('customers').where({ id }).first();
            const freshAccount = await trx('accounts').where({ id: freshCustomer.account_id }).first();

            return {
                ...freshCustomer,
                email: freshAccount.email, // Keep email from account
                phone_number: freshAccount.phone_number // Use phone from account as source of truth
            };
        });
            
        return updatedCustomerWithAccount;
    } catch (error) {
        console.error('Update customer error:', error);
        // Re-throw specific errors to be handled by controller
        if (error.message === 'Phone number already exists') {
            throw error;
        }
        throw new Error('Failed to update customer information.');
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
        if (updateData.hasOwnProperty('gender')) {
            employeeData.gender = updateData.gender;
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

/**
 * Đổi mật khẩu cho tài khoản hiện tại
 * @param {Number} accountId - ID của tài khoản
 * @param {String} currentPassword - Mật khẩu hiện tại
 * @param {String} newPassword - Mật khẩu mới
 * @returns {Promise<Boolean>} - Kết quả đổi mật khẩu
 */
async function changePassword(accountId, currentPassword, newPassword) {
    try {
        // Lấy thông tin tài khoản
        const account = await accountRepository()
            .where('id', accountId)
            .first();
        
        if (!account) {
            throw new Error('Account not found');
        }
        
        // Kiểm tra mật khẩu hiện tại
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.password);
        
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        
        // Hash mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        // Cập nhật mật khẩu
        await accountRepository()
            .where('id', accountId)
            .update({
                password: hashedNewPassword,
                updated_at: new Date()
            });
        
        return true;
    } catch (error) {
        console.error('Change password error:', error);
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
        prompt: 'select_account consent', // Force account selection and consent
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
        let isFirstTime = false; // Flag để indicate đây có phải lần đầu đăng ký không
        
        if (!account) {
            isFirstTime = true; // Đây là lần đầu đăng ký
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
            isFirstTime, // Thêm flag này vào response
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
    handleGoogleCallback,
    changePassword
}; 