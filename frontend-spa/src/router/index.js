import { createWebHistory, createRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Lazy loading cho performance
<<<<<<< HEAD
const LoginPage = () => import('@/views/LoginPage.vue');
const ProfilePage = () => import('@/views/ProfilePage.vue');
const EmployeeList = () => import('@/views/EmployeeList.vue');
const EmployeeAdd = () => import('@/views/EmployeeAdd.vue');
const EmployeeEdit = () => import('@/views/EmployeeEdit.vue');
const CustomerList = () => import('@/views/CustomerList.vue');
const CustomerEdit = () => import('@/views/CustomerEdit.vue');
const NotFound = () => import('@/views/NotFound.vue');
const ForbiddenPage = () => import('@/views/ForbiddenPage.vue');
const GoogleCallbackPage = () => import('@/views/GoogleCallbackPage.vue');
const AdminDashboard = () => import('@/views/AdminDashboard.vue');
const StaffDashboard = () => import('@/views/StaffDashboard.vue');
//const BookingPage = () => import('@/views/BookingPage.vue');
=======
const LoginPage = () => import('@/views/LoginPage.vue')
const ProfilePage = () => import('@/views/ProfilePage.vue')
const EmployeeList = () => import('@/views/EmployeeList.vue')
const EmployeeAdd = () => import('@/views/EmployeeAdd.vue')
const EmployeeEdit = () => import('@/views/EmployeeEdit.vue')
const CustomerList = () => import('@/views/CustomerList.vue')
const CustomerEdit = () => import('@/views/CustomerEdit.vue')
const NotFound = () => import('@/views/NotFound.vue')
const ForbiddenPage = () => import('@/views/ForbiddenPage.vue')
const GoogleCallbackPage = () => import('@/views/GoogleCallbackPage.vue')
const AdminDashboard = () => import('@/views/AdminDashboard.vue')
const StaffDashboard = () => import('@/views/StaffDashboard.vue')
>>>>>>> bc0670b85a5e7616578a7426b370d55face31393

// Movie Management
const AdminMovieList = () => import('@/views/AdminMovieList.vue')
const MovieAddPage = () => import('@/views/MovieAddPage.vue')
const MovieDetailPage = () => import('@/views/MovieDetailPage.vue')

const routes = [
  // Public routes
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/auth/google/callback',
    name: 'google.callback',
    component: GoogleCallbackPage,
  },

  // Booking Page (Customer/Staff/Admin)
  {
    path: '/movies/:movieId/book',
    name: 'movie.book',
    component: BookingPage,
    meta: { requiresAuth: true, roles: ['admin', 'staff', 'customer'] },
    props: true
  },

  // Protected routes
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },

  // Admin Dashboard (Admin/Employee main page)
  {
    path: '/admin',
    name: 'admin.dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] },
  },

  // Staff Dashboard (Staff only)
  {
    path: '/staff',
    name: 'staff.dashboard',
    component: StaffDashboard,
    meta: { requiresAuth: true, roles: ['staff'] },
  },

  // Employee Management (Admin only)
  {
    path: '/employees',
    name: 'employee.list',
    component: EmployeeList,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/employees/add',
    name: 'employee.add',
    component: EmployeeAdd,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/employees/:id',
    name: 'employee.detail',
    component: EmployeeEdit,
    meta: { requiresAuth: true, roles: ['admin'] },
    props: (route) => ({ employeeId: route.params.id }),
  },

  // Customer Management (Admin + Employee)
  {
    path: '/customers',
    name: 'customer.list',
    component: CustomerList,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] },
  },
  {
    path: '/customers/:id',
    name: 'customer.detail',
    component: CustomerEdit,
    meta: { requiresAuth: true },
    props: (route) => ({ customerId: route.params.id }),
  },

  // Movie Management (Admin + Employee)
  {
    path: '/admin/movies',
    name: 'admin.movies',
    component: AdminMovieList,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] },
  },
  {
    path: '/admin/movies/add',
    name: 'admin.movies.add',
    component: MovieAddPage,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] },
  },
  {
    path: '/admin/movies/:id',
    name: 'admin.movies.detail',
    component: MovieDetailPage,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] },
    props: (route) => ({ movieId: route.params.id }),
  },

  // Error pages
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, currentUser, userRole, suspense } = useAuth()

  // KHI REFRESH TRANG: Nếu có token, LUÔN ĐỢI lấy xong user data.
  // Đây là bước quan trọng nhất để chống race condition.
  if (isAuthenticated.value && !currentUser.value) {
    try {
      await suspense() // Đợi Promise của query `getCurrentUser` hoàn thành
    } catch (error) {
      // Nếu query lỗi (token hết hạn), logout() đã tự chạy trong onError của useAuth,
      // isAuthenticated sẽ tự chuyển thành false. Flow sẽ được xử lý đúng ở các bước sau.
    }
  }

  // Lấy lại trạng thái sau khi đã đợi (nếu có)
  const loggedIn = isAuthenticated.value
  const role = userRole.value

  // KIỂM TRA 1: Route yêu cầu đăng nhập
  if (to.meta.requiresAuth) {
    if (!loggedIn) {
      // Nếu chưa đăng nhập, chuyển về trang login
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
    // Nếu đã đăng nhập, kiểm tra quyền
    if (to.meta.roles && !to.meta.roles.includes(role)) {
      // Nếu không có quyền, báo lỗi
      return next({ name: 'forbidden' })
    }
  }

  // KIỂM TRA 2: Route chỉ dành cho khách (chưa đăng nhập)
  if (to.meta.requiresGuest && loggedIn) {
    // Nếu đã đăng nhập rồi thì không cho vào trang login nữa
    if (role === 'customer') {
      return next('/movies')
    } else if (role === 'admin') {
      return next('/admin')
    } else if (role === 'staff') {
      return next('/staff')
    }
    return next('/') // Fallback
  }

  // Nếu tất cả kiểm tra đều qua, cho phép truy cập
  return next()
})

export default router
