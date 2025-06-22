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
async function initiateGoogleAuth(req, res, next) {
    try {
        const authUrl = authService.getGoogleAuthURL();
        res.redirect(authUrl);
    } catch (error) {
        console.error('Initiate Google auth error:', error);
        return next(new ApiError(500, 'Failed to initiate Google authentication'));
    }
}

/**
 * Callback từ Google OAuth
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function googleCallback(req, res, next) {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
        }

        const result = await authService.handleGoogleAuth(code);

        // Cả new user và existing user đều trả về user + token
        return res.json(JSend.success({
            isNewUser: result.isNewUser,
            user: result.user,
            token: result.token,
            message: result.isNewUser ? 'Account created successfully!' : 'Login successful'
        }));
    } catch (error) {
        console.error('Google callback error:', error);
        return res.status(500).json(JSend.error(
            'Google authentication failed: ' + error.message
        ));
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

module.exports = {
  registerEmployee,
  login,
  getEmployees,
  getCustomers,
  getCustomerById,
  getEmployeeById,
  updateCustomer,
  updateEmployee,
  getCurrentUser,
  getRoles,
  initiateGoogleAuth,
  googleCallback
}; 