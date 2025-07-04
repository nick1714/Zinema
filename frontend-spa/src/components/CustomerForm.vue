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
    :validation-schema="validationSchema"
    :initial-values="initialValues"
    @submit="handleSubmit"
  >
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Tên <span class="text-danger">*</span></label>
        <VeeField name="full_name" v-slot="{ field }">
          <input type="text" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="full_name" class="error-feedback" />
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
        <VeeField name="phone_number" v-slot="{ field }">
          <input type="text" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="phone_number" class="error-feedback" />
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Ngày sinh</label>
        <VeeField name="date_of_birth" v-slot="{ field }">
          <input type="date" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="date_of_birth" class="error-feedback" />
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Giới tính</label>
        <VeeField name="gender" v-slot="{ field }">
          <select class="form-select" v-bind="field">
            <option value="" disabled>Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </VeeField>
        <ErrorMessage name="gender" class="error-feedback" />
      </div>

      <div class="col-12 mb-3">
        <label class="form-label">Địa chỉ</label>
        <VeeField name="address" v-slot="{ field }">
          <textarea class="form-control" rows="3" v-bind="field"></textarea>
        </VeeField>
        <ErrorMessage name="address" class="error-feedback" />
      </div>
    </div>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-success" :disabled="isLoading">
        <i class="fas fa-save me-2"></i>
        {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="handleCancel">
        <i class="fas fa-times me-2"></i>
        Hủy
      </button>
    </div>
  </VeeForm>
</template>

<style scoped>
.error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
