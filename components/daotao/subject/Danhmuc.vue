<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { NButton, NDataTable } from "naive-ui";
import { message } from "ant-design-vue";

export default defineComponent({
  setup() {
    interface RowData {
      id: string;
      danhmuc: string;
      creator: string;
      date: string;
      status: string;
    }
    const paginationReactive = reactive({
      page: 1,

      pageSize: 10,
      showSizePicker: true,

      pageSizes: [5, 10, 15],
      itemCount: computed(() => data.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });
    const { restAPI } = useApi();
    const danhmucstate = ref("list");
    const danhmucId = ref("");
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Status = ref("");
    const isLoading = ref(false);
    const showDeleteModal = ref(false);

    const formValue = reactive({
      name: null,
      thumbnail: null,
      description: null,
      is_active: true,
    });
    function closeinsert() {
      danhmucstate.value = "list";
      danhmucId.value = "";
      Object.assign(formValue, {
        name: null,
        description: null,
      });
    }
    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "Danh mục",
          key: "danhmuc",
        },
        {
          title: "Người tạo",
          key: "creator",
        },
        {
          title: "Ngày tạo",
          key: "date",
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
          width: 100,
          render(row) {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
                  () => h("i", { class: "fa-regular fa-pen-to-square" }),
                ),

                h(
                  NButton,
                  {
                    size: "small",
                    quaternary: true,
                    style: { backgroundColor: "transparent", color: "red" },
                    onClick: () => delID(row),
                  },
                  () => h("i", { class: "fa-solid fa-trash" }),
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
        const { data: resData, error } = await restAPI.cms.getCategories({});

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }
        const rawData = toRaw(resData.value)?.data;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any, index) => ({
            id: item.id || "N/A",
            danhmuc: item.name || "N/A",
            creator: item.created_by.full_name || "N/A",
            date: item.created_at ? item.created_at.split("T")[0] : "N/A",

            status: item.is_active ? "Hoạt động" : "Không hoạt động",
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

    function edit(value: RowData) {
      danhmucId.value = value.id;
      danhmucinfo();
    }

    async function danhmucinfo() {
      if (danhmucId.value) {
        const { data: resData } = await restAPI.cms.getCategoryDetail({
          id: danhmucId.value,
        });
        if (resData.value?.status) {
          const data = resData.value?.data;
          formValue.name = data.name || null;
          formValue.thumbnail = data.thumbnail || null;
          formValue.description = data.description || null;
          formValue.is_active = data.is_active || null;
        }
      }
      danhmucstate.value = "info";
    }

    const handleSubmit = async (e: Event) => {
      if (isLoading.value) return;

      const { name, thumbnail, description, is_active } = formValue;
      let body = {
        name,
        thumbnail,
        description,
        is_active,
      };
      let shouldExecuteFinally = true;
      try {
        if (danhmucId.value && String(danhmucId.value).trim() !== "") {
          const { data: resUpdate, error } = await restAPI.cms.updateCategory({
            id: danhmucId.value,
            body,
          });
          if (resUpdate?.value?.status) {
            message.success("Cập nhật danh mục thành công!");
            shouldExecuteFinally = true;
          } else {
            message.warning("Đã tồn tại danh mục với tên tương tự!");
            shouldExecuteFinally = false;
            return;
          }
        } else {
          const { data: resCreate, error } = await restAPI.cms.createCategory({
            body,
          });
          if (resCreate?.value?.status) {
            message.success("Tạo danh mục thành công!");
            shouldExecuteFinally = true;
          } else {
            message.error(error.value.data.error);
            shouldExecuteFinally = false;
            return;
          }
        }
      } catch {
      } finally {
        if (shouldExecuteFinally) {
          isLoading.value = false;
          closeinsert();
          loadData();
        }
      }
    };

    const confirmDelete = async () => {
      handleDelete(danhmucId.value);
      showDeleteModal.value = false;
    };
    function delID(value: RowData) {
      danhmucId.value = value.id;
      showDeleteModal.value = true;
    }
    const handleDelete = async (e: string) => {
      if (isLoading.value) return;

      const { name, thumbnail, description, is_active } = formValue;
      let body = {
        name,
        thumbnail,
        description,
        is_active,
      };
      try {
        const { data: resUpdate } = await restAPI.cms.deleteCategory({
          id: danhmucId.value,
        });
        if (resUpdate?.value?.status) {
          message.success("Xóa danh mục thành công!");
        } else {
          message.warning("Danh mục đang được sử dụng, không thể xóa!");
        }
      } catch {
      } finally {
        isLoading.value = false;
        loadData();
        danhmucstate.value = "list";
      }
    };
    onMounted(() => {
      filterStatus();
      loadData();
    });

    return {
      showDeleteModal,
      confirmDelete,
      closeinsert,
      danhmucstate,
      isLoading,
      danhmucId,
      handleSubmit,
      formValue,
      danhmucinfo,
      Status,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,
      filterStatus() {
        if (dataTableInstRef.value) {
          if (Status.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              status: [Status.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
      },
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
          label: "Không hoạt động",
          value: "Không hoạt động",
        },
      ],
    };
  },
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1" v-show="danhmucstate === 'list'">
      <!-- Content Area -->
      <div class="h-full bg-white text-black">
        <n-grid
          class="-mt-5 min-h-fit w-full"
          :x-gap="20"
          cols="1 m:5"
          responsive="screen"
        >
          <n-gi span="2">
            <n-form-item>
              <n-input type="text" placeholder="Tìm kiếm danh mục" />
            </n-form-item>
          </n-gi>

          <n-gi span="1">
            <n-form-item>
              <n-select
                v-model="Status"
                :options="statusoptions"
                @change="
                  (() => {
                    Status = $event;
                    filterStatus();
                  })()
                "
                placeholder="Tất cả  trạng thái"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item>
              <n-button type="info" class="w-28">
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
          <n-gi style="display: flex; justify-content: flex-end">
            <n-form-item>
              <n-button type="info" class="w-28" @click="danhmucinfo">
                Thêm mới<i class="fa-solid fa-plus pl-2"></i>
              </n-button>
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:20">
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
      </div>
    </div>
    <div v-show="danhmucstate === 'info'" class="w-full">
      <n-grid cols="1" class="w-full">
        <n-gi>
          <n-grid cols="2" :x-gap="40">
            <n-gi>
              <n-gi>
                <n-form-item label="Tên danh mục" path="name">
                  <n-input
                    v-model:value="formValue.name"
                    placeholder="Nhập tên danh mục"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Mô tả" path="description">
                  <n-input
                    v-model:value="formValue.description"
                    placeholder="Nhập mô tả"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item
                  class="flex text-4xl"
                  label="Trạng thái hoạt động"
                  label-placement="left"
                  path="switchValue"
                >
                  <n-switch
                    v-model:value="formValue.is_active"
                    :unchecked-value="false"
                    :checked-value="true"
                  />
                </n-form-item>
              </n-gi>
            </n-gi>
            <n-gi
              ><n-gi>
                <n-form-item label="Ảnh đại diện khóa học" path="cover">
                  <div>
                    <img
                      src="../../../public/images/subject.png"
                      :square="false"
                      :width="250"
                      :height="150"
                      class="rounded-xl"
                    />
                    <div class="mt-2">
                      <label
                        for="cover-upload"
                        class="cursor-pointer text-sm text-blue-500 hover:underline"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="cover-upload"
                        class="hidden"
                        accept="image/*"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                    </p>
                  </div>
                </n-form-item>
              </n-gi>
            </n-gi>
          </n-grid>
        </n-gi>
        <n-gi style="display: flex; justify-content: center">
          <n-grid cols="2" :x-gap="40">
            <n-gi style="display: flex; justify-content: flex-end">
              <n-button
                round
                class="h-12 w-52 rounded-2xl text-lg text-blue-400"
                @click="closeinsert()"
              >
                Hủy
              </n-button>
            </n-gi>
            <n-gi>
              <n-button
                round
                type="info"
                :loading="isLoading"
                class="h-12 w-52 rounded-2xl text-lg"
                @click.prevent="handleSubmit"
              >
                Lưu
              </n-button>
            </n-gi>
          </n-grid>
        </n-gi>
      </n-grid>
    </div>
    <n-modal v-model:show="showDeleteModal">
      <n-card
        title="Xác nhận xóa"
        closable
        @close="showDeleteModal = false"
        style="width: 400px"
      >
        <p>Xác nhận xóa danh mục?</p>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">Hủy</n-button>
            <n-button type="error" @click="confirmDelete"> Xóa </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>
