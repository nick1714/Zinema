<script setup>
import { computed } from 'vue'
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const props = defineProps({
  phoneNumber: {
    type: String,
    default: '',
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  allowPhoneEdit: {
    type: Boolean,
    default: false, // Mặc định không cho phép chỉnh sửa (để tương thích với BookingPage)
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Validation schema với Zod
const validationSchema = toTypedSchema(
  z.object({
    full_name: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên tối đa 100 ký tự'),
    phone_number: z
      .string()
      .regex(/(01|02|03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
    date_of_birth: z.string().optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Giới tính phải là Nam, Nữ hoặc Khác' }),
    }),
    address: z.string().max(200, 'Địa chỉ tối đa 200 ký tự').optional().or(z.literal('')),
  }),
)

// Tính toán initial values
const computedInitialValues = computed(() => {
  // Nếu có initialValues (ProfilePage, CustomerEdit), sử dụng chúng
  if (props.initialValues && Object.keys(props.initialValues).length > 0) {
    return props.initialValues
  }
  // Nếu không, sử dụng phoneNumber prop (BookingPage)
  else if (props.phoneNumber) {
    return {
      full_name: '',
      phone_number: props.phoneNumber,
      date_of_birth: '',
      gender: 'other',
      address: '',
    }
  }
  // Default values
  return {
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'other',
    address: '',
  }
})

function handleSubmit(values) {
  // Chuẩn bị dữ liệu gửi lên
  const customerData = {
    full_name: values.full_name.trim(),
    phone_number: values.phone_number.trim(),
    date_of_birth: values.date_of_birth || null,
    gender: values.gender,
    address: values.address?.trim() || null,
  }

  emit('submit', customerData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="customer-form">
    <div class="form-header">
      <h3>
        <i class="fas fa-user-plus"></i>
        {{
          initialValues && Object.keys(initialValues).length > 0
            ? 'Chỉnh sửa thông tin'
            : 'Thông tin khách hàng mới'
        }}
      </h3>
      <p>
        {{
          initialValues && Object.keys(initialValues).length > 0
            ? 'Cập nhật thông tin cá nhân của bạn'
            : 'Nhập thông tin khách hàng để tạo hồ sơ mới'
        }}
      </p>
    </div>

    <VeeForm
      :validation-schema="validationSchema"
      :initial-values="computedInitialValues"
      @submit="handleSubmit"
      class="customer-form-content"
    >
      <div class="form-row">
        <div class="form-group">
          <label for="full_name" class="form-label">
            <i class="fas fa-user"></i>
            Họ và tên *
          </label>
          <VeeField
            type="text"
            id="full_name"
            name="full_name"
            placeholder="Nhập họ và tên đầy đủ"
            class="form-input"
          />
          <ErrorMessage name="full_name" class="error-message" />
        </div>

        <div class="form-group">
          <label for="phone_number" class="form-label">
            <i class="fas fa-phone"></i>
            Số điện thoại *
          </label>
          <VeeField
            type="tel"
            id="phone_number"
            name="phone_number"
            placeholder="Nhập số điện thoại"
            class="form-input"
            :readonly="!allowPhoneEdit"
          />
          <ErrorMessage name="phone_number" class="error-message" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date_of_birth" class="form-label">
            <i class="fas fa-calendar"></i>
            Ngày sinh
          </label>
          <VeeField type="date" id="date_of_birth" name="date_of_birth" class="form-input" />
          <ErrorMessage name="date_of_birth" class="error-message" />
        </div>

        <div class="form-group">
          <label for="gender" class="form-label">
            <i class="fas fa-venus-mars"></i>
            Giới tính
          </label>
          <VeeField as="select" id="gender" name="gender" class="form-select">
            <option value="other">Khác</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </VeeField>
          <ErrorMessage name="gender" class="error-message" />
        </div>
      </div>

      <div class="form-group">
        <label for="address" class="form-label">
          <i class="fas fa-map-marker-alt"></i>
          Địa chỉ
        </label>
        <VeeField
          as="textarea"
          id="address"
          name="address"
          placeholder="Nhập địa chỉ (tùy chọn)"
          class="form-textarea"
          rows="3"
        />
        <ErrorMessage name="address" class="error-message" />
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy
        </button>
        <button type="submit" :disabled="isLoading" class="btn-submit">
          <i v-if="!isLoading" class="fas fa-save"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{
            isLoading
              ? 'Đang xử lý...'
              : initialValues && Object.keys(initialValues).length > 0
                ? 'Cập nhật'
                : 'Tạo khách hàng'
          }}
        </button>
      </div>
    </VeeForm>
  </div>
</template>

<style scoped>
.customer-form {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 2rem 0;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-header h3 {
  color: var(--cinema-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-header p {
  color: var(--cinema-text-muted);
  font-size: 1rem;
}

.customer-form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinema-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--cinema-text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--cinema-primary);
  box-shadow: 0 0 0 3px rgba(247, 197, 72, 0.1);
  background: rgba(255, 255, 255, 0.15);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--cinema-text-muted);
}

.form-input[readonly] {
  background: rgba(255, 255, 255, 0.05);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-submit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.btn-cancel:hover {
  background: rgba(108, 117, 125, 0.3);
  transform: translateY(-2px);
}

.btn-submit {
  background: var(--cinema-gradient-gold);
  color: var(--cinema-darker);
}

.btn-submit:hover:not(:disabled) {
  background: var(--cinema-gradient-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(247, 197, 72, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .customer-form {
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-header h3 {
    font-size: 1.3rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    justify-content: center;
  }
}

/* Error message styling */
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-input.is-invalid,
.form-select.is-invalid,
.form-textarea.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}
</style>
