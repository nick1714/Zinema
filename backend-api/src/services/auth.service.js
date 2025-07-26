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
        const customersWithAccount = customers.map(customer => {
            const account = accounts.find(account => account.id === customer.account_id);
            return {
                ...customer,
                email: account ? account.email : null,
            };
        });
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
            email: account ? account.email : null,
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
 * Cập nhật thông tin khách hàng (có thể có hoặc không có account)
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

        // Lấy phone number hiện tại từ đúng source
        let currentPhoneNumber = customer.phone_number;
        if (customer.account_id) {
            const account = await accountRepository()
                .where('id', customer.account_id)
                .first();
            currentPhoneNumber = account?.phone_number || null;
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
            
            // Phone number handling
            if (updateData.hasOwnProperty('phone_number')) {
                
                // Chỉ validate nếu phone number thực sự thay đổi
                if (updateData.phone_number !== currentPhoneNumber) {
                    console.log('Phone number changed, validating uniqueness...');
                    
                    // CROSS-CHECK: Kiểm tra phone đã tồn tại trong cả 2 bảng
                    // 1. Kiểm tra trong accounts table
                    const existingAccount = await trx('accounts')
                        .where('phone_number', updateData.phone_number)
                        .whereNot('id', customer.account_id || 0) // Exclude current account if exists
                        .first();
                    
                    console.log('- existingAccount:', existingAccount?.id || 'none');
                    
                    // 2. Kiểm tra trong customers table
                    const existingCustomer = await trx('customers')
                        .where('phone_number', updateData.phone_number)
                        .whereNot('id', id)
                        .first();
                    
                    console.log('- existingCustomer:', existingCustomer?.id || 'none');
                    
                    // SPECIAL CASE: Merge với customer POS
                    if (existingCustomer && !existingCustomer.account_id && customer.account_id) {
                        console.log('Merging with POS customer...');
                        
                        // XÓA customer Google cũ TRƯỚC để tránh constraint violation
                        await trx('customers').where('id', id).delete();
                        
                        // Merge thông tin: cập nhật customer POS với account và data mới
                        await trx('customers')
                            .where('id', existingCustomer.id)
                            .update({
                                account_id: customer.account_id,
                                full_name: updateData.full_name || customer.full_name,
                                date_of_birth: updateData.date_of_birth || existingCustomer.date_of_birth,
                                gender: updateData.gender || existingCustomer.gender,
                                address: updateData.address || existingCustomer.address,
                                loyalty_points: (existingCustomer.loyalty_points || 0) + (customer.loyalty_points || 0),
                                updated_at: new Date()
                            });
                        
                        // Cập nhật phone trong accounts table
                        await trx('accounts')
                            .where('id', customer.account_id)
                            .update({
                                phone_number: updateData.phone_number,
                                updated_at: new Date()
                            });
                        
                        // Trả về customer đã merge
                        const mergedCustomer = await trx('customers').where('id', existingCustomer.id).first();
                        const account = await trx('accounts').where('id', customer.account_id).first();
                        
                        return {
                            ...mergedCustomer,
                            email: account.email,
                            phone_number: account.phone_number
                        };
                    } else if (existingAccount || existingCustomer) {
                        console.log('Phone number conflict detected!');
                        throw new Error('Phone number already exists');
                    }
                } else {
                    console.log('Phone number unchanged, skipping validation');
                }
                
                customerPayload.phone_number = updateData.phone_number;
                
                // Nếu customer có account, cập nhật phone trong accounts table
                if (customer.account_id) {
                    accountPayload.phone_number = updateData.phone_number;
                }
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
            
            // Update accounts table if there's data for it AND customer has account
            if (Object.keys(accountPayload).length > 0 && customer.account_id) {
                 await trx('accounts')
                    .where({ id: customer.account_id })
                    .update(accountPayload);
            }

            // Refetch the updated customer data
            const freshCustomer = await trx('customers').where({ id }).first();
            
            if (freshCustomer.account_id) {
                const freshAccount = await trx('accounts').where({ id: freshCustomer.account_id }).first();
                return {
                    ...freshCustomer,
                    email: freshAccount.email,
                    phone_number: freshAccount.phone_number // Use phone from account as source of truth
                };
            } else {
                // Customer không có account, chỉ trả về data từ bảng customers
                return freshCustomer;
            }
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
        let isFirstTime = false;
        
        if (!account) {
            isFirstTime = true;
            const customerRole = await getRoleByName(ROLES.CUSTOMER);
            
            await knex.transaction(async (trx) => {
                // Tạo account mới
                const [newAccountId] = await trx('accounts').insert({
                    email: email,
                    google_id: googleId,
                    role_id: customerRole.id,
                }).returning('id');
                
                account = { id: newAccountId.id, role_id: customerRole.id };
                
                // Tạo customer mới (không merge tự động vì không có thông tin SĐT từ Google)
                // Admin có thể merge thủ công sau này nếu cần
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
            phone_number: user.phone_number, // Sử dụng phone từ user data
            role: roleName 
        });

        return {
            user: { ...user, role: roleName },
            token: accessTokenJWT,
            isFirstTime,
        };
    } catch (error) {
        console.error('Google callback handling error:', error);
        throw error;
    }
}

/**
 * Kiểm tra khách hàng theo số điện thoại
 * @param {string} phoneNumber - Số điện thoại cần kiểm tra
 * @returns {Promise<Object|null>} - Thông tin khách hàng hoặc null nếu không tìm thấy
 */
async function checkCustomerByPhone(phoneNumber) {
    try {
        const customer = await customerRepository()
            .where('phone_number', phoneNumber)
            .first();

        return customer;
    } catch (error) {
        console.error('Check customer by phone error:', error);
        throw error;
    }
}

/**
 * Tạo khách hàng mới không có tài khoản (cho staff đặt vé tại quầy)
 * @param {Object} customerData - Dữ liệu khách hàng
 * @returns {Promise<Object>} - Thông tin khách hàng vừa tạo
 */
async function createCustomerWithoutAccount(customerData) {
    try {
        const { full_name, phone_number, date_of_birth, gender, address } = customerData;

        // CROSS-CHECK: Kiểm tra số điện thoại đã tồn tại trong cả 2 bảng
        // 1. Kiểm tra trong customers table
        const existingCustomer = await customerRepository()
            .where('phone_number', phone_number)
            .first();
            
        // 2. Kiểm tra trong accounts table
        const existingAccount = await accountRepository()
            .where('phone_number', phone_number)
            .first();

        if (existingCustomer || existingAccount) {
            throw new Error('Số điện thoại đã tồn tại');
        }

        // CHỈ tạo khách hàng mới, KHÔNG tạo account
        const [newCustomerId] = await customerRepository()
            .insert({
                account_id: null, // Không có account
                full_name,
                phone_number,
                date_of_birth: date_of_birth || null,
                gender: gender || 'other',
                address: address || null,
                loyalty_points: 0,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('id');

        // Lấy thông tin khách hàng vừa tạo
        const customer = await customerRepository()
            .where('id', newCustomerId.id || newCustomerId)
            .first();

        return customer;
    } catch (error) {
        console.error('Create customer without account error:', error);
        throw error;
    }
}

/**
 * Link số điện thoại với Google account (merge với customer POS nếu có)
 * @param {number} accountId - ID của Google account
 * @param {string} phoneNumber - Số điện thoại cần link
 * @returns {Promise<Object>} - Thông tin customer sau khi merge
 */
async function linkPhoneNumberToGoogleAccount(accountId, phoneNumber) {
    try {
        return await knex.transaction(async (trx) => {
            // Kiểm tra account hiện tại
            const account = await trx('accounts')
                .where('id', accountId)
                .whereNotNull('google_id')
                .first();
                
            if (!account) {
                throw new Error('Google account not found');
            }

            // Kiểm tra customer hiện tại của Google account
            const googleCustomer = await trx('customers')
                .where('account_id', accountId)
                .first();

            if (!googleCustomer) {
                throw new Error('Google customer not found');
            }

            // Kiểm tra xem có customer POS nào với SĐT này không
            const posCustomer = await trx('customers')
                .where('phone_number', phoneNumber)
                .whereNull('account_id')
                .first();

            if (posCustomer) {
                // Có customer POS -> merge
                console.log('Found POS customer, merging...');
                
                // Cập nhật customer POS với account_id và merge thông tin
                await trx('customers')
                    .where('id', posCustomer.id)
                    .update({
                        account_id: accountId,
                        full_name: googleCustomer.full_name, // Giữ tên từ Google
                        loyalty_points: (posCustomer.loyalty_points || 0) + (googleCustomer.loyalty_points || 0),
                        updated_at: new Date()
                    });

                // Cập nhật phone_number trong accounts
                await trx('accounts')
                    .where('id', accountId)
                    .update({
                        phone_number: phoneNumber,
                        updated_at: new Date()
                    });

                // Xóa customer Google cũ (không cần thiết nữa)
                await trx('customers')
                    .where('id', googleCustomer.id)
                    .delete();

                // Trả về customer đã merge
                return await trx('customers').where('id', posCustomer.id).first();
            } else {
                // Không có customer POS -> chỉ cập nhật SĐT
                console.log('No POS customer found, just updating phone number...');
                
                // CROSS-CHECK: Kiểm tra SĐT đã được sử dụng chưa trong cả 2 bảng
                const existingCustomerWithPhone = await trx('customers')
                    .where('phone_number', phoneNumber)
                    .first();
                    
                const existingAccountWithPhone = await trx('accounts')
                    .where('phone_number', phoneNumber)
                    .whereNot('id', accountId) // Exclude current account
                    .first();

                if (existingCustomerWithPhone || existingAccountWithPhone) {
                    throw new Error('Số điện thoại đã được sử dụng bởi khách hàng khác');
                }

                // Cập nhật SĐT cho customer hiện tại
                await trx('customers')
                    .where('id', googleCustomer.id)
                    .update({
                        phone_number: phoneNumber,
                        updated_at: new Date()
                    });

                // Cập nhật phone_number trong accounts
                await trx('accounts')
                    .where('id', accountId)
                    .update({
                        phone_number: phoneNumber,
                        updated_at: new Date()
                    });

                return await trx('customers').where('id', googleCustomer.id).first();
            }
        });
    } catch (error) {
        console.error('Link phone number to Google account error:', error);
        throw error;
    }
}

/**
 * Xóa nhân viên theo ID
 * @param {Number} id - ID của nhân viên cần xóa
 * @returns {Promise<void>}
 */
async function deleteEmployee(id) {
    try {
        // Kiểm tra nhân viên có tồn tại không
        const employee = await employeeRepository()
            .where('id', id)
            .first();

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Kiểm tra xem nhân viên có booking nào đang hoạt động không
        // (Có thể thêm logic kiểm tra booking nếu cần)
        // Note: Employee thường không tạo booking cho chính mình, nên có thể bỏ qua kiểm tra này
        // const hasActiveBookings = await knex('ticket_bookings')
        //     .where('customer_id', employee.account_id)
        //     .whereNot('status', 'cancelled')
        //     .first();

        // if (hasActiveBookings) {
        //     throw new Error('Cannot delete employee with active bookings');
        // }

        // Xóa nhân viên và tài khoản liên quan
        await knex.transaction(async (trx) => {
            // Xóa nhân viên
            await trx('employees')
                .where('id', id)
                .delete();

            // Xóa tài khoản liên quan
            await trx('accounts')
                .where('id', employee.account_id)
                .delete();
        });

    } catch (error) {
        console.error('Delete employee error:', error);
        throw error;
    }
}

/**
 * Xóa khách hàng theo ID
 * @param {Number} id - ID của khách hàng cần xóa
 * @returns {Promise<void>}
 */
async function deleteCustomer(id) {
    try {
        // Kiểm tra khách hàng có tồn tại không
        const customer = await customerRepository()
            .where('id', id)
            .first();

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Kiểm tra xem khách hàng có booking nào đang hoạt động không
        const hasActiveBookings = await knex('ticket_bookings')
            .where('customer_id', id)
            .whereNot('status', 'cancelled')
            .first();

        if (hasActiveBookings) {
            throw new Error('Cannot delete customer with active bookings');
        }

        // Xóa khách hàng và tài khoản liên quan
        await knex.transaction(async (trx) => {
            // Xóa khách hàng
            await trx('customers')
                .where('id', id)
                .delete();

            // Xóa tài khoản liên quan (nếu có)
            if (customer.account_id) {
                await trx('accounts')
                    .where('id', customer.account_id)
                    .delete();
            }
        });

    } catch (error) {
        console.error('Delete customer error:', error);
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
    deleteEmployee,
    deleteCustomer,
    getUserInfoByAccountId,
    getGoogleAuthUrl,
    handleGoogleCallback,
    changePassword,
    checkCustomerByPhone,
    createCustomerWithoutAccount,
    linkPhoneNumberToGoogleAccount
}; 