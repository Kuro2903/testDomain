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
import { NButton, NDataTable, NDropdown } from "naive-ui";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const tagColorMap = new Map();

    // 🎨 Define a color palette
    const colorPalette = [
      { color: "#2563EB", background: "#EFF6FF" }, // Blue
      { color: "#D97706", background: "#FFF7ED" }, // Orange
      { color: "#10B981", background: "#ECFDF5" }, // Green
      { color: "#9333EA", background: "#F3E8FF" }, // Purple
      { color: "#F43F5E", background: "#FFE4E6" }, // Pink
      { color: "#0EA5E9", background: "#E0F2FE" }, // Sky Blue
      { color: "#F59E0B", background: "#FEF3C7" }, // Yellow
      { color: "#14B8A6", background: "#CCFBF1" }, // Teal
      { color: "#64748B", background: "#F1F5F9" }, // Gray
      { color: "#8B5CF6", background: "#EDE9FE" }, // Indigo
      { color: "#22C55E", background: "#DCFCE7" }, // Emerald
      // { color: "#DB2777", background: "#FCE7F3" }, // Rose
      // { color: "#DC2626", background: "#FEE2E2" }, // Red
    ];

    const message = useMessage();
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
    const showDeleteModal = ref(false);
    const isDeleting = ref(false);
    const deleteId = ref("");
    const PermId = ref("");
    const dayjs = useDayjs();
    const { restAPI } = useApi();
    const router = useRouter();
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const activeItem = ref("Tất cả trạng thái");
    const accountStatus = ref("");

    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    onMounted(() => {
      loadData();
      filterStatus();
    });

    function edit(value: RowData) {
      router.push({
        path: "pqinfo",
        query: { id: value.id },
      });
    }
    function delID(value: RowData) {
      PermId.value = value.id;
      showDeleteModal.value = true;
    }
    const confirmDelete = async () => {
      isDeleting.value = true;
      await handleDelete(PermId.value);
      isDeleting.value = false;
      showDeleteModal.value = false;
    };

    const handleDelete = async (e: string) => {
      try {
        const body = { ids: [PermId.value] };
        const { data: resdel, error } =
          await restAPI.cms.deletePermissionGroups({
            body,
          });
        if (resdel?.value?.status) {
          message.success("Xóa nhóm phân quyền thành công!");
        } else {
          const errorCode = error.value.data.error;
          console.log(errorCode);
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
      } catch {
      } finally {
        loadData();
      }
    };
    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "STT",
          key: "stt",
          defaultSortOrder: "ascend",
          sorter: "default",
          titleAlign: "center",
          align: "center",
          width: "80px",
        },

        {
          title: "Tên nhóm quyền",
          key: "name",
          defaultSortOrder: "ascend",
          sorter: "default",
        },

        {
          title: "Phân quyền",
          key: "tags",
          render(row) {
            if (!row.tags || !Array.isArray(row.tags)) return "N/A";

            return h(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  alignItems: "center",
                },
              },
              [
                ...row.tags.slice(0, 4).map((tagText) => {
                  const tagName = tagText.split("(")[0].trim();

                  if (!tagColorMap.has(tagName)) {
                    const colorIndex = tagColorMap.size % colorPalette.length;
                    tagColorMap.set(tagName, colorPalette[colorIndex]);
                  }
                  const tagStyle = tagColorMap.get(tagName);

                  return h(
                    "span",
                    {
                      style: {
                        color: tagStyle.color,
                        background: tagStyle.background,
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                      },
                    },
                    tagText,
                  );
                }),

                row.tags.length > 3
                  ? h(
                      "span",
                      {
                        style: {
                          color: "#DC2626",
                          background: "#FEE2E2",
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "inline-block",
                          whiteSpace: "nowrap",
                        },
                      },
                      `+${row.tags.length - 3}`,
                    )
                  : null,
              ],
            );
          },
        },

        {
          title: "Ngày tạo",
          key: "cre_date",
          defaultSortOrder: "ascend",
          sorter: "default",
          render(row) {
            return dayjs(row.cre_date).format("DD-MM-YYYY");
          },
        },

        {
          title: "Trạng thái",
          key: "status",
          render(row) {
            let color = "";
            let background = "";
            switch (row.status) {
              case "Hoạt động":
                color = "#00974F";
                background = "#F0FFF8";
                break;
              case "Dừng hoạt động":
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
              row.status,
            );
          },
          defaultFilterOptionValues: ["Hoạt động", "Dừng hoạt động"],
          filter(value, row) {
            return row.status.includes(value as string);
          },
        },
        {
          title: "Action",
          key: "actions",
          titleAlign: "center",
          width: "100px",
          render(row) {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              },
              [
                h(
                  NButton,
                  {
                    size: "small",
                    quaternary: true,
                    style: { backgroundColor: "transparent", color: "green" },
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
                    onClick: () => delID(row),
                  },
                  { default: () => h("i", { class: "fa-solid fa-trash" }) },
                ),
              ],
            );
          },
        },
      ];
    }
    const data = ref<RowData[]>([]);

    const loadData = async () => {
      try {
        const { data: resData, error } =
          await restAPI.cms.getPermissionGroups();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        console.log(rawData);
        const Permisdata = rawData.data;
        if (Array.isArray(Permisdata)) {
          data.value = Permisdata.map((item: any, index) => ({
            id: item.id || "N/A",
            stt: index + 1,
            name: item.name || "N/A",
            tags: item.tags
              ? item.tags.map((tag) => `${tag.name}(${tag.countSelected})`)
              : [],
            cre_date: item.created_at ? item.created_at.split("T")[0] : "N/A",
            status: item.is_active
              ? "Hoạt động"
              : item.is_active === false
                ? "Dừng hoạt động"
                : "N/A",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    return {
      colorPalette,
      tagColorMap,
      showDeleteModal,
      isDeleting,
      deleteId,
      confirmDelete,
      edit,
      activeItem,
      accountStatus,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              status: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      statusoptions: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "Hoạt động",
          value: "Hoạt động",
        },
        {
          label: "Dừng hoạt động",
          value: "Dừng hoạt động",
        },
      ],
    };
  },
});
interface RowData {
  id: string;
  stt: number;
  name: string;
  tags: [];
  cre_date: string;

  status: string;
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
            <h1 class="text-4xl font-bold">Cài đặt nhóm quyền</h1>
            <n-button
              type="info"
              class="h-15 text-md flex w-44 items-center justify-center text-center"
              @click="$router.push('pqinfo')"
            >
              Thêm nhóm quyền
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <n-grid
            class="min-h-fit w-full"
            :x-gap="40"
            cols="1 m:9"
            responsive="screen"
          >
            <n-gi span="3">
              <n-form-item>
                <n-input
                  type="text"
                  placeholder="Tìm kiếm tên, số điện thoại, email học viên"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2">
              <n-form-item>
                <n-select
                  v-model="accountStatus"
                  :options="statusoptions"
                  @change="
                    (() => {
                      accountStatus = $event;
                      filterStatus();
                    })()
                  "
                  placeholder="Trạng thái nhóm quyền"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="3"></n-gi>
            <n-gi span="1" class="flex justify-end">
              <n-form-item>
                <n-button type="info" class="w-28">
                  Xuất file
                  <i class="fa-solid fa-file-export pl-2"></i>
                </n-button>
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:9">
              <n-data-table
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :scroll-x="1000"
                :pagination="pagination"
                :row-key="rowKey"
              />
            </n-gi>
          </n-grid>
        </n-card>
      </div>
    </div>
    <n-modal v-model:show="showDeleteModal">
      <n-card
        title="Xác nhận xóa"
        @close="showDeleteModal = false"
        style="width: 400px"
      >
        <p>Bạn có chắc chắn muốn nhóm phân quyền này không?</p>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">Hủy</n-button>
            <n-button type="error" @click="confirmDelete" :loading="isDeleting">
              Xóa
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>
