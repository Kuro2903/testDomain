<script setup>
import { ref, reactive, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

const railStyle = ({ focused, checked }) => {
  const style = {};
  if (checked) {
    style.background = "#2080f0";
    if (focused) {
      style.boxShadow = "0 0 0 2px #2080f0";
    }
  }
  return style;
};
const message = useMessage();
const route = useRoute();
const router = useRouter();
const scheduleRef = ref(null);
const { restAPI } = useApi();
const isLoading = ref(false);
const formRef = ref(null);
const showSpin = ref(false);
const Brancharray = ref([]);
const PermissionGrouparray = ref([]);

const formValue = reactive({
  id: computed(() => route.query.id || null),
  full_name: null,
  email: null,
  type: null,
  branch_id: null,
  phone: null,
  organ_struct_id: null,
  position: 3,
  username: null,
  password: null,
  introduction: null,
  permission_grp_id: null,
  is_active: true,
  avatar: "https://i.postimg.cc/SRMS5kn5/cover.png",
  salary_type: 1,
  salary: null,
  role_id: 4,
});

const rules = {
  full_name: {
    required: true,
    message: "Please input full name",
    trigger: "blur",
  },
  branch_id: {
    required: true,
    message: "Please select branch",
    trigger: "blur",
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
  phone: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      return new Promise((resolve, reject) => {
        const phoneRegex =
          /^((84|(\+84))(3|5|7|8|9)([0-9]{8})\b|(0[3|5|7|8|9])([0-9]{8}))$/;
        if (!value) reject(Error("Số điện thoại không được để trống!"));
        else if (value && !phoneRegex.test(value))
          reject(Error("Số điện thoại không hợp lệ!"));
        else resolve();
      });
    },
  },
  username: {
    required: true,
    message: "Please input username",
    trigger: "blur",
  },
  password: {
    required: true,
    message: "Please input password",
    trigger: "blur",
  },
  permission_grp_id: {
    required: true,
    message: "Please select permission group",
    trigger: "blur",
  },
};

const userPosition = [
  { label: "Giảng viên", value: 1 },
  { label: "Trợ giảng", value: 2 },
  { label: "Nhân viên", value: 3 },
  { label: "Phân công chăm sóc", value: 4 },
];

const userSalary = [
  { label: "Tính lương theo giờ", value: 1 },
  { label: "Tính lương theo buổi dạy", value: 2 },
  { label: "Tính lương theo cả khóa", value: 3 },
];

if (formValue.id) {
  showSpin.value = true;
  const { data: resData, error } = await restAPI.cms.getStaffDetails({
    id: formValue.id,
  });
  if (resData.value?.status) {
    const item = resData.value?.data;
    formValue.full_name = item.full_name;
    formValue.email = item.email;
    formValue.type = item.type;
    formValue.branch_id = item.branch_id;
    formValue.phone = item.phone;
    formValue.organ_struct_id = item.organ_struct_id;
    formValue.position = item.position;
    formValue.username = item.username;
    formValue.password = item.password || "password";
    formValue.introduction = item.introduction;
    formValue.permission_grp_id = item.permission_grp_id;
    formValue.is_active = item.is_active;
    formValue.avatar = item.avatar || "";
    formValue.salary_type = item.salary_type || 1;
    formValue.salary =
      item.salary !== undefined && item.salary !== null
        ? String(item.salary)
        : "0";
    formValue.role_id = item.role_id;
  }
  showSpin.value = false;
}

const fetchBranch_id = async () => {
  try {
    const { data: resData } = await restAPI.cms.getBranches({});

    if (resData.value?.status) {
      Brancharray.value = resData.value.data
        .map(({ id, Name, address }) => ({
          id,
          display: `${Name}: ${address}`,
        }))
        .sort((a, b) => a.display.localeCompare(b.display));
    } else {
      message.error("Failed to load Branches!");
      Brancharray.value = [];
    }
  } catch (err) {
    message.error("Error fetching Branches!");
    console.error(err);
    Brancharray.value = [];
  }
};

const fetchPermissonGroup = async () => {
  try {
    const { data: resData } = await restAPI.cms.getPermissionGroups({});
    if (resData.value?.status) {
      PermissionGrouparray.value = resData.value.data.data
        .map(({ id, name }) => ({
          id,
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      message.error("Failed to load permission group!");
      PermissionGrouparray.value = [];
    }
  } catch (err) {
    message.error("Error fetching permission group!");
    console.error(err);
    PermissionGrouparray.value = [];
  }
};

const handleImageUpload = () => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    formValue.avatar = e.target.result;
  };
  reader.readAsDataURL(file);

  // S3 upload
  // formValue.avartar = url
};
const submitSchedule = async () => {
  await nextTick();
  // console.log(scheduleRef.value.scheduleSubmit);
  if (scheduleRef.value && scheduleRef.value.scheduleSubmit) {
    await scheduleRef.value.scheduleSubmit();
  }
};
const handleSubmit = async (e) => {
  if (isLoading.value) return;
  isLoading.value = true;
  e.preventDefault();
  const {
    id,
    full_name,
    email,
    type,
    branch_id,
    phone,
    organ_struct_id,
    position,
    username,
    password,
    introduction,
    permission_grp_id,
    is_active,
    avatar,
    salary_type,
    salary,
    role_id,
  } = formValue;
  let body = {
    id,
    full_name,
    email,
    type,
    branch_id,
    phone,
    organ_struct_id,
    position,
    username,
    password,
    introduction,
    permission_grp_id,
    is_active,
    avatar,
    salary_type,
    salary: Number(salary) || 0,
    role_id,
  };
  try {
    await formRef.value?.validate();
    if (id) {
      await submitSchedule();
      const { data: resUpdate, error } = await restAPI.cms.updateStaff({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật nhân viên thành công!");
      } else {
        const errorCode = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resUpdate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createStaff({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo nhân viên thành công!");
        const newId = resCreate.value.data;
        router.push({ path: window.location.pathname, query: { id: newId } });
      } else {
        const errorCode = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resCreate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";
        message.warning(errorMessage);
      }
    }
  } catch (err) {
  } finally {
    isLoading.value = false;
  }
};
onMounted(() => {
  fetchBranch_id();
  fetchPermissonGroup();
});
</script>
<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1 px-5 py-5">
      <h1
        v-if="formValue.id === null"
        class="mb-5 text-4xl font-bold text-[#133D85]"
      >
        Thêm mới nhân sự
      </h1>
      <h1 v-else class="mb-5 text-4xl font-bold text-[#133D85]">
        Chỉnh sửa nhân sự
      </h1>
      <br />
      <n-form :model="formValue" ref="formRef" :rules="rules">
        <n-grid cols="3" :x-gap="20" responsive="screen">
          <n-gi span="2">
            <n-grid cols="2" :x-gap="20" responsive="screen">
              <n-gi>
                <n-form-item label="Họ tên nhân sự" path="full_name">
                  <n-input
                    v-model:value="formValue.full_name"
                    placeholder="Nhập họ tên nhân sự"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Vai trò" path="position">
                  <n-select
                    v-model:value="formValue.position"
                    :options="userPosition"
                    label-field="label"
                    value-field="value"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Email" path="email">
                  <n-input
                    type="email"
                    v-model:value="formValue.email"
                    placeholder="Nhập Email"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Số điện thoại" path="phone">
                  <n-input
                    v-model:value="formValue.phone"
                    placeholder="Nhập số điện thoại"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-gi>

          <n-gi>
            <n-form-item label="Picture" path="picture">
              <div>
                <img
                  :src="formValue.avatar"
                  alt="Picture"
                  style="
                    background-color: lightgray;
                    width: 90px;
                    height: 90px;
                    border-radius: 15%;
                    object-fit: cover;
                  "
                />
                <div class="mt-2">
                  <label
                    for="Picture-upload"
                    class="cursor-pointer text-sm text-blue-500 hover:underline"
                  >
                    Chỉnh sửa ảnh
                  </label>
                  <input
                    type="file"
                    id="Picture-upload"
                    class="hidden"
                    accept="image/*"
                    @change="(event) => handleImageUpload()"
                  />
                </div>
                <p class="text-xs text-gray-500">
                  Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                </p>
              </div>
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Chi nhánh" path="branch_id">
              <n-select
                v-model:value="formValue.branch_id"
                :options="Brancharray"
                label-field="display"
                value-field="id"
                placeholder="Chọn chi nhánh"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Cơ cấu tổ chức" path="organ_struct_id">
              <n-select
                v-model:value="formValue.organ_struct_id"
                placeholder="Chọn cơ cấu tổ chức"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Nhóm quyền" path="permission_grp_id">
              <n-select
                v-model:value="formValue.permission_grp_id"
                :options="PermissionGrouparray"
                label-field="name"
                value-field="id"
                placeholder="Chọn nhóm quyền"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Tên tài khoản" path="username">
              <n-input
                v-model:value="formValue.username"
                :disabled="formValue.id !== null"
                placeholder="Nhập tên tài khoản"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Mật khẩu" type="password" path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                :disabled="formValue.id !== null"
                placeholder="Nhập mật khẩu"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item
              label="Trạng thái hoạt động:"
              label-placement="left"
              class="mt-7"
            >
              <n-switch
                v-model:value="formValue.is_active"
                :rail-style="railStyle"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="2">
            <n-form-item label="Giới thiệu">
              <n-input
                v-model:value="formValue.introduction"
                type="textarea"
                class="w-full"
                placeholder="Giới thiệu"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="2" v-if="formValue.id !== null">
            <n-grid cols="2" :x-gap="20" responsive="screen">
              <n-gi span="2">
                <DaotaoGiangvienSchedule
                  ref="scheduleRef"
                  :branch_id="formValue.branch_id"
                />
              </n-gi>
              <n-gi>
                <n-form-item label="Cách tính lương" path="salary_type">
                  <n-select
                    v-model:value="formValue.salary_type"
                    :options="userSalary"
                    label-field="label"
                    value-field="value"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Số tiền tính lương(VNĐ)" path="salary">
                  <n-input v-model:value="formValue.salary" />
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-gi>
          <n-gi span="2">
            <n-form-item class="flex gap-5">
              <n-button
                type="info"
                class="mr-5 h-12 w-48 rounded-2xl text-lg"
                :loading="isLoading"
                @click.prevent="handleSubmit"
              >
                Lưu
              </n-button>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </div>
  </div>
</template>
