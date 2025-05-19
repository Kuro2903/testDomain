<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
} from "vue";
import { NButton, NDataTable, useMessage } from "naive-ui";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const delref = ref<{
      setAddNew: (title: string) => void;
    } | null>(null);
    const itemId = ref<string | null>(null);

    const message = useMessage();
    const loading = ref(false);
    const paginationReactive = reactive({
      page: 1,
      pageSize: 9,
      showSizePicker: true,
      pageSizes: [3, 5, 7, 9, 12],
      itemCount: computed(() => data.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });

    const dayjs = useDayjs();
    const { restAPI } = useApi();
    const router = useRouter();
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const activeItem = ref("Tất cả trạng thái");
    const accountStatus = ref("");
    const Brancharray = ref([]);
    const PermissionGrouparray = ref([]);
    const selectedOrg = ref(null);
    const selectedBranch = ref(null);
    const selectedPosition = ref(null);
    const selectedPermission_grp = ref(null);
    onMounted(() => {
      loadData();
      fetchBranch_id();
      fetchPermissonGroup();
    });
    function edit(value: RowData) {
      router.push({
        path: "giangvieninfo",
        query: { id: value.id },
      });
    }
    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "STT",
          key: "stt",
          defaultSortOrder: "ascend",
          sorter: "default",
          titleAlign: "center",
        },
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
          key: "is_active",
          render(row) {
            let color = "";
            let background = "";
            switch (row.is_active) {
              case "Hoạt động":
                color = "#00974F";
                background = "#F0FFF8";
                break;
              case "Không hoạt động":
                color = "#4D6FA8";
                background = "#ECF1F9";
                break;
              default:
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
              row.is_active,
            );
          },
          defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
          filter(value, row) {
            return row.is_active.includes(value as string);
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
          titleAlign: "center",
          render(row) {
            return h("div", [
              h(
                NButton,
                {
                  size: "small",
                  quaternary: true,
                  style: { backgroundColor: "transparent", color: "blue" },
                  onClick: () => edit(row),
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
                  onClick: () => showDeleteModal("Xóa nhân viên?", row.id),
                },
                { default: () => h("i", { class: "fa-solid fa-trash" }) },
              ),
            ]);
          },
        },
      ];
    }
    const data = ref<RowData[]>([]);
    const filteredData = computed(() => {
      return data.value.filter((item) => {
        if (selectedOrg.value && item.organ_struct_id !== selectedOrg.value) {
          return false;
        }

        if (selectedBranch.value && item.branch_id !== selectedBranch.value) {
          return false;
        }

        if (
          selectedPosition.value &&
          item.position !== selectedPosition.value
        ) {
          return false;
        }

        if (
          selectedPermission_grp.value &&
          item.permission_grp_id !== selectedPermission_grp.value
        ) {
          return false;
        }

        // if (
        //   searchKeyword.value &&
        //   !item.full_name
        //     .toLowerCase()
        //     .includes(searchKeyword.value.toLowerCase()) &&
        //   !item.username
        //     .toLowerCase()
        //     .includes(searchKeyword.value.toLowerCase())
        // ) {
        //   return false;
        // }

        return true;
      });
    });
    const loadData = async () => {
      loading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getStaff();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Teachersdata = rawData.data;
        if (Array.isArray(Teachersdata)) {
          data.value = Teachersdata.map((item: any, index) => ({
            id: item.id,
            stt: index + 1,
            username: item.username,
            full_name: item.full_name,
            avatar: item.avatar,
            created_at: item.created_at ? item.created_at.split("T")[0] : "N/A",
            salary: item.salary || 0,
            organ_struct_id: item.organ_struct_id,
            branch_id: item.branch_id,
            position: item.position,
            permission_grp_id: item.permission_grp_id,
            is_active:
              item.is_active === true
                ? "Hoạt động"
                : item.is_active === false
                  ? "Không hoạt động"
                  : "N/A",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
        loading.value = false;
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    const fetchBranch_id = async () => {
      try {
        const { data: resData } = await restAPI.cms.getBranches({});

        if (resData.value?.status) {
          Brancharray.value = resData.value.data
            .map(
              ({
                id,
                Name,
                address,
              }: {
                id: string;
                Name: string;
                address: string;
              }) => ({
                id,
                display: `${Name}: ${address}`,
              }),
            )
            .sort((a: { display: string }, b: { display: string }) =>
              a.display.localeCompare(b.display),
            );
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
            .map(({ id, name }: { id: string; name: string }) => ({
              id,
              name,
            }))
            .sort((a: { name: string }, b: { name: string }) =>
              a.name.localeCompare(b.name),
            );
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

    const handleFormSubmit = async (body: { id?: string }) => {
      if (body.id) {
        const id = body.id;
        await updateStaff(body, id);
      } else {
        await createStaff(body);
      }
      loadData();
    };
    const createStaff = async (body: object) => {
      const { data: resCreate, error } = await restAPI.cms.createStaff({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo nhân viên thành công!");
      } else {
        const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resCreate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";
        message.warning(errorMessage);
      }
    };

    const updateStaff = async (body: object, id: string) => {
      const { data: resUpdate, error } = await restAPI.cms.updateStaff({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật nhân viên thành công!");
      } else {
        const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resUpdate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    };

    const showDeleteModal = (title: string, id: string) => {
      itemId.value = id;
      if (delref.value) {
        delref.value.setAddNew(title);
      }
    };

    const handleConfirmDelete = async () => {
      if (itemId.value !== null) {
        const body = {
          ids: [itemId.value],
        };
        console.log(JSON.stringify(body, null, 2));
        const { data: delData, error } = await restAPI.cms.deleteStaff({
          body,
        });
        if (delData?.value?.status) {
          message.success("Xóa nhân viên thành công!");
        } else {
          const errorCode: keyof typeof ERROR_CODES = error.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode] ||
            delData?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
        itemId.value = null;
        const { data } = await restAPI.cms.getShift({});
        const sessions = data.value.data.data.filter((session) =>
          session.title.includes(itemId.value),
        );
        for (const session of sessions) {
          try {
            await restAPI.cms.deleteShift({ id: session.id });
          } catch (error) {
            console.error(`Failed to delete session ${session.id}:`, error);
          }
        }

        console.log(sessions);
        loadData();
      }
    };
    return {
      selectedPosition,
      selectedBranch,
      selectedPermission_grp,
      Brancharray,
      PermissionGrouparray,
      delref,
      handleConfirmDelete,
      handleFormSubmit,
      activeItem,
      accountStatus,
      filteredData,
      loading,
      edit,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              is_active: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      statusoptions: [
        {
          label: "Tất cả trạng thái",
          value: "",
        },
        {
          label: "Hoạt động",
          value: "Hoạt động",
        },
        {
          label: "Không hoạt động",
          value: "Không hoạt động",
        },
      ],
      positionoptions: [
        {
          label: "Tất cả vai trò",
          value: "",
        },
        { label: "Giảng viên", value: 1 },
        { label: "Trợ giảng", value: 2 },
        { label: "Nhân viên", value: 3 },
        { label: "Phân công chăm sóc", value: 4 },
      ],
    };
  },
});
interface RowData {
  id: string;
  stt: number;
  username: string;
  full_name: string;
  avatar?: string;
  created_at: string;
  salary: number;
  organ_struct_id: string;
  branch_id: string;
  position: string;
  permission_grp_id: string;
  is_active: string;
}
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50">
          <div class="flex items-center justify-between text-[#133D85]">
            <h1 class="mb-5 text-4xl font-bold">Danh sách giảng viên</h1>
          </div>
          <n-grid
            class="min-h-fit w-full"
            cols="1"
            :y-gap="20"
            responsive="screen"
          >
            <n-gi span="1">
              <n-grid cols="4" :x-gap="20" :y-gap="10" responsive="screen">
                <n-gi span="2">
                  <n-input
                    type="text"
                    placeholder="Tìm kiếm tên nhân sự"
                    style="margin-right: 20px"
                  />
                </n-gi>
                <n-gi span="1">
                  <n-select
                    v-model:value="selectedPosition"
                    :options="positionoptions"
                    placeholder="Tất cả vai trò"
                    style="margin-right: 20px"
                  />
                </n-gi>
                <n-gi>
                  <n-select
                    v-model:value="accountStatus"
                    :options="statusoptions"
                    placeholder="Tất cả trạng thái"
                    @update:value="filterStatus"
                    style="margin-right: 20px"
                  />
                </n-gi>
                <n-gi span="4">
                  <n-grid cols="3" :x-gap="20" responsive="screen">
                    <n-gi span="1">
                      <n-select
                        placeholder="Tất cả cơ cấu tổ chức"
                        style="margin-right: 20px"
                      />
                    </n-gi>
                    <n-gi>
                      <n-select
                        v-model:value="selectedPermission_grp"
                        :options="PermissionGrouparray"
                        label-field="name"
                        value-field="id"
                        placeholder="Tất cả nhóm quyền"
                        style="margin-right: 20px"
                        clearable
                      />
                    </n-gi>
                    <n-gi>
                      <n-select
                        v-model:value="selectedBranch"
                        :options="Brancharray"
                        label-field="display"
                        value-field="id"
                        placeholder="Tất cả chi nhánh"
                        style="margin-right: 20px"
                        clearable
                      />
                    </n-gi>
                  </n-grid>
                </n-gi>
                <n-gi span="2">
                  <n-button
                    round
                    type="info"
                    class="h-12 w-48 rounded-2xl text-xl"
                    @click="$router.push('giangvieninfo')"
                  >
                    Thêm mới
                    <i class="fa-solid fa-plus ml-3"></i>
                  </n-button>
                </n-gi>
                <n-gi span="2">
                  <n-space justify="end" :size="20">
                    <n-button
                      type="info"
                      ghost
                      @click="$router.push('phanquyen')"
                    >
                      Cài đặt nhóm quyền
                      <i class="fa-solid fa-sitemap pl-2"></i>
                    </n-button>

                    <n-button type="info">
                      Thêm từ file
                      <i class="fa-solid fa-file-import pl-2"></i>
                    </n-button>

                    <n-button type="info">
                      Xuất file
                      <i class="fa-solid fa-file-export pl-2"></i>
                    </n-button>
                  </n-space>
                </n-gi>
              </n-grid>
            </n-gi>

            <n-gi span="1 ">
              <n-data-table
                :loading="loading"
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="filteredData"
                :pagination="pagination"
                :row-key="rowKey"
              />
            </n-gi>
          </n-grid>
        </n-card>
      </div>
    </div>
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
