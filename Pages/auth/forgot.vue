<script setup>
import { useRouter } from "vue-router";

definePageMeta({
  layout: "form",
});

const message = useMessage();
const router = useRouter();
const { restAPI } = useApi();
const email = ref();
const isLoading = ref(false);

async function goToForgot() {
  if (isLoading.value) return;

  isLoading.value = true;
  const emailValue = email.value;

  const { data: resendResp, error } = await restAPI.cms.resendOtp({
    body: { email: emailValue },
  });
  if (resendResp.value?.status) {
    message.success("Mã Otp đã được gửi tới email!");
    router.push({
      path: "verify_email",
      query: { email: emailValue },
    });
  } else if (error.value.statusCode === 400) {
    message.success("Mã Otp đã được gửi tới email!");
    router.push({
      path: "verify_email",
      query: { email: emailValue },
    });
  } else {
    message.warning("Email không chính xác!");
  }
  isLoading.value = false;
}
</script>

<template>
  <div
    class="relative mx-auto flex min-h-screen w-1/4 items-center justify-center"
  >
    <div class="mx-auto rounded-3xl bg-white bg-opacity-60 shadow">
      <n-form
        :label-width="200"
        class="p-6"
        label-align="left"
        require-mark-placement="right"
      >
        <div class="flex w-full">
          <img src="@/public/images/log0.png" class="mx-auto size-3/4" />
        </div>
        <div class="relative mt-8 text-center">
          <h1 class="text-3xl font-bold text-[#133D85]">Quên mật khẩu</h1>
          <p class="mt-5 text-lg text-blue-900">
            Nhập email đã đăng ký để lấy lại mật khẩu
          </p>
        </div>
        <n-form-item path="email" class="relative z-0">
          <input
            type="email"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="email"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:translate-x-1/4"
            >Email</label
          >
        </n-form-item>
        <div class="flex flex-row justify-center">
          <n-button
            type="info"
            class="h-[40px] w-full rounded-xl text-base font-medium"
            :loading="isLoading"
            @click="goToForgot"
          >
            Xác nhận
          </n-button>
        </div>
        <div class="mt-4 text-center">
          <NuxtLink
            to="login"
            class="text-primary-600 font-small text-[#00A2EB] hover:underline"
          >
            Quay lại đăng nhập
          </NuxtLink>
        </div>
      </n-form>
    </div>
  </div>
</template>
