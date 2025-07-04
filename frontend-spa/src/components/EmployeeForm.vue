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
  emit('submit', values)
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
        <label class="form-label">Email <span class="text-danger">*</span></label>
        <VeeField name="email" v-slot="{ field }">
          <input type="email" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="email" class="error-feedback" />
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
      <div class="col-md-6 mb-3">
        <label class="form-label">Vị trí</label>
        <VeeField name="position" v-slot="{ field }">
          <select class="form-select" v-bind="field">
            <option value="" disabled>Chọn vị trí</option>
            <option value="Nhân viên bán vé">Nhân viên bán vé</option>
            <option value="Nhân viên vệ sinh">Nhân viên vệ sinh</option>
          </select>
        </VeeField>
        <ErrorMessage name="position" class="error-feedback" />
      </div>

      <div class="col-12 mb-3">
        <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
        <VeeField name="address" v-slot="{ field }">
          <textarea class="form-control" rows="3" v-bind="field"></textarea>
        </VeeField>
        <ErrorMessage name="address" class="error-feedback" />
      </div>
    </div>

    <template v-if="!isEditMode">
      <div class="col-md-6 mb-3">
        <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
        <VeeField name="password" v-slot="{ field }">
          <input type="password" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="password" class="error-feedback" />
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
        <VeeField name="password_confirm" v-slot="{ field }">
          <input type="password" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="password_confirm" class="error-feedback" />
      </div>
    </template>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-success" :disabled="isLoading">
        <i class="fas fa-save me-2"></i>
        <span v-if="isEditMode">{{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
        <span v-else>{{ isLoading ? 'Đang tạo...' : 'Tạo nhân viên' }}</span>
      </button>
      <button type="button" class="btn btn-secondary" @click="handleCancel">
        <i class="fas fa-arrow-left me-2"></i>
        <span v-if="isEditMode">Hủy</span>
        <span v-else>Quay lại</span>
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
