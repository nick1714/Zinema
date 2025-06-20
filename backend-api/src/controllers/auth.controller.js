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
        const { id: accountId, role } = req.user;
        const user = await authService.getUserInfoByAccountId(accountId, role);

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
 * Hoàn tất đăng ký với thông tin bổ sung
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function completeProfile(req, res, next) {
    try {
        const { temp_data, phone_number, full_name } = req.body;

        // Decode temp data
        const googleUser = JSON.parse(Buffer.from(temp_data, 'base64').toString());
        
        const additionalInfo = {
            phone_number,
            address,
            date_of_birth,
            full_name: full_name || googleUser.name
        };

        const result = await authService.completeGoogleRegistration(googleUser, additionalInfo);

        return res
            .status(201)
            .json(
                JSend.success({
                    account: result.user,
                    token: result.token,
                    message: 'Google registration completed successfully'
                })
            );
    } catch (error) {
        console.error('Complete profile error:', error);
        
        if (error.message === 'Phone number already exists') {
            return next(new ApiError(409, 'Phone number already exists'));
        }
        
        if (error.message.includes('Invalid')) {
            return next(new ApiError(400, 'Invalid temporary data'));
        }
        
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

module.exports = {
  registerEmployee,
  login,
  getEmployees,
  getCustomers,
  getCurrentUser,
  getRoles,
  initiateGoogleAuth,
  googleCallback,
  completeProfile
}; 