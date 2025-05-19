<script setup>
import { ref, watch } from "vue";
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
const props = defineProps({
  Brancharray: Array,
  PermissionGrouparray: Array,
});
const { restAPI } = useApi();
const emit = defineEmits(["submit"]);
const isModalVisible = ref(false);
const is_edit = ref(false);
const formRef = ref();
const message = useMessage();

const setAddNew = (value, id) => {
  isModalVisible.value = true;
  is_edit.value = value;
  formValue.id = id;
  if (id) {
    fetchStaffData();
  }
};

defineExpose({ setAddNew });

const formValue = reactive({
  id: null,
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
  avatar: "https://i.postimg.cc/Pxxp3vpy/cover.png",
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

watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      id: null,
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
      avatar: "https://i.postimg.cc/Pxxp3vpy/cover.png",
      salary_type: null,
      salary: null,
      role_id: 4,
    });
  }
});

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

const fetchStaffData = async () => {
  if (!formValue.id) return;

  const { data: resData, error } = await restAPI.cms.getStaffDetails({
    id: formValue.id,
  });

  if (resData.value?.status) {
    const item = resData.value?.data;
    formValue.id = item.id || null;
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
    isModalVisible.value = true;
  } else {
    message.error("Failed to load user details!");
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

const handleSubmit = async (e) => {
  e.preventDefault();
  const valid = await formRef.value.validate();
  if (!valid) return;
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
  console.log("Request body:", JSON.stringify(body, null, 2));

  emit("submit", body);
  closeModal();
};
const closeModal = () => {
  isModalVisible.value = false;
};
</script>
<template>
  <n-modal-provider>
    <n-modal
      v-model:show="isModalVisible"
      preset="card"
      style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 1200px;
      "
      :header-style="{ padding: '10px' }"
      :closable="false"
    >
      <n-form :model="formValue" ref="formRef" :rules="rules">
        <n-grid cols="3" :x-gap="20" responsive="screen">
          <n-gi span="2">
            <n-grid cols="2" :x-gap="20" responsive="screen">
              <n-gi>
                <n-form-item label="Họ tên nhân sự" path="full_name">
                  <n-input v-model:value="formValue.full_name" />
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
                  <n-input v-model:value="formValue.email" />
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
                :options="props.Brancharray"
                label-field="display"
                value-field="id"
                placeholder="Chọn chi nhánh"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Cơ cấu tổ chức" path="organ_struct_id">
              <n-select v-model:value="formValue.organ_struct_id" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Nhóm quyền" path="permission_grp_id">
              <n-select
                v-model:value="formValue.permission_grp_id"
                :options="props.PermissionGrouparray"
                label-field="name"
                value-field="id"
                placeholder="Chọn nhóm quyền"
              />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Tên tài khoản" path="username">
              <n-input v-model:value="formValue.username" :disabled="is_edit" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item label="Mật khẩu" type="password" path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                :disabled="is_edit"
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
          <n-gi>
            <n-form-item label="Cách tính lương" path="salary" v-show="is_edit">
              <n-select
                v-model:value="formValue.salary_type"
                :options="userSalary"
                label-field="label"
                value-field="value"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item
              label="Số tiền tính lương (VNĐ)"
              path="salary"
              v-show="is_edit"
            >
              <n-input v-model:value="formValue.salary" type="number" />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="Giới thiệu">
              <n-input
                v-model:value="formValue.introduction"
                type="textarea"
                class="w-full"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="2">
            <n-form-item class="flex gap-5">
              <n-button
                type="info"
                class="mr-5 h-12 w-48 rounded-2xl text-lg"
                @click="handleSubmit"
              >
                Lưu
              </n-button>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>
  </n-modal-provider>
</template>
