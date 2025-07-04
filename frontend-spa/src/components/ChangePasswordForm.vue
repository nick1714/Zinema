<script setup>
import { Form as VeeForm, ErrorMessage, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const validationSchema = toTypedSchema(
  z
    .object({
      current_password: z.string().min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự'),
      new_password: z
        .string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu mới không được quá 50 ký tự'),
      confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirm_password'],
    }),
)

function handleSubmit(values) {
  emit('submit', values)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <VeeForm :validation-schema="validationSchema" @submit="handleSubmit">
    <div class="row">
      <div class="col-12 mb-3">
        <label class="form-label">Mật khẩu hiện tại <span class="text-danger">*</span></label>
        <VeeField name="current_password" v-slot="{ field }">
          <input type="password" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="current_password" class="error-feedback" />
      </div>

      <div class="col-12 mb-3">
        <label class="form-label">Mật khẩu mới <span class="text-danger">*</span></label>
        <VeeField name="new_password" v-slot="{ field }">
          <input type="password" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="new_password" class="error-feedback" />
      </div>

      <div class="col-12 mb-3">
        <label class="form-label">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
        <VeeField name="confirm_password" v-slot="{ field }">
          <input type="password" class="form-control" v-bind="field" />
        </VeeField>
        <ErrorMessage name="confirm_password" class="error-feedback" />
      </div>
    </div>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-warning" :disabled="isLoading">
        <i class="fas fa-key me-2"></i>
        {{ isLoading ? 'Đang đổi...' : 'Đổi mật khẩu' }}
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
