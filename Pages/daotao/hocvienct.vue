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
    const dayjs = useDayjs();
    const { restAPI } = useApi();
    const router = useRouter();
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const activeItem = ref("Tất cả trạng thái");
    const accountStatus = ref("");

    const delModal = ref(false);
    const deleteTarget = ref<{ id: string } | null>(null);
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
        path: "hocvieninfo",
        query: { id: value.id },
      });
    }

    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          type: "selection",
        },

        {
          title: "STT",
          key: "stt",
          defaultSortOrder: "ascend",
          sorter: "default",
          titleAlign: "center",
        },
        {
          title: "Thông tin học viên",
          key: "tthv",
          defaultSortOrder: "ascend",
          sorter: "default",
        },

        {
          title: "Số môn học hoàn thành",
          key: "mhht",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Môn đã xếp lớp",
          key: "mdxl",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Ngày cập nhật",
          key: "ncn",
          defaultSortOrder: "ascend",
          sorter: "default",
          render(row) {
            return dayjs(row.ncn).format("DD-MM-YYYY");
          },
        },

        {
          title: "Trạng thái tài khoản",
          key: "accstatus",
          render(row) {
            let color = "";
            let background = "";
            switch (row.accstatus) {
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
              row.accstatus,
            );
          },
          defaultFilterOptionValues: ["Hoạt động", "Dừng hoạt động"],
          filter(value, row) {
            return row.accstatus.includes(value as string);
          },
        },
        {
          title: "Action",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h("div", [
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
                  onClick: () => openDeleteModal("single", row.id),
                },
                { default: () => h("i", { class: "fa-solid fa-trash" }) },
              ),
              h(
                NDropdown,
                {
                  trigger: "click",
                  options: actionMenu,
                  quaternary: true,
                  style: { color: "gray" },
                  onSelect(key) {
                    if (key === "Xếp lớp") {
                      edit(row);
                    } else if (key === "Dừng hoạt động") {
                    }
                  },
                },
                { default: () => h("i", { class: "fa-solid fa-ellipsis-v" }) },
              ),
            ]);
          },
        },
      ];
    }
    const data = ref<RowData[]>([]);

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const { data: resData, error } = await restAPI.cms.getStudents();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Studentsdata = rawData.data;
        if (Array.isArray(Studentsdata)) {
          data.value = Studentsdata.map((item: any, index) => ({
            id: item.id || "N/A",
            stt: index + 1,
            tthv: item.full_name || "N/A",
            mhht: item.mhht || "N/A",
            mdxl: item.mdxl || "N/A",
            ncn: item.updated_at ? item.updated_at.split("T")[0] : "N/A",

            accstatus:
              item.status === 2
                ? "Hoạt động"
                : item.status === 1
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

    const selectedRows = ref<RowData[]>([]);
    const selectedId = computed(() => selectedRows.value.map((row) => row.id));

    const massEdit = async (value: number) => {
      let successCount = 0;
      let errorCount = 0;
      const status = value;

      const updatePromises = selectedId.value.map(async (id) => {
        const row = data.value.find((row) => row.id === id);
        if (!row) return;

        try {
          const body = { status };
          const { data: resUpdate, error } = await restAPI.cms.updateStudent({
            id,
            body,
          });

          if (resUpdate?.value?.status) {
            successCount++;
          } else {
            errorCount++;
            message.error(
              error?.value?.data?.message || `Lỗi cập nhật học viên ${id}`,
            );
          }
        } catch (err) {
          errorCount++;
          message.error(
            `Lỗi cập nhật học viên ${id}: ${(err as Error).message}`,
          );
        }
        loadData();
      });

      await Promise.all(updatePromises);

      if (successCount > 0) {
        message.success(`Cập nhật thành công ${successCount} học viên!`);
      }

      if (errorCount > 0) {
        message.error(`Có ${errorCount} học viên cập nhật thất bại.`);
      }

      return selectedId.value;
    };

    const showDeleteModal = ref(false);
    const deleteType = ref("single"); // 'single' or 'mass'
    const isDeleting = ref(false);
    const deleteId = ref("");

    const openDeleteModal = (type: string, id = "") => {
      deleteType.value = type;
      deleteId.value = id;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      isDeleting.value = true;
      if (deleteType.value === "single") {
        await deleteSingleItem(deleteId.value);
      } else {
        await deleteMultipleItems();
      }
      isDeleting.value = false;
      showDeleteModal.value = false;
    };

    const deleteSingleItem = async (id: string) => {
      try {
        const body = { ids: [id] };
        const { data: resdel, error } = await restAPI.cms.deleteStudents({
          body,
        });

        if (resdel?.value?.status) {
          message.success("Xóa học viên thành công!");
          await loadData(); // Refresh the data
        } else {
          const errorCode = error.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
      } catch (err) {
        message.error("Lỗi khi xóa học viên.");
      } finally {
        isDeleting.value = false;
        delModal.value = false;
        deleteTarget.value = null;
      }
    };

    const deleteMultipleItems = async () => {
      let successCount = 0;
      let errorCount = 0;
      let body = { ids: selectedId.value };

      try {
        const { data: resdel, error } = await restAPI.cms.deleteStudents({
          body,
        });

        if (resdel?.value?.status) {
          successCount = body.ids.length;
          message.success(`Xóa thành công ${successCount} học viên!`);
        } else {
          errorCount = body.ids.length;
          const errorCode = error?.value?.data?.error;
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel?.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";
          message.warning(errorMessage);
        }
      } catch (err) {
        errorCount = body.ids.length;
        message.error(
          `Lỗi xóa ${errorCount} học viên: ${(err as Error).message}`,
        );
      }

      loadData();
    };

    return {
      isDeleting,
      deleteTarget,
      showDeleteModal,
      deleteType,
      confirmDelete,
      openDeleteModal,
      edit,
      delModal,
      activeItem,
      accountStatus,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      massEdit,
      pagination: paginationReactive,
      // filterStatus() {
      //   if (dataTableInstRef.value) {
      //     if (activeItem.value === "Tất cả trạng thái") {
      //       if (accountStatus.value == "All") {
      //         dataTableInstRef.value.filter(null);
      //       } else {
      //         dataTableInstRef.value.filter({
      //           accstatus: [accountStatus.value || ""],
      //         });
      //       }
      //     } else {
      //       if (accountStatus.value == "All") {
      //         dataTableInstRef.value.filter({
      //           status: [activeItem.value || ""],
      //         });
      //       } else {
      //         dataTableInstRef.value.filter({
      //           status: [activeItem.value || ""],
      //           accstatus: [accountStatus.value || ""],
      //         });
      //       }
      //     }
      //   }
      // },

      filterStatus() {
        if (dataTableInstRef.value) {
          if (accountStatus.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              accstatus: [accountStatus.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
        selectedRows.value = data.value.filter((row) =>
          rowKeys.includes(row.id),
        );
      },
      options: [
        {
          label: "Select",
          value: "song0",
          disabled: true,
        },
        {
          label: "A",
          value: "A",
        },
        {
          label: "B",
          value: "B",
        },
        {
          label: "C",
          value: "C",
        },
      ],
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
  tthv: string;
  mhht: string;
  mdxl: string;
  ncn: string;

  accstatus: string;
}
const actionMenu = [
  {
    title: "Xếp lớp",
    key: "Xep",
  },
  {
    title: "Dừng hoạt động",
    key: "Stop",
  },
];
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50">
          <div class="flex items-center justify-between text-[#133D85]">
            <h1 class="text-4xl font-bold">Danh sách học viên chính thức</h1>
            <n-button
              type="info"
              class="h-15 flex w-52 items-center justify-center text-center text-xl"
              @click="$router.push('hocvieninfo')"
            >
              Thêm học viên
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <!-- <div>
            <nav>
              <ul class="mt-5 flex flex-row gap-5 text-xl text-gray-400">
                <li class="cursor-pointer duration-75 hover:text-blue-500">
                  <NuxtLink
                    to="#"
                    @click="
                      (() => {
                        activeItem = 'Tất cả trạng thái';
                        filterStatus();
                      })()
                    "
                    :class="{
                      'text-blue-500 underline underline-offset-8 duration-150':
                        activeItem === 'Tất cả trạng thái',
                    }"
                  >
                    Tất cả trạng thái
                  </NuxtLink>
                </li>
                <li class="cursor-pointer duration-75 hover:text-blue-500">
                  <NuxtLink
                    to="#"
                    @click="
                      (() => {
                        activeItem = 'Đang học';
                        filterStatus();
                      })()
                    "
                    :class="{
                      'text-blue-500 underline underline-offset-8 duration-150':
                        activeItem === 'Đang học',
                    }"
                  >
                    Đang học
                  </NuxtLink>
                </li>
                <li class="cursor-pointer duration-75 hover:text-blue-500">
                  <NuxtLink
                    to="#"
                    @click="
                      (() => {
                        activeItem = 'Chưa xếp lớp';
                        filterStatus();
                      })()
                    "
                    :class="{
                      'text-blue-500 underline underline-offset-8 duration-150':
                        activeItem === 'Chưa xếp lớp',
                    }"
                  >
                    Chưa xếp lớp
                  </NuxtLink>
                </li>
                <li class="cursor-pointer duration-75 hover:text-blue-500">
                  <NuxtLink
                    to="#"
                    @click="
                      (() => {
                        activeItem = 'Bảo lưu';
                        filterStatus();
                      })()
                    "
                    :class="{
                      'text-blue-500 underline underline-offset-8 duration-150':
                        activeItem === 'Bảo lưu',
                    }"
                  >
                    Bảo lưu
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div> -->

          <n-grid
            class="min-h-fit w-full"
            :x-gap="70"
            cols="1 m:3"
            responsive="screen"
          >
            <n-gi span="1">
              <n-form-item>
                <n-input
                  type="text"
                  placeholder="Tìm kiếm tên, số điện thoại, email học viên"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1">
              <n-form-item>
                <n-select :options="options" placeholder="Tuần này" />
              </n-form-item>
            </n-gi>
            <n-gi span="1">
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
                  placeholder="Trạng thái tài khoản"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:3">
              <n-grid
                class="-mt-8 w-full"
                :x-gap="30"
                cols="1 m:3"
                responsive="screen"
              >
                <n-gi span="1 m:2" class="flex-cols-3 flex gap-x-10">
                  <n-form-item>
                    <n-button type="info" @click="massEdit(1)">
                      Dừng hoạt động
                    </n-button>
                  </n-form-item>
                  <n-form-item>
                    <n-button type="info" @click="massEdit(2)">
                      Hoạt động
                    </n-button>
                  </n-form-item>
                  <n-form-item>
                    <n-button
                      type="error"
                      ghost
                      @click="openDeleteModal('multiple')"
                    >
                      <i class="fa-solid fa-trash mr-1"></i>
                      Xóa lựa chọn
                    </n-button>
                  </n-form-item>
                </n-gi>
                <n-gi
                  span="1"
                  class="flex-cols-3 flex gap-x-10 justify-self-end"
                >
                  <n-form-item>
                    <n-button type="info">
                      Import học viên
                      <i class="fa-solid fa-cloud-arrow-up ml-1"></i>
                    </n-button>
                  </n-form-item>
                  <n-form-item>
                    <n-button type="info">
                      Xuất file
                      <i class="fa-solid fa-file-export ml-1"></i>
                    </n-button>
                  </n-form-item>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi span="1 m:3">
              <n-data-table
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :scroll-x="1000"
                :pagination="pagination"
                :row-key="rowKey"
                @update:checked-row-keys="handleCheck"
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
        <p v-if="deleteType === 'single'">
          Bạn có chắc chắn muốn xóa học viên này không?
        </p>
        <p v-else>Bạn có chắc chắn muốn xóa các học viên đã chọn không?</p>
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
