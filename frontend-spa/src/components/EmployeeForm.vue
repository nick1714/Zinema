<script setup>
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const baseSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  phone_number: z
    .string()
    .regex(/(01|02|03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().max(200, 'Địa chỉ tối đa 200 ký tự').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  gender: z
    .enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' }),
    })
    .optional(),
  position: z
    .enum(['Nhân viên bán vé', 'Nhân viên vệ sinh'], {
      errorMap: () => ({ message: 'Vị trí phải là Nhân viên bán vé hoặc Nhân viên vệ sinh' }),
    })
    .optional(),
})

const addModeSchema = baseSchema
  .extend({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['password_confirm'],
  })

const validationSchema = toTypedSchema(props.isEditMode ? baseSchema : addModeSchema)

function handleSubmit(values) {
  const payload = { ...values }
  // Convert empty strings to null for optional DB fields
  Object.keys(payload).forEach((key) => {
    if (payload[key] === '') {
      payload[key] = null
    }
  })
  emit('submit', payload)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <VeeForm
    as="form"
    class="employee-form"
    :validation-schema="validationSchema"
    :initial-values="initialValues"
    @submit="handleSubmit"
  >
    <div class="form-row">
      <div class="form-group">
        <label for="full_name">Tên <span class="required">*</span></label>
        <VeeField name="full_name" id="full_name" type="text" placeholder="Nhập họ và tên" />
        <ErrorMessage name="full_name" class="error-message" />
      </div>

      <div class="form-group">
        <label for="phone_number">Số điện thoại <span class="required">*</span></label>
        <VeeField
          name="phone_number"
          id="phone_number"
          type="text"
          placeholder="Nhập số điện thoại"
        />
        <ErrorMessage name="phone_number" class="error-message" />
      </div>
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <VeeField name="email" id="email" type="email" placeholder="Nhập địa chỉ email" />
      <ErrorMessage name="email" class="error-message" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="date_of_birth">Ngày sinh</label>
        <VeeField name="date_of_birth" id="date_of_birth" type="date" />
        <ErrorMessage name="date_of_birth" class="error-message" />
      </div>

      <div class="form-group">
        <label for="gender">Giới tính</label>
        <VeeField name="gender" id="gender" as="select">
          <option value="" disabled>Chọn giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </VeeField>
        <ErrorMessage name="gender" class="error-message" />
      </div>
    </div>

    <div class="form-group">
      <label for="position">Vị trí</label>
      <VeeField name="position" id="position" as="select">
        <option value="" disabled>Chọn vị trí</option>
        <option value="Nhân viên bán vé">Nhân viên bán vé</option>
        <option value="Nhân viên vệ sinh">Nhân viên vệ sinh</option>
      </VeeField>
      <ErrorMessage name="position" class="error-message" />
    </div>

    <div class="form-group">
      <label for="address">Địa chỉ</label>
      <VeeField name="address" id="address" as="textarea" rows="3" placeholder="Nhập địa chỉ" />
      <ErrorMessage name="address" class="error-message" />
    </div>

    <template v-if="!isEditMode">
      <div class="form-row">
        <div class="form-group">
          <label for="password">Mật khẩu <span class="required">*</span></label>
          <VeeField name="password" id="password" type="password" placeholder="Nhập mật khẩu" />
          <ErrorMessage name="password" class="error-message" />
        </div>

        <div class="form-group">
          <label for="password_confirm">Xác nhận mật khẩu <span class="required">*</span></label>
          <VeeField
            name="password_confirm"
            id="password_confirm"
            type="password"
            placeholder="Xác nhận lại mật khẩu"
          />
          <ErrorMessage name="password_confirm" class="error-message" />
        </div>
      </div>
    </template>

    <div class="form-actions">
      <button type="submit" class="btn-save" :disabled="isLoading">
        <i class="fas fa-save"></i>
        <span v-if="isEditMode">{{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
        <span v-else>{{ isLoading ? 'Đang tạo...' : 'Tạo nhân viên' }}</span>
      </button>
      <button type="button" class="btn-cancel" @click="handleCancel">
        <i class="fas fa-times"></i>
        <span>Hủy</span>
      </button>
    </div>
  </VeeForm>
</template>

<style scoped>
.employee-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--cinema-text-muted);
  font-size: 0.9rem;
}

.required {
  color: var(--cinema-secondary);
  margin-left: 0.25rem;
}

/* Using :deep to style child components from Vee-Validate */
:deep(input),
:deep(select),
:deep(textarea) {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(15, 23, 42, 0.9);
  color: var(--cinema-text);
  font-size: 1rem;
  width: 100%;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

:deep(input:focus),
:deep(select:focus),
:deep(textarea:focus) {
  outline: none;
  border-color: var(--cinema-primary);
  box-shadow: 0 0 0 3px rgba(247, 197, 72, 0.2);
}

:deep(textarea) {
  resize: vertical;
  min-height: 100px;
}

:deep(select) {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23aaa' viewBox='0 0 16 16'%3E%3Cpath d='M8 12L2 6h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 16px;
}

.error-message {
  color: var(--cinema-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(247, 197, 72, 0.2);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
