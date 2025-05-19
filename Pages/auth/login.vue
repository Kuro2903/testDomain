<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { useUserStore } from "~~/stores/userStore";
definePageMeta({
  layout: "form",
});
const router = useRouter();
const userStore = useUserStore();
const message = useMessage();
const { restAPI } = useApi();
const isLoading = ref(false);
const email = ref("");
const password = ref("");

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
  const body = { email: email.value, password: password.value };
  try {
    const { data: resVerify, error } = await restAPI.cms.login({ body });

    if (resVerify.value?.status) {
      const userInfo = resVerify.value?.data;
      console.log("origin", userInfo);
      if (userInfo?.permission_grp_id) initDefaultPermit(userInfo);
      nextTick(async () => {
        if (
          userInfo?.permission_grp &&
          (userInfo?.role_id === 3 || userInfo?.role_id === 4)
        ) {
          console.log("source", userInfo.permission_grp.tags);
          const filteredPermissions = filterPermissions(
            userInfo?.permission_grp?.tags,
          );
          console.log("filter", filteredPermissions);
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
    } else {
      const errorCode = error.value?.data?.error;
      console.log(errorCode);
      const errorMessage =
        ERROR_CODES[errorCode] ||
        resVerify.value?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      if (errorCode == 2008) {
        if (body.password === "aohvaklvnh") {
          sessionStorage.setItem("first_time", "true");
        }
        router.push({
          path: "verify_email",
          query: {
            email: email.value,
          },
        });
      }
      message.warning(errorMessage);
    }
  } catch (error) {
    console.log(error);
    message.error("Lỗi không xác định, vui lòng thử lại!");
  } finally {
    isLoading.value = false;
  }
};

async function initDefaultPermit(user) {
  console.log("user", user);
  const { data: resPermissionsTags } = await restAPI.cms.getPermissionTags({
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });
  const listPer = resPermissionsTags.value?.data?.data || [];
  const PermsList = ref([]);
  listPer.forEach((level1) => {
    const lv1 = {
      id: level1.id,
      name: level1.name,
      key: level1?.key || null,
      checked: true,
      countSelected: 0,
      listLevel1: level1.sub_tags?.map((level2) => {
        const lv2 = {
          id: level2.id,
          name: level2.name,
          key: level2?.key || null,
          checked: true,
          total: level2.permissions?.length || 0,
          listLevel2: level2.permissions?.map((level3) => {
            const lv3 = {
              id: level3.id,
              name: level3.name,
              checked: true,
              disabled: false,
              action: level3.action,
            };
            return lv3;
          }),
        };
        return lv2;
      }),
    };
    const countSelected = lv1.listLevel1?.reduce((acc, curr) => {
      const childCount = curr.listLevel2?.reduce(
        (childAcc, childCurr) => (childAcc += childCurr.checked ? 1 : 0),
        0,
      );
      return (acc += childCount);
    }, 0);
    lv1.countSelected = countSelected;
    PermsList.value.push(lv1);
  });

  let idList = [];
  PermsList.value.forEach((item) => {
    if (item.listLevel1 && item.listLevel1.length > 0) {
      item.listLevel1.forEach((level1) => {
        if (level1.listLevel2 && level1.listLevel2.length > 0) {
          level1.listLevel2.forEach((level2) => {
            if (level2.checked === true) {
              idList.push(level2.id);
            }
          });
        }
      });
    }
  });
}
</script>

<template>
  <div class="mx-auto my-auto h-2/3 w-1/4 rounded-2xl">
    <div class="mx-auto rounded-3xl bg-white bg-opacity-60 shadow">
      <n-form
        :label-width="200"
        class="p-6"
        label-align="left"
        require-mark-placement="right"
      >
        <div class="flex w-full items-center justify-center">
          <img src="@/public/images/log0.png" class="mx-auto size-3/4" />
        </div>
        <div class="mt-8 flex justify-center">
          <h1 class="text-3xl font-bold text-[#133D85]">Đăng nhập</h1>
        </div>
        <n-form-item path="email" class="relative z-0 -mb-8">
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
        <n-form-item path="password" type="password" class="relative z-0 mb-5">
          <input
            type="password"
            class="peer block w-full appearance-none border-0 border-b-2 border-[#4D6FA8] bg-transparent px-0 py-2.5 text-sm text-[#4D6FA8] focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder=" "
            v-model="password"
          />
          <label
            class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm font-medium text-[#4D6FA8] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:translate-x-1/4"
            >Nhập mật khẩu</label
          >
        </n-form-item>
        <div class="flex items-center justify-between pb-4">
          <div class="flex items-start">
            <div class="flex-initial">
              <n-checkbox></n-checkbox>
              <span
                class="text-primary-600 font-small ml-2 text-sm text-[#133D85]"
                >Ghi nhớ đăng nhập</span
              >
            </div>
          </div>
          <NuxtLink
            to="forgot"
            class="text-primary-600 font-small text-sm text-[#00A2EB] hover:underline"
          >
            Quên mật khẩu?
          </NuxtLink>
        </div>
        <div class="flex flex-row justify-center">
          <n-button
            type="info"
            class="h-[40px] w-full rounded-xl text-base font-medium"
            :loading="isLoading"
            @click.prevent="handleSubmit"
          >
            Đăng nhập
          </n-button>
        </div>
        <div class="relative mt-5 text-center text-[#133D85]">
          Bạn chưa có tài khoản?
          <NuxtLink
            to="register"
            class="text-primary-600 font-small text-[#00A2EB] hover:underline"
          >
            Đăng ký ngay
          </NuxtLink>
        </div>
      </n-form>
    </div>
  </div>
</template>
