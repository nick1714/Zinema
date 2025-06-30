<script setup>
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

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

const validationSchema = toTypedSchema(
  z.object({
    phoneNumber: z.string().regex(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/, {
      message: 'Số điện thoại không hợp lệ',
    }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  }),
)

function submitLogin(values) {
  $emit('login', values)
}

function handleGoogleLogin() {
  $emit('google-login')
}
</script>

<template>
  <div class="auth-form">
    <div class="text-center mb-4">
      <h2 class="text-cinema-primary">
        <i class="fas fa-film me-2"></i>
        Cinema Login
      </h2>
    </div>

    <VeeForm :validation-schema="validationSchema" @submit="submitLogin">
      <div class="mb-3">
        <label class="form-label">Số điện thoại</label>
        <VeeField name="phoneNumber" v-slot="{ field }">
          <input type="text" class="form-control" placeholder="Nhập số điện thoại" v-bind="field" />
        </VeeField>
        <ErrorMessage name="phoneNumber" class="error-feedback" />
      </div>

      <div class="mb-4">
        <label class="form-label">Mật khẩu</label>
        <VeeField name="password" v-slot="{ field }">
          <input type="password" class="form-control" placeholder="Nhập mật khẩu" v-bind="field" />
        </VeeField>
        <ErrorMessage name="password" class="error-feedback" />
      </div>

      <button type="submit" class="btn btn-cinema-primary w-100 mb-3" :disabled="props.isLoading">
        <i class="fas fa-sign-in-alt me-2"></i>
        {{ props.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </VeeForm>

    <div v-if="props.showGoogleLogin" class="text-center">
      <div class="divider my-3">
        <span>hoặc</span>
      </div>

      <button type="button" class="btn btn-outline-danger w-100" @click="handleGoogleLogin">
        <i class="fab fa-google me-2"></i>
        Đăng nhập với Google
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.text-cinema-primary {
  color: #e50914;
}

.btn-cinema-primary {
  background-color: #e50914;
  border-color: #e50914;
  color: white;
}

.btn-cinema-primary:hover {
  background-color: #b8070f;
  border-color: #b8070f;
}

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
  background: #dee2e6;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #6c757d;
}

.error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
