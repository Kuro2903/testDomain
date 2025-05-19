<script setup>
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "#imports";
import { useUserStore } from "@/stores/userStore";

definePageMeta({
  layout: "form",
});

const userStore = useUserStore();
const message = useMessage();
const route = useRoute();
const router = useRouter();
const { restAPI } = useApi();

const inputRef = ref(null);
const focusIndex = ref(0);
const inputCode = ref([null, null, null, null, null, null]);
const errorValue = ref("");
const timer = ref(3);
const isSending = ref(false);
let intervalId = null;
const isLoading = ref(false);

function startTimer() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    timer.value -= 1;
    if (timer.value === 0) {
      clearInterval(intervalId);
    }
  }, 1000);
}

function handleFocus(index) {
  focusIndex.value = index;
  errorValue.value = "";
  const elem = inputRef.value[focusIndex.value];
  elem.focus();
  elem.select();
}

function handleInput(e, index) {
  const value = e.target.value?.[0];
  e.target.value = value;
  inputCode.value[index] = value;

  if (!value && index > 0) {
    const elem = inputRef.value[index - 1];
    elem?.focus();
    return;
  }
  if (value && index < inputCode.value.length - 1) {
    const elem = inputRef.value[index + 1];
    elem?.focus();
  }
}

function handleKeyup(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (focusIndex.value > 0) {
        handleFocus(focusIndex.value - 1);
      }
      break;
    case "ArrowRight":
      if (focusIndex.value < inputRef.value.length - 1) {
        handleFocus(focusIndex.value + 1);
      }
      break;
    case "Backspace":
      const value = inputCode.value[focusIndex.value]?.toString();
      if (!value && focusIndex.value > 0) {
        handleFocus(focusIndex.value - 1);
      }
      break;
    case "Enter":
      handleSubmit();
      break;
  }
}

async function resendOtp() {
  if (isSending.value) return;

  isSending.value = true;
  const email = route.query.email;
  const {
    data: resendResp,
    pending,
    error,
  } = await restAPI.cms.resendOtp({
    body: {
      email,
    },
  });
  if (resendResp.value?.status) {
    message.success("Đã gửi lại mã, vui lòng kiểm tra Email!");
    timer.value = 3;
    startTimer();
  }
  isSending.value = false;
}

function filterPermissions(permissions) {
  return permissions.reduce((acc, level0) => {
    if (level0.checked) {
      acc.push(level0);
    } else {
      const filteredLevel1 = level0.listLevel1?.reduce((subAcc, level1) => {
        if (level1.checked) {
          subAcc.push(level1);
        } else {
          const filteredLevel2 = level1.listLevel2?.filter(
            (level2) => level2.checked,
          );
          if (filteredLevel2 && filteredLevel2.length > 0) {
            subAcc.push({ ...level1, listLevel2: filteredLevel2 });
          }
        }
        return subAcc;
      }, []);
      if (filteredLevel1 && filteredLevel1.length > 0) {
        acc.push({ ...level0, listLevel1: filteredLevel1 });
      }
    }
    return acc;
  }, []);
}

const handleSubmit = async (e) => {
  if (isLoading.value) return;
  e.preventDefault();

  isLoading.value = true;
  const body = {
    email: route.query.email,
    code: inputCode.value.join(""),
  };
  try {
    const { data: resVerify, error } = await restAPI.cms.verifyEmail({
      body,
    });
    if (resVerify.value?.status) {
      message.success("Xác nhận Email thành công!");
      if (sessionStorage.getItem("first_time") === "true") {
        router.push({
          path: "newpass",
          query: { email: route.query.email },
        });
        message.success(
          "Học viên lần đầu đăng nhập! Thay đổi mật khẩu tài khoản!",
        );
      } else {
        let body = sessionStorage.getItem("loginfo");
        const { data: resVerify, error } = await restAPI.cms.login({ body });

        if (resVerify.value?.status) {
          const userInfo = resVerify.value?.data;
          nextTick(async () => {
            if (
              userInfo?.permission_grp &&
              (userInfo?.role_id === 3 || userInfo?.role_id === 4)
            ) {
              const filteredPermissions = filterPermissions(
                userInfo?.permission_grp?.tags,
              );
              userStore.setPermissions(
                userInfo?.permission_grp?.select_all,
                filteredPermissions,
              );
            }
            if (userInfo?.role_id === 1 || userInfo?.role_id === 2)
              userStore.setPermissions(true, []);
            delete userInfo.permission_grp;
            userStore.login(userInfo);
            message.success("Đăng nhập thành công!");
          });
          return navigateTo("/dashboard");
        }
      }
    } else if (
      error.value.statusCode === 400 &&
      error?.value?.data?.message === "Failed 4"
    ) {
      message.success("Xác nhận Email thành công!");
      router.push({
        path: "newpass",
        query: { email: route.query.email },
      });
    } else if (error.value.statusCode === 400) {
      message.error(
        "Mã OTP không chính xác hoặc hết thời gian sử dụng. Vui lòng thử lại",
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (route.query.userInfo) {
    const userInfo = JSON.parse(decodeURIComponent(route.query.userInfo));
  }
  startTimer();
  window.addEventListener("keyup", handleKeyup);
});
onBeforeUnmount(() => {
  window.removeEventListener("keyup", handleKeyup);
});
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
          <h1 class="cursor-default text-3xl font-bold text-[#133D85]">
            Nhập mã xác thực
          </h1>
          <p class="mt-5 cursor-default text-lg text-blue-900">
            Bạn vui lòng nhập mã xác thực được gửi đến email
          </p>
        </div>
        <div
          id="otp"
          class="otp md:(justify-center gap-5) mb-3 mt-5 flex items-center justify-between"
        >
          <input
            v-for="(code, index) in inputCode"
            ref="inputRef"
            :key="index"
            :value="code"
            :autofocus="focusIndex == 0"
            class="p-5px 2xs:(w-50px) font-700 rounded-5px border-#E0E0E0 focus:(border-2px border-primary) aspect-square w-10 border text-center text-lg text-[#00A2EB]"
            maxlength="1"
            @input="(e) => handleInput(e, index)"
            @focus="handleFocus(index)"
          />
        </div>
        <div class="flex flex-row justify-center">
          <n-button
            type="info"
            class="h-[40px] w-full rounded-xl text-base font-medium"
            @click.prevent="handleSubmit"
          >
            Xác nhận
          </n-button>
        </div>
        <div class="relative mt-5 cursor-default text-center text-[#133D85]">
          Không nhận được mã xác thực?
          <button
            :disabled="timer > 0"
            @click="resendOtp"
            :class="{
              'cursor-default text-[#133D85]': timer > 0,
              'cursor-pointer bg-transparent text-[#00A2EB] underline':
                timer <= 0,
            }"
          >
            Gửi lại
          </button>
          sau
          <span class="font-700 text-[#00A2EB]">
            {{ timer }}
          </span>
        </div>
      </n-form>
    </div>
  </div>
</template>
