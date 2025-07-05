<script setup>
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

defineProps({
  initialValues: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const validationSchema = toTypedSchema(
  z.object({
    full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
    phone_number: z
      .string()
      .regex(/(01|02|03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
    address: z.string().max(200, 'Địa chỉ tối đa 200 ký tự').optional().or(z.literal('')),
    date_of_birth: z.string().optional(),
    gender: z
      .enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' }),
      })
      .optional(),
  }),
)

function handleSubmit(values) {
  const payload = { ...values }
  // Convert empty strings to null for optional fields that should be nullable in DB
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
    class="customer-form"
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
        <VeeField name="phone_number" id="phone_number" type="text" placeholder="Nhập số điện thoại" />
        <ErrorMessage name="phone_number" class="error-message" />
      </div>
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
      <label for="address">Địa chỉ</label>
      <VeeField name="address" id="address" as="textarea" rows="3" placeholder="Nhập địa chỉ" />
      <ErrorMessage name="address" class="error-message" />
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-save" :disabled="isLoading">
        <i class="fas fa-save"></i>
        <span>{{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
      </button>
      <button type="button" class="btn-cancel" @click="handleCancel">
        <i class="fas fa-times"></i>
        <span>Hủy</span>
      </button>
    </div>
  </VeeForm>
</template>

<style scoped>
/* Scoped styles based on MovieDetailPage */
.customer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--cinema-text);
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Vee-Validate fields will automatically inherit these styles */
:deep(input),
:deep(select),
:deep(textarea) {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: var(--cinema-text);
  font-size: 0.9rem;
  width: 100%;
}

:deep(textarea) {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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
  gap: 0.5rem;
}

.btn-save:hover {
  filter: brightness(1.1);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cinema-text);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
