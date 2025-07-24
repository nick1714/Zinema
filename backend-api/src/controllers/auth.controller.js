const authService = require('../services/auth.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

/**
 * Đăng ký tài khoản nhân viên
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function registerEmployee(req, res, next) {
  try {
    const userData = req.body;
    const employee = await authService.registerEmployee(userData);
    
    return res
      .status(201)
      .json(
        JSend.success({
          employee,
          message: 'Employee registered successfully'
        })
      );
  } catch (error) {
    console.error('Register employee error:', error);
    
    if (error.message === 'Phone number already exists') {
      return next(new ApiError(409, 'Phone number already exists'));
    }
    
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Đăng nhập
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function login(req, res, next) {
  try {
    const { phone_number, password } = req.body;
    
    const loginResult = await authService.login(phone_number, password);
    
    return res.json(
      JSend.success({
        ...loginResult,
        message: 'Login successful'
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return next(new ApiError(401, 'Invalid credentials'));
    }
    
    return next(new ApiError(500, 'Internal Server Error'));
  }
}


/**
 * Lấy danh sách nhân viên
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getEmployees(req, res, next) {
  try {
    const employees = await authService.getAllEmployees();
    
    return res.json(
      JSend.success({
        employees
      })
    );
  } catch (error) {
    console.error('Get employees error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Lấy danh sách khách hàng
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getCustomers(req, res, next) {
  try {
    const customers = await authService.getAllCustomers();
    
    return res.json(
      JSend.success({
        customers
      })
    );
  } catch (error) {
    console.error('Get customers error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Lấy thông tin người dùng đang đăng nhập
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getCurrentUser(req, res, next) {
    try {
        const { id: accountId, role_id } = req.user;
        
        // Debug: Log thông tin request
        console.log('DEBUG getCurrentUser:');
        console.log('- req.user:', req.user);
        console.log('- accountId:', accountId);
        console.log('- role_id:', role_id);
        
        // Lấy role từ token hoặc từ database
        let role = req.user.role; // Từ token
        if (!role) {
            // lấy role từ database nếu token cũ không có
            const roleInfo = await authService.getRoleById(role_id);
            role = roleInfo.name;
            console.log('- role from token:', role);
        }
        
        const user = await authService.getUserInfoByAccountId(accountId, role);
        //Debug 
        console.log('- user found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('- user data:', user);
        }

        if (!user) {
            return next(new ApiError(404, 'User profile not found.'));
        }

        res.json(JSend.success({ user, role }));
    } catch (error) {
        console.error('Get current user error:', error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Lấy danh sách vai trò
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getRoles(req, res, next) {
    try {
        const roles = await authService.getAllRoles();
        return res.json(JSend.success({ roles }));
    } catch (error) {
        console.error('Get roles error:', error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

/**
 * Khởi tạo Google OAuth - redirect đến Google
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getGoogleAuthUrl(req, res) {
    try {
        const url = await authService.getGoogleAuthUrl();
        res.status(200).json(JSend.success({ url }));
    } catch (error) {
        res.status(500).json(JSend.error({ message: 'Could not get Google auth URL.' }));
    }
}

/**
 * Callback từ Google OAuth, xử lý code từ frontend
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function googleCallback(req, res) {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json(JSend.fail({ code: 'Authorization code is missing.' }));
    }

    try {
        const { user, token, isFirstTime } = await authService.handleGoogleCallback(code);
        res.status(200).json(JSend.success({ user, token, isFirstTime }));
    } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json(JSend.error({ message: 'Google authentication failed.' }));
    }
}

/**
 * Lấy thông tin chi tiết khách hàng theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (isNaN(id) || parseInt(id) <= 0) {
      return next(new ApiError(400, 'Invalid ID format'));
    }
    
    const customer = await authService.getCustomerById(parseInt(id));
    
    if (!customer) {
      return next(new ApiError(404, 'Customer not found'));
    }
    
    res.json(JSend.success({ customer }));
  } catch (error) {
    console.error('Get customer by ID error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Lấy thông tin chi tiết nhân viên theo ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (isNaN(id) || parseInt(id) <= 0) {
      return next(new ApiError(400, 'Invalid ID format'));
    }
    
    const employee = await authService.getEmployeeById(parseInt(id));
    
    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }
    
    res.json(JSend.success({ employee }));
  } catch (error) {
    console.error('Get employee by ID error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Cập nhật thông tin khách hàng
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function updateCustomer(req, res, next) {
  try {
    const customerIdToUpdate = parseInt(req.params.id);
    const updateData = req.body.input;
    const loggedInUser = req.user;

    if (isNaN(customerIdToUpdate) || customerIdToUpdate <= 0) {
      return next(new ApiError(400, 'Invalid ID format'));
    }

    // --- KIỂM TRA QUYỀN SỞ HỮU ---
    // Nếu là CUSTOMER, chỉ cho phép họ cập nhật thông tin của chính mình
    if (loggedInUser.role === 'customer') {
      const customerProfile = await authService.getCustomerById(customerIdToUpdate);
      
      // So sánh account_id của profile khách hàng với id của người dùng trong token
      if (!customerProfile || customerProfile.account_id !== loggedInUser.id) {
        return next(new ApiError(403, 'Forbidden: You can only update your own profile.'));
      }
    }
    // --- KẾT THÚC KIỂM TRA ---
    
    const customer = await authService.updateCustomer(customerIdToUpdate, updateData);
    
    if (!customer) {
      return next(new ApiError(404, 'Customer not found'));
    }
    
    res.json(JSend.success({ customer }, 'Customer updated successfully'));
  } catch (error) {
    console.error('Update customer error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Cập nhật thông tin nhân viên
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body.input;
    
    if (isNaN(id) || parseInt(id) <= 0) {
      return next(new ApiError(400, 'Invalid ID format'));
    }
    
    const employee = await authService.updateEmployee(parseInt(id), updateData);
    
    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }
    
    res.json(JSend.success({ employee }, 'Employee updated successfully'));
  } catch (error) {
    console.error('Update employee error:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Đổi mật khẩu cho tài khoản hiện tại
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body.input;
    const accountId = req.user.id; // Lấy từ JWT token
    
    await authService.changePassword(accountId, current_password, new_password);
    
    return res.json(
      JSend.success({
        message: 'Password changed successfully'
      })
    );
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.message === 'Account not found') {
      return next(new ApiError(404, 'Account not found'));
    }
    
    if (error.message === 'Current password is incorrect') {
      return next(new ApiError(400, 'Current password is incorrect'));
    }
    
    return next(new ApiError(500, 'Internal Server Error'));
  }
}

/**
 * Kiểm tra khách hàng theo số điện thoại
 * @param {Object} req - Express request
 * @param {Object} res - Express response 
 * @param {Function} next - Express next middleware
 */
async function checkCustomerByPhone(req, res, next) {
  try {
    const { phone } = req.params;
    
    if (!phone || phone.trim().length === 0) {
      return next(new ApiError(400, 'Số điện thoại không được để trống'));
    }

    const customer = await authService.checkCustomerByPhone(phone.trim());
    
    if (customer) {
      return res.json(JSend.success({
        customer,
        exists: true,
        message: `Tìm thấy khách hàng: ${customer.full_name}`
      }));
    } else {
      return res.json(JSend.success({
        customer: null,
        exists: false,
        message: 'Không tìm thấy khách hàng với số điện thoại này'
      }));
    }
  } catch (error) {
    console.error('Check customer by phone error:', error);
    return next(new ApiError(500, 'Lỗi server khi kiểm tra khách hàng'));
  }
}

/**
 * Tạo khách hàng mới không có tài khoản
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createCustomerWithoutAccount(req, res, next) {
  try {
    const customerData = req.body.input || req.body;
    
    const newCustomer = await authService.createCustomerWithoutAccount(customerData);
    
    return res.status(201).json(JSend.success({
      customer: newCustomer,
      message: 'Tạo khách hàng mới thành công'
    }));
  } catch (error) {
    console.error('Create customer without account error:', error);
    
    if (error.message === 'Số điện thoại đã tồn tại') {
      return next(new ApiError(409, error.message));
    }
    
    return next(new ApiError(500, 'Lỗi server khi tạo khách hàng mới'));
  }
}


/**
 * Link số điện thoại với Google account (merge với customer POS nếu có)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function linkPhoneNumberToGoogleAccount(req, res, next) {
  try {
    const { phone_number } = req.body.input;
    const accountId = req.user.id; // Lấy từ JWT token
    
    if (!phone_number || phone_number.trim().length === 0) {
      return next(new ApiError(400, 'Số điện thoại không được để trống'));
    }

    const updatedCustomer = await authService.linkPhoneNumberToGoogleAccount(
      accountId, 
      phone_number.trim()
    );
    
    return res.json(JSend.success({
      customer: updatedCustomer,
      message: 'Link số điện thoại thành công'
    }));
  } catch (error) {
    console.error('Link phone number to Google account error:', error);
    
    if (error.message.includes('not found')) {
      return next(new ApiError(404, error.message));
    }
    
    if (error.message.includes('đã được sử dụng')) {
      return next(new ApiError(409, error.message));
    }
    
    return next(new ApiError(500, 'Lỗi khi link số điện thoại'));
  }
}

module.exports = {
  registerEmployee,
  login,
  getEmployees,
  getCustomers,
  getCurrentUser,
  getRoles,
  getGoogleAuthUrl,
  googleCallback,
  getCustomerById,
  getEmployeeById,
  updateCustomer,
  updateEmployee,
  changePassword,
  checkCustomerByPhone,
  createCustomerWithoutAccount,
  linkPhoneNumberToGoogleAccount
}; 