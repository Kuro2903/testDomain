<script lang="ts">
import { defineComponent, ref, onMounted, h } from "vue";
import axios from "axios";
import { NButton, NCard, NDataTable, NModal, useMessage } from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import type { FilterOptionValue } from "naive-ui/es/data-table/src/interface";
import { NhansuPost } from "#components";
import dayjs from "dayjs";

export default defineComponent({
  setup() {
    // Define reactive variables
    const data = ref<UserData[]>([]);
    const loading = ref(false);
    const time = ref("");
    const showModal = ref(false);
    const showModal_2 = ref(false);
    const editUserData = ref<UserData | null>(null);
    const accountStatus = ref("");
    const accstatus = ref("");
    const token = ref("");

    // Retrieve token from sessionStorage safely
    if (typeof window !== "undefined" && window.sessionStorage) {
      token.value = `Bearer ${useUserStore()?.userInfo?.token}`;
      console.log(token.value);
    }

    // Fetch user data from API with authentication token
    async function fetchData() {
      loading.value = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/users",
          {
            headers: {
              Authorization: token.value,
            },
          },
        );

        console.log("API Response:", response);
        console.log("Response data:", response.data);

        if (
          response.data &&
          response.data.status === true &&
          response.data.data &&
          Array.isArray(response.data.data.data)
        ) {
          data.value = response.data.data.data;
        } else {
          console.error("Unexpected API response format:", response.data);
          throw new Error("Unexpected API response format");
        }

        console.log("Data successfully loaded:", data.value);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert(
          `Failed to load users: ${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        loading.value = false;
      }
    }

    // Handle Edit action
    const editUser = async (row: UserData) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/users/${row.id}`,
          {
            headers: {
              Authorization: token.value,
            },
          },
        );
        editUserData.value = response.data.data;
        showModal_2.value = true;
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details");
      }
    };

    // Handle Save Changes action
    const saveChanges = async () => {
      if (!editUserData.value) return;
      try {
        console.log("Updating user data:", editUserData.value);
        await axios.put(
          `http://localhost:3000/api/admin/users/${editUserData.value.id}`,
          editUserData.value,
          {
            headers: {
              Authorization: token.value,
            },
          },
        );
        alert("User updated successfully");
        showModal_2.value = false;
        fetchData();
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user");
      }
    };

    // Handle Delete action
    const deleteUser = async (row: UserData) => {
      if (!confirm(`Are you sure you want to delete ${row.username}?`)) return;
      try {
        console.log(`Deleting user with ID: ${row.id}`);
        const response = await axios.delete(
          `http://localhost:3000/api/admin/users`,
          {
            headers: {
              Authorization: token.value,
            },
            data: { ids: [row.id] },
          },
        );
        console.log("Delete response:", response);
        alert("User deleted successfully");
        fetchData(); // Refresh the table
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(
          `Failed to delete user: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    // Filter status method
    const filterStatus = () => {
      console.log("Filtering status...");
      // Add your filter logic here
    };

    // Fetch data when the component is mounted
    onMounted(fetchData);

    // Data for edit user
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

    return {
      fetchData,
      data,
      loading,
      columns: createColumns(editUser, deleteUser),
      time,
      accountStatus,
      filterStatus,
      accstatus,
      showModal,
      showModal_2,
      editUserData,
      pagination: {
        pageSize: 10,
      },
      options: [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ],
      statusoptions: [
        { label: "Hoạt động", value: "true", type: "default" },
        { label: "Không hoạt động", value: "false", type: "default" },
      ],
      saveChanges,
      cancelClick() {
        showModal.value = false;
      },
      branchOptions,
      organizationOptions,
      permissionGroupOptions,
      branchPotition,
    };
  },
});

// Define TypeScript interface for user data
interface UserData {
  stt: number;
  id: string;
  password: string;
  created_at: string;
  username: string;
  avatar?: string;
  email: string;
  full_name: string;
  is_active: boolean;
  salary?: number;
  salary_type?: number;
  position: number;
  center_id: string;
  organ_struct_id?: string;
  permission_grp_id: string;
  branch_id?: string; // Add branch_id to the UserData interface
}

// Define table columns
function createColumns(
  editUser: (row: UserData) => void,
  deleteUser: (row: UserData) => void,
): DataTableColumns<UserData> {
  return [
    {
      type: "selection",
    },
    { title: "STT", key: "stt", render: (_, index) => index + 1 },
    { title: "Tên người dùng", key: "username" },
    { title: "Họ và tên", key: "full_name" },
    {
      title: "Ảnh đại diện",
      key: "avatar",
      render(row) {
        return h("img", {
          src: row.avatar || "",
          alt: "Avatar",
          style: "width: 40px; height: 40px; border-radius: 50%",
        });
      },
    },
    {
      title: "Trạng thái tài khoản",
      key: "accstatus",
      render(row) {
        let color = "";
        let background = "";
        if (row.is_active === true) {
          color = "#00974F";
          background = "#F0FFF8";
        } else if (row.is_active === false) {
          color = "#4D6FA8";
          background = "#ECF1F9";
        } else {
          color = "gray";
        }
        return h(
          "span",
          {
            style: {
              padding: "5px 10px",
              borderRadius: "10px",
              color,
              background,
            },
          },
          row.is_active ? "Hoạt động" : "Không hoạt động",
        );
      },
      defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
      filter(value: FilterOptionValue, row: UserData) {
        return row.is_active === (value === "Hoạt động");
      },
    },
    {
      title: "Lương",
      key: "salary",
      render: (row) =>
        row.salary ? row.salary.toLocaleString() + " VND" : "N/A",
    },
    {
      title: "Ngày tạo",
      key: "created_at",
      render(row) {
        return dayjs(row.created_at).format("YYYY-MM-DD");
      },
    },

    {
      title: "Actions",
      key: "actions",
      render(row) {
        return h("div", [
          h(
            NButton,
            {
              size: "small",
              quaternary: true,
              style: { backgroundColor: "transparent", color: "blue" },
              onClick: () => editUser(row),
            },
            {
              default: () =>
                h("i", {
                  class: "fa-regular fa-pen-to-square",
                }),
            },
          ),
          h(
            NButton,
            {
              size: "small",
              quaternary: true,
              style: { backgroundColor: "transparent", color: "red" },
              onClick: () => deleteUser(row),
            },
            { default: () => h("i", { class: "fa-solid fa-trash" }) },
          ),
        ]);
      },
    },
  ];
}
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->

      <n-card class="h-full bg-gray-50">
        <n-grid
          class="min-h-fit w-full"
          :x-gap="70"
          cols="1 m:12"
          responsive="screen"
        >
          <n-gi span="1 m:12">
            <n-form-item>
              <n-input
                span="5"
                type="text"
                placeholder="Tìm kiếm tên nhân sự"
                style="margin-right: 20px"
              />
              <n-select
                v-model="time"
                :options="options"
                placeholder="Tất cả cơ cấu tổ chức"
                style="margin-right: 20px"
              />
              <n-select
                v-model="accountStatus"
                :options="statusoptions"
                @change="filterStatus"
                placeholder="Tất cả nhóm quyền"
                style="margin-right: 20px"
              />
              <n-select
                v-model="time"
                :options="options"
                placeholder="Tất cả chi nhánh"
                style="margin-right: 20px"
              />
              <n-select
                v-model:value="accountStatus"
                :options="statusoptions"
                @update:value="fetchData"
                placeholder="Tất cả trạng thái"
                style="margin-right: 20px"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="2 m:12">
            <n-grid
              class="-mt-8 w-full"
              :x-gap="30"
              cols="2 m:8"
              responsive="screen"
            >
              <n-gi span="2 m:4" class="flex-cols-3 flex gap-x-10">
                <n-form-item>
                  <n-button
                    round
                    type="info"
                    class="h-12 w-48 rounded-2xl text-xl"
                    @click="showModal = true"
                  >
                    Thêm mới
                    <i class="fa-solid fa-plus ml-3"></i>
                  </n-button>
                  <n-modal
                    v-model:show="showModal"
                    title="Thêm mới"
                    :mask-closable="false"
                    @positive-click="saveChanges"
                    @negative-click="cancelClick"
                  >
                    <NhansuPost />
                  </n-modal>
                </n-form-item>
              </n-gi>
              <n-gi span="4" class="flex-cols-6 flex gap-x-10 justify-self-end">
                <n-form-item>
                  <n-button type="info" ghost>
                    Cài đặt nhóm quyền
                    <Icon
                      name="icomoon-free:tree"
                      width="24"
                      height="24"
                      style="margin-left: 5px"
                    />
                  </n-button>
                </n-form-item>

                <n-form-item>
                  <n-button type="info">
                    Thêm từ file
                    <Icon
                      name="fe:import"
                      width="24"
                      height="24"
                      style="margin-left: 5px"
                    />
                  </n-button>
                </n-form-item>

                <n-form-item>
                  <n-button type="info">
                    Xuất file
                    <Icon
                      name="fe:export"
                      width="24"
                      height="24"
                      style="margin-left: 5px"
                    />
                  </n-button>
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-gi>
          <n-gi span="1 m:12">
            <n-card title="Danh sách nhân sự">
              <n-data-table
                :loading="loading"
                :columns="columns"
                :data="data"
                :pagination="pagination"
                :bordered="false"
              />
            </n-card>
            <n-gi span="12">
              <n-form-item>
                <n-modal
                  v-model:show="showModal_2"
                  title="Chỉnh sửa người dùng"
                >
                  <n-card>
                    <n-form v-if="editUserData">
                      <n-grid cols="1 m:4" :x-gap="40" responsive="screen">
                        <n-gi cols="1 m:2">
                          <n-form-item
                            label="Họ tên nhân sự *"
                            path="full_name"
                          >
                            <n-input
                              v-model:value="editUserData.full_name"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi cols="1 m:2">
                          <n-form-item label="Tên tài khoản *" path="username">
                            <n-input
                              v-model:value="editUserData.username"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi cols="1 m:2">
                          <n-form-item label="Email *" path="email">
                            <n-input
                              v-model:value="editUserData.email"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Mật khẩu *" path="password">
                            <n-input
                              v-model:value="editUserData.password"
                              type="password"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Vai trò *" path="position">
                            <n-select
                              v-model:value="editUserData.position"
                              :options="branchPotition"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item label="Chi nhánh *" path="branch_id">
                            <n-select
                              v-model:value="editUserData.branch_id"
                              :options="branchOptions"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi>
                          <n-form-item
                            label="Cơ cấu tổ chức *"
                            path="organ_struct_id"
                          >
                            <n-select
                              v-model:value="editUserData.organ_struct_id"
                              :options="organizationOptions"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi>
                          <n-form-item
                            label="Nhóm quyền *"
                            path="permission_grp_id"
                          >
                            <n-select
                              v-model:value="editUserData.permission_grp_id"
                              :options="permissionGroupOptions"
                              class="w-80"
                            />
                          </n-form-item>
                        </n-gi>

                        <n-gi>
                          <n-form-item label="Trạng thái hoạt động:">
                            <n-switch v-model:value="editUserData.is_active" />
                          </n-form-item>
                        </n-gi>
                      </n-grid>
                      <n-button type="primary" @click="saveChanges" class="mr-2"
                        >Lưu thay đổi</n-button
                      >
                      <!-- <n-button type="primary" @click="cancelClick"
                        >Thoát</n-button
                      > -->
                    </n-form>
                  </n-card>
                </n-modal>
              </n-form-item>
            </n-gi>
          </n-gi>
        </n-grid>
      </n-card>
    </div>
  </div>
</template>
