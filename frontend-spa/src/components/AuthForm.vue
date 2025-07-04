<script setup>
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

/**
 * Props component
 */
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  showGoogleLogin: {
    type: Boolean,
    default: false,
  },
})

const $emit = defineEmits(['login', 'google-login'])

/**
 * Validation schema cho form đăng nhập
 * - Số điện thoại: phải là số điện thoại hợp lệ ở Việt Nam
 * - Mật khẩu: tối thiểu 6 ký tự
 */
const validationSchema = toTypedSchema(
  z.object({
    phoneNumber: z.string().regex(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/, {
      message: 'Số điện thoại không hợp lệ',
    }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  }),
)

/**
 * Xử lý submit form đăng nhập
 * @param {Object} values - Giá trị từ form (số điện thoại và mật khẩu)
 */
function submitLogin(values) {
  $emit('login', values)
}

/**
 * Xử lý đăng nhập bằng Google
 */
function handleGoogleLogin() {
  $emit('google-login')
}
</script>

<template>
  <div class="auth-form">
    <!-- Form header -->
    <div class="auth-form-header">
      <div class="form-logo">
        <i class="fas fa-film"></i>
      </div>
      <h2 class="text-center">Đăng nhập</h2>
      <p class="text-center">Chào mừng trở lại với ZINEMA</p>
    </div>

    <!-- Form body -->
    <VeeForm :validation-schema="validationSchema" @submit="submitLogin" class="auth-form-body">
      <div class="form-group mb-4">
        <label class="form-label">
          <i class="fas fa-phone me-2"></i>
          Số điện thoại
        </label>
        <VeeField name="phoneNumber" v-slot="{ field, errorMessage }">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-user"></i></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Nhập số điện thoại" 
              v-bind="field" 
              :class="{ 'is-invalid': errorMessage }" 
            />
          </div>
        </VeeField>
        <ErrorMessage name="phoneNumber" class="error-feedback" />
      </div>

      <div class="form-group mb-4">
        <label class="form-label">
          <i class="fas fa-lock me-2"></i>
          Mật khẩu
        </label>
        <VeeField name="password" v-slot="{ field, errorMessage }">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-lock"></i></span>
            <input 
              type="password" 
              class="form-control" 
              placeholder="Nhập mật khẩu" 
              v-bind="field" 
              :class="{ 'is-invalid': errorMessage }" 
            />
          </div>
        </VeeField>
        <ErrorMessage name="password" class="error-feedback" />
      </div>

      <div class="form-check mb-4">
        <input type="checkbox" class="form-check-input" id="remember" />
        <label class="form-check-label" for="remember">Ghi nhớ đăng nhập</label>
      </div>

      <button type="submit" class="btn btn-cinema w-100 mb-3 login-btn" :disabled="props.isLoading">
        <span class="btn-content">
          <i class="fas fa-sign-in-alt me-2"></i>
          {{ props.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </span>
      </button>
    </VeeForm>

    <!-- Google login option -->
    <div v-if="props.showGoogleLogin" class="text-center auth-form-footer">
      <div class="divider mb-3">
        <span>hoặc</span>
      </div>

      <button type="button" class="btn btn-outline-cinema w-100 google-btn" @click="handleGoogleLogin">
        <i class="fab fa-google me-2"></i>
        Đăng nhập với Google
      </button>
      
      <div class="text-center mt-3">
        <a href="#" class="forgot-password">Quên mật khẩu?</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Form đăng nhập */
.auth-form {
  max-width: 400px;
  margin: auto;
  overflow: hidden;
  border-radius: 15px;
  background: rgba(13, 27, 42, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(247, 197, 72, 0.2);
  animation: fadeIn 0.5s ease-out;
}

/* Header form */
.auth-form-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.form-logo {
  width: 60px;
  height: 60px;
  background: var(--cinema-gradient-gold);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--cinema-darker);
  box-shadow: 0 5px 15px rgba(247, 197, 72, 0.3);
}

.auth-form-header h2 {
  color: var(--cinema-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.auth-form-header p {
  color: var(--cinema-text-muted);
  font-size: 0.9rem;
}

/* Body form */
.auth-form-body {
  padding: 1rem 2rem;
}

/* Form elements */
.form-label {
  color: var(--cinema-text);
  font-weight: 500;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  padding: 0.75rem;
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: var(--cinema-primary);
  color: var(--cinema-text);
  box-shadow: 0 0 0 0.25rem rgba(247, 197, 72, 0.25);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-group-text {
  background-color: rgba(247, 197, 72, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cinema-primary);
}

/* Checkbox */
.form-check-input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-check-input:checked {
  background-color: var(--cinema-primary);
  border-color: var(--cinema-primary);
}

.form-check-label {
  color: var(--cinema-text-muted);
  font-size: 0.9rem;
}

/* Button đăng nhập */
.login-btn {
  position: relative;
  padding: 0.75rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.btn-content {
  position: relative;
  z-index: 1;
}

/* Footer form */
.auth-form-footer {
  padding: 1rem 2rem 2rem;
}

/* Nút đăng nhập Google */
.google-btn {
  padding: 0.75rem;
  transition: all 0.3s ease;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  background: rgba(13, 27, 42, 0.8);
  padding: 0 1rem;
  color: var(--cinema-text-muted);
  position: relative;
  font-size: 0.9rem;
}

/* Link quên mật khẩu */
.forgot-password {
  color: var(--cinema-primary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: var(--cinema-secondary);
  text-decoration: underline;
}

/* Error messages */
.error-feedback {
  color: var(--cinema-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
