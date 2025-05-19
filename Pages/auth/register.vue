<script setup>
import { useRouter } from "vue-router";
import { reactive, ref, watch } from "vue";

definePageMeta({
  layout: "form",
});

const message = useMessage();
const router = useRouter();
const { restAPI } = useApi();
const formRef = ref(null);
const isLoading = ref(false);
const formValue = reactive({
  full_name: null,
  email: null,
  password: null,
  repeat_password: null,
});

const rules = {
  full_name: {
    required: true,
    trigger: ["blur", "input"],
    message: "Họ và tên không được để trống.",
  },
  email: {
    required: true,
    trigger: ["blur", "input"],
    validator: (rule, value) => {
      const emailRegex =
        /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Email không được để trống."));
        else if (value.length > 100)
          reject(Error("Email nhập không vượt quá 100 ký tự."));
        else if (!emailRegex.test(value))
          reject(Error("Email nhập không đúng định dạng."));
        else resolve();
      });
    },
  },
  password: {
    required: true,
    trigger: ["blur", "input"],
    validator: (rule, value) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Mật khẩu không được để trống."));
        else if (!passwordRegex.test(value))
          reject(
            Error(
              "Mật khẩu tối thiểu 8 ký tự, đảm bảo có đủ chữ hoa, chữ thường, số và ký tự đặc biệt",
            ),
          );
        else resolve();
      });
    },
  },
  repeat_password: {
    required: true,
    trigger: ["blur", "change"],
    validator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Mật khẩu không được để trống."));
        else if (value !== formValue.password)
          reject(Error("Mật khẩu không trùng khớp."));
        else resolve();
      });
    },
  },
};

watch(
  () => formValue.full_name,
  async (newValue) => {
    if (newValue) {
      formRef.value?.validate(["full_name"]).catch(() => {});
    }
  },
);

watch(
  () => formValue.email,
  async (newValue) => {
    const emailRegex =
      /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(newValue)) {
      formRef.value?.validate(["email"]).catch(() => {
        // Suppress errors silently
      });
    }
  },
);

watch(
  () => formValue.password,
  async (newValue) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (passwordRegex.test(newValue)) {
      formRef.value?.validate(["password"]).catch(() => {});
    }
  },
);

watch(
  () => formValue.repeat_password,
  async (newValue) => {
    if (newValue === formValue.password) {
      formRef.value?.validate(["repeat_password"]).catch(() => {});
    }
  },
);

const handleSubmit = async (e) => {
  if (isLoading.value) return;
  e.preventDefault();

  const valid = await formRef.value.validate();
  if (!valid) return;

  isLoading.value = true;
  const { email, full_name, password } = formValue;
  const body = { email, full_name, password };
  try {
    const { data: resVerify, error } = await restAPI.cms.register({ body });
    if (resVerify.value?.status) {
      message.success("Đăng ký thành công!");
      router.push("login");
    } else {
      const errorCode = error.value.data.error;
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resVerify.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";

      message.warning(errorMessage);
    }
  } catch (error) {
    console.error(error);
    message.error("Có lỗi xảy ra, vui lòng thử lại!");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="relative mx-auto flex min-h-screen w-2/6 items-center justify-center"
  >
    <div class="mx-auto rounded-3xl bg-white bg-opacity-60 shadow">
      <n-form
        ref="formRef"
        :label-width="200"
        class="p-6"
        label-align="left"
        require-mark-placement="right"
        :model="formValue"
        :rules="rules"
      >
        <div class="flex w-full items-center justify-center">
          <img src="@/public/images/log0.png" class="mx-auto size-1/2" />
        </div>
        <div class="mt-8 flex justify-center">
          <h1 class="text-3xl font-bold text-[#133D85]">Đăng ký</h1>
        </div>
        <n-form-item path="full_name" class="relative z-0 -mb-8">
          <input
            type="text"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="formValue.full_name"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600"
          >
            Họ và tên
          </label>
        </n-form-item>
        <n-form-item path="email" class="relative z-0 -mb-8">
          <input
            type="email"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="formValue.email"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600"
          >
            Email
          </label>
        </n-form-item>
        <n-form-item path="password" class="relative z-0 -mb-8">
          <input
            type="password"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="formValue.password"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600"
          >
            Nhập mật khẩu
          </label>
        </n-form-item>
        <n-form-item path="repeat_password" class="relative z-0">
          <input
            type="password"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="formValue.repeat_password"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600"
          >
            Nhập lại mật khẩu
          </label>
        </n-form-item>
        <div class="mt-5 flex flex-row justify-center">
          <n-button
            type="info"
            class="h-[40px] w-full rounded-xl text-base font-medium"
            :loading="isLoading"
            @click.prevent="handleSubmit"
          >
            Đăng ký
          </n-button>
        </div>
        <div class="relative mt-5 text-center text-[#133D85]">
          Bạn đã có tài khoản?
          <NuxtLink
            to="login"
            class="text-primary-600 font-small text-[#00A2EB] hover:underline"
          >
            Đăng nhập ngay
          </NuxtLink>
        </div>
      </n-form>
    </div>
  </div>
</template>
<style scoped>
:deep(.n-form-item) {
  transition: margin-bottom 0.2s ease-in-out;
}

:deep(.n-form-item .n-form-item-feedback-wrapper:not(:empty)) {
  display: block;
  min-height: 20px;
  text-align: center;
}

:deep(.n-form-item .n-form-item-feedback) {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: red;
  padding-top: 5px;
}
</style>
