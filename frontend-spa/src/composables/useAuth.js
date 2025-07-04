import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';
import { USER_ROLES } from '@/constants';

const AUTH_QUERY_KEY = 'auth';
const EMPLOYEES_QUERY_KEY = 'employees';
const CUSTOMERS_QUERY_KEY = 'customers';

// Global auth state
const isAuthenticated = ref(!!localStorage.getItem('cinema_token'));
const currentUser = ref(null);

/**
 * Composable cho authentication chính
 */
export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Get current user query
    const { data: userData, isLoading, error, suspense } = useQuery({
        queryKey: [AUTH_QUERY_KEY, 'currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: isAuthenticated,
        retry: 1,
        staleTime: 1000 * 60 * 5,
        onSuccess: (data) => {
            // data từ getCurrentUser là { user, role }
            currentUser.value = { ...data.user, role: data.role };
        },
        onError: () => {
            logout();
        }
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: ({ phoneNumber, password }) => authService.login(phoneNumber, password),
        onSuccess: (data) => {
            if (!data.token) {
                console.error('Login success but no token received from backend!');
                alert('Lỗi: Không nhận được token xác thực từ máy chủ.');
                return;
            }

            localStorage.setItem('cinema_token', data.token);
            isAuthenticated.value = true;
            
            // Hợp nhất dữ liệu user và role vào một object
            currentUser.value = { ...data.user, role: data.account?.role };
            
            // Redirect dựa trên role
            if (currentUser.value.role === USER_ROLES.CUSTOMER) {
                router.push('/movies');
            } else {
                router.push('/admin');
            }
            
            queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
        },
        onError: (error) => {
            console.error('Login error:', error);
            alert('Đăng nhập thất bại: ' + error.message);
        }
    });

    // Google auth callback
    const googleCallbackMutation = useMutation({
        mutationFn: (code) => authService.handleGoogleCallback(code),
        onSuccess: (data) => {
            localStorage.setItem('cinema_token', data.token);
            isAuthenticated.value = true;
            currentUser.value = data.user;
            
            // Customer từ Google luôn redirect đến movies
            router.push('/movies');
            queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
        },
        onError: (error) => {
            console.error('Google callback error:', error);
            alert('Xác thực với Google thất bại. Vui lòng thử lại từ trang đăng nhập.');
            // Quan trọng: Chuyển hướng người dùng ra khỏi trang callback bị lỗi
            router.push('/login');
        }
    });

    // Logout function
    function logout() {
        localStorage.removeItem('cinema_token');
        isAuthenticated.value = false;
        currentUser.value = null;
        queryClient.clear();
        router.push('/login');
    }

    // Permission helpers
    const userRole = computed(() => currentUser.value?.role);
    const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN);
    const isEmployee = computed(() => userRole.value === USER_ROLES.EMPLOYEE);
    const isCustomer = computed(() => userRole.value === USER_ROLES.CUSTOMER);
    const canManageEmployees = computed(() => isAdmin.value);
    const canManageCustomers = computed(() => isAdmin.value || isEmployee.value);

    function setCurrentUser(data) {
        currentUser.value = { ...currentUser.value, ...data };
    }

    return {
        // State
        isAuthenticated,
        currentUser: computed(() => currentUser.value),
        userRole: computed(() => currentUser.value?.role),
        isLoading,
        error,

        // Permissions
        isAdmin,
        isEmployee,
        isCustomer,
        canManageEmployees,
        canManageCustomers,

        // Actions
        login: loginMutation.mutate,
        googleLogin: authService.googleLogin,
        handleGoogleCallback: googleCallbackMutation.mutate,
        logout,
        setCurrentUser,
        suspense,

        // Mutation states
        isLoggingIn: loginMutation.isLoading
    };
}

/**
 * Composable cho employee management
 */
export function useEmployees() {
    const queryClient = useQueryClient();

    // Get all employees
    const { data: employeesData, ...employeesQuery } = useQuery({
        queryKey: [EMPLOYEES_QUERY_KEY],
        queryFn: authService.getAllEmployees
    });

    // Register employee mutation
    const registerEmployeeMutation = useMutation({
        mutationFn: authService.registerEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] });
        }
    });

    // Update employee mutation
    const updateEmployeeMutation = useMutation({
        mutationFn: ({ id, data }) => authService.updateEmployee(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] });
        }
    });

    return {
        employees: computed(() => employeesData.value?.employees || []),
        ...employeesQuery,
        registerEmployee: registerEmployeeMutation,
        updateEmployee: updateEmployeeMutation
    };
}

/**
 * Composable cho single employee
 */
export function useEmployee(employeeId) {
    return useQuery({
        queryKey: [EMPLOYEES_QUERY_KEY, { id: employeeId }],
        queryFn: () => authService.getEmployeeById(employeeId.value),
        enabled: computed(() => !!employeeId.value)
    });
}

/**
 * Composable cho customer management
 */
export function useCustomers() {
    const queryClient = useQueryClient();

    // Get all customers
    const { data: customersData, ...customersQuery } = useQuery({
        queryKey: [CUSTOMERS_QUERY_KEY],
        queryFn: authService.getAllCustomers
    });

    // Update customer mutation
    const updateCustomerMutation = useMutation({
        mutationFn: ({ id, data }) => authService.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY, 'currentUser'] });
        }
    });

    return {
        customers: computed(() => customersData.value?.customers || []),
        ...customersQuery,
        updateCustomer: updateCustomerMutation
    };
}

/**
 * Composable cho single customer
 */
export function useCustomer(customerId) {
    return useQuery({
        queryKey: [CUSTOMERS_QUERY_KEY, { id: customerId }],
        queryFn: () => authService.getCustomerById(customerId.value),
        enabled: computed(() => !!customerId.value)
    });
}

/**
 * Composable cho đổi mật khẩu
 */
export function usePasswordChange() {
    const queryClient = useQueryClient();

    const changePasswordMutation = useMutation({
        mutationFn: authService.changePassword,
        onSuccess: () => {
            // Có thể invalidate auth queries nếu cần
            queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
        }
    });

    return {
        changePassword: changePasswordMutation,
        isChangingPassword: changePasswordMutation.isLoading
    };
} 