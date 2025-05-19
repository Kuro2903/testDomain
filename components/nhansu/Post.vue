<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import type { RuleType } from "async-validator";
import dayjs from "dayjs";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NUpload,
  NSpace,
  NModal,
} from "naive-ui";

export default defineComponent({
  components: {
    NButton,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NSwitch,
    NUpload,
    NSpace,
    NModal,
  },
  setup() {
    const showModal = ref(false);
    const formRef = ref();
    const isLoading = ref(false);
    const initialFormData = {
      id: "",
      full_name: "",
      email: "",
      type: "",
      branch_id: "",
      organ_struct_id: null,
      position: "",
      username: "",
      password: "",
      introduction: "",
      permission_grp_id: "",
      is_active: true,
      avatar: "",
      salary_type: null,
      salary: 0,
      role_id: 4,
    };
    const formData = ref({ ...initialFormData });

    const rules = {
      full_name: {
        required: true,
        message: "Please input full name",
        trigger: "blur",
      },
      position: {
        required: true,
        message: "Please select position",
        trigger: "blur",
      },
      email: {
        required: true,
        type: "email" as RuleType,
        message: "Please input valid email",
        trigger: "blur",
      },
      phone: {
        required: true,
        message: "Please input phone number",
        trigger: "blur",
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

    const branchOptions = [
      { label: "Cơ sở 1", value: "570c8d2f-9614-40cb-9cee-87deb6d8d667" },
      // Add more branch options here
    ];

    const branchPotition = [
      { label: "CEO", value: "1" },
      // Add more branch posittion here
    ];

    const organizationOptions = [
      { label: "Phòng đào tạo", value: "PhongDaoTao" },
      // Add more organization options here
    ];

    const permissionGroupOptions = [
      {
        label: "Tên nhóm quyền",
        value: "f47efc07-0ff3-47a1-9ac5-eed8c7de020a",
      },
      // Add more permission group options here
    ];

    const imageUrl = ref<string | null>(null);

    const handleImageChange = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          imageUrl.value = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    };

    const beforeUpload = (file: File) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 1;

      if (!isJpgOrPng) {
        alert("You can only upload JPG/PNG files!");
      }
      if (!isLt2M) {
        alert("Image must smaller than 1MB!");
      }
      return isJpgOrPng && isLt2M;
    };

    const handleSubmit = async (e: Event) => {
      e.preventDefault(); // Prevent default form submission behavior
      if (isLoading.value) return;

      const { id, full_name, email, is_active, type, password, username } =
        formData.value;

      let body = {
        id,
        full_name,
        email,
        is_active,
        type: Number(type),
        password,
        username, // Add username to the body
      };

      try {
        const valid = await formRef.value.validate();
        if (valid) {
          const response = await axios.post(
            "http://localhost:3000/api/admin/users",
            body,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
              },
            },
          );
          console.log("Form submitted:", response.data);
          alert("User added successfully");
          showModal.value = false;
          handleReset();
        }
      } catch (error) {
        console.error("Validation or API error:", error);

        if (error && (error as any).response) {
          alert(`API Error: ${(error as any).response.data.message}`);
        } else if (error && (error as any).message) {
          alert(`Error: ${(error as any).message}`);
        } else {
          alert("Form submission failed. Please check your input.");
        }
      }
    };

    const handleReset = () => {
      formData.value = { ...initialFormData };
    };

    const cancelClick = (e?: Event) => {
      if (e) e.preventDefault(); // Prevent default behavior if called from an event
      handleReset();
      showModal.value = false;
    };

    return {
      formRef,
      formData,
      showModal,
      rules,
      branchOptions,
      organizationOptions,
      permissionGroupOptions,
      imageUrl,
      handleImageChange,
      beforeUpload,
      handleSubmit,
      handleReset,
      cancelClick,
      branchPotition,
    };
  },
});
</script>

<template>
  <div class="mt-5 px-10">
    <div class="h-full w-full rounded-2xl bg-gray-200 px-5 py-3">
      <p class="px-5 py-2 text-xl font-semibold">Thêm mới nhân sự</p>
      <div class="flex w-full rounded-b-2xl bg-white px-10 py-8">
        <n-space vertical class="w-full">
          <n-form :model="formData" ref="formRef" :rules="rules">
            <n-grid cols="1 m:2" :x-gap="40" responsive="screen">
              <n-gi>
                <n-form-item label="Họ tên nhân sự *" path="full_name">
                  <n-input v-model:value="formData.full_name" class="w-80" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Ảnh nhân sự">
                  <n-upload
                    @on-change="handleImageChange"
                    :max="1"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                  >
                    <n-button>Chọn tệp</n-button>
                  </n-upload>
                  <template v-if="imageUrl">
                    <img
                      :src="imageUrl"
                      alt="Image preview"
                      class="mt-3 h-28 w-28 rounded-lg object-cover"
                    />
                  </template>
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Tên tài khoản *" path="username">
                  <n-input v-model:value="formData.username" class="w-80" />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Vai trò *" path="position">
                  <n-select
                    v-model:value="formData.position"
                    :options="branchPotition"
                    class="w-80"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Email *" path="email">
                  <n-input v-model:value="formData.email" class="w-80" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Chi nhánh *" path="branch_id">
                  <n-select
                    v-model:value="formData.branch_id"
                    :options="branchOptions"
                    class="w-80"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Cơ cấu tổ chức *" path="organ_struct_id">
                  <n-select
                    v-model:value="formData.organ_struct_id"
                    :options="organizationOptions"
                    class="w-80"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Mật khẩu *" path="password">
                  <n-input
                    v-model:value="formData.password"
                    type="password"
                    class="w-80"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Nhóm quyền *" path="permission_grp_id">
                  <n-select
                    v-model:value="formData.permission_grp_id"
                    :options="permissionGroupOptions"
                    class="w-80"
                  />
                </n-form-item>
              </n-gi>

              <n-gi>
                <n-form-item label="Trạng thái hoạt động:">
                  <n-switch v-model:value="formData.is_active" />
                </n-form-item>
              </n-gi>
              <n-gi span="2">
                <n-form-item label="Giới thiệu">
                  <n-input
                    v-model:value="formData.introduction"
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
                    @click.prevent="handleSubmit"
                  >
                    Lưu
                  </n-button>
                  <!-- <n-button
                    type="default"
                    class="h-12 w-48 rounded-2xl text-lg"
                    @click="cancelClick"
                  >
                    Hủy
                  </n-button> -->
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </n-space>
      </div>
    </div>
  </div>
</template>
