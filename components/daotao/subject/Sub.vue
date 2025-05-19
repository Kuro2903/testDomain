<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { NButton, NDataTable, NDropdown, NInputNumber } from "naive-ui";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

import { message } from "ant-design-vue";

// Định nghĩa interface cho dữ liệu bảng
interface RowData {
  created_at: string;
  id: string;
  stt: number;
  monhoc: string;
  danhmuc: string;
  hocphi: number;
  sobuoi: number;
  solop: number;
  hocvien: number;
  date: string;
  status: string;
  input_require: string;
  output_require: string;
  fee_type: number | string;
  thumbnail: string;
  total_lessons: number;
  origin_fee: number;
  discount_fee: number;
  color: string;
  teacher: string;
  code: string;
}

export default defineComponent({
  name: "SubjectComponent",
  setup() {
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

    const router = useRouter();
    const delModal = ref(false);
    const data = ref<RowData[]>([]);
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Danhmuclist = ref("");
    const Status = ref("");
    const { restAPI } = useApi();
    const loading = ref(false);
    const danhmucoptions = ref([{ label: "Tất cả danh mục", value: "All" }]);
    const danhmucstate = ref<"info" | "list">("list");
    const danhmucId = ref<string>("");
    const formValue = reactive({
      name: "",
      description: "",
      is_active: true,
      input_require: "",
      output_require: "",
      fee_type: "",
      total_lessons: 0,
      thumbnail: "",
      code: "",
      origin_fee: 0,
      discount_fee: 0,
      color: "",
      teacher: "",
    });
    const isLoading = ref<boolean>(false);
    const railStyle = { backgroundColor: "#ccc" };

    async function fetchData() {
      loading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getSubjects({});

        if (error?.value) {
          console.error(
            "Error fetching data:",
            error?.value?.data?.message || "Lỗi tải dữ liệu",
          );
          return;
        }

        const subjects = resData.value.data.subjects;
        data.value = subjects.map((subject: any, index: number) => ({
          id: subject.id,
          code: subject.code,
          stt: index + 1,
          monhoc: subject.name,
          danhmuc: subject.category ? subject.category.name : "",
          hocphi: subject.origin_fee,
          sobuoi: subject.total_lessons,
          solop: subject.class_total,
          hocvien: subject.student_pendings,
          date: subject.created_at,
          input_require: subject.input_require,
          output_require: subject.output_require,
          fee_type: subject.fee_type,
          total_lessons: subject.total_lessons,
          thumbnail: subject.thumbnail,
          origin_fee: subject.origin_fee,
          discount_fee: subject.discount_fee,
          status: subject.is_active ? "Hoạt động" : "Không hoạt động",
          color: subject.metadata?.color || "",
        }));
        console.log(data.value);

        // Lấy danh mục từ subjects
        const categorySet = new Set<string>();
        subjects.forEach((subject: any) => {
          if (subject.category && subject.category.name) {
            categorySet.add(subject.category.name);
          }
        });
        danhmucoptions.value = [
          { label: "Tất cả danh mục", value: "All" },
          ...Array.from(categorySet).map((name) => ({
            label: name,
            value: name,
          })),
        ];
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      fetchData();
    });

    function edit(value: RowData) {
      router.push({
        path: "monhocinfo",
        query: { id: value.id, num: value.sobuoi },
      });
    }

    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "STT",
          key: "stt",
          titleAlign: "center",
        },
        {
          title: "Môn học",
          key: "monhoc",
        },
        {
          title: "Danh mục",
          key: "danhmuc",
          filter(value, row) {
            return row.danhmuc.includes(value as string);
          },
        },
        {
          title: "Học phí(VNĐ)",
          key: "hocphi",
          defaultSortOrder: "ascend",
          sorter: "default",
          render(row) {
            return row.fee_type == 1 ? "miễn phí" : row.hocphi;
          },
        },
        {
          title: "Số buổi",
          key: "sobuoi",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Số lớp",
          key: "solop",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Số học viên chưa xếp lớp",
          key: "chuaxep",
          defaultSortOrder: "ascend",
          sorter: "default",
        },
        {
          title: "Ngày tạo",
          key: "created_at",
          defaultSortOrder: "ascend",
          sorter: "default",
          render(row) {
            return dayjs(row.created_at).format("DD-MM-YYYY");
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
          defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
          filter(value, row) {
            return row.status.includes(value as string);
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
                  onclick: () => edit(row),
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
                  onclick: () => deleteSub(row),
                },
                { default: () => h("i", { class: "fa-solid fa-trash" }) },
              ),
            ]);
          },
        },
      ];
    }

    // lấy thông tin subject theo id
    async function getSubjectDetail(id: string) {
      const { data: resData, error } = await restAPI.cms.getSubjectDetail({
        id,
      });
      if (error) {
        console.error("Lỗi lấy thông tin subject theo id:", error);
        return null;
      } else {
        console.log("Thông tin subject:", resData);
        return resData;
      }
    }
    // API lấy thông tin subject theo id
    const editRow = async (row: RowData) => {
      if (!row.id) {
        console.error("Không tìm thấy id môn học", row);
        return;
      }

      console.log("Edit row:", row);
      router.push({
        path: "monhocinfo",
        query: { id: row.id.toString() },
      });
      message.success(`Chỉnh sửa lớp học : ${row.monhoc}`);
    };

    const handleSubmit = async () => {
      isLoading.value = true;
      try {
        const payload = {
          id: danhmucId.value,
          name: formValue.name,
          is_active: formValue.is_active,
          description: formValue.description,
          input_require: formValue.input_require,
          output_require: formValue.output_require,
          code: formValue.code,
          fee_type: Number(formValue.fee_type),
          total_lessons: formValue.total_lessons,
          origin_fee: formValue.origin_fee,
          discount_fee: formValue.discount_fee,
          metadata: {
            color: formValue.color,
          },
          thumbnail: formValue.thumbnail,
        };

        console.log("Payload gửi đi:", payload);

        const { data: response, error } =
          await restAPI.cms.updateSubject(payload);

        if (error?.value) {
          console.error("Lỗi cập nhật môn học:", error.value);
          message.error(
            error.value?.data?.message || "Cập nhật môn học thất bại",
          );
          return;
        }

        message.success("Cập nhật môn học thành công");

        const index = data.value.findIndex(
          (subject) => subject.id === danhmucId.value,
        );
        if (index !== -1) {
          data.value[index].monhoc = formValue.name;
          data.value[index].status = formValue.is_active
            ? "Hoạt động"
            : "Không hoạt động";
        }
        console.log("Môn học đã được cập nhật:", response.data);
        danhmucstate.value = "list";
        danhmucId.value = "";
      } catch (error: any) {
        console.error(
          "Lỗi cập nhật môn học:",
          error.response?.data || error.message,
        );
      } finally {
        isLoading.value = false;
      }
    };

    const cancelEdit = () => {
      danhmucstate.value = "list";
      danhmucId.value = "";
    };

    const deleteSub = async (row: RowData) => {
      if (confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
        try {
          const { error } = await restAPI.cms.deleteSubject({
            body: { id: row.id },
          });

          if (error?.value) {
            message.error(error.value.data?.message || "Lỗi khi xóa môn học.");
            console.log("body", { id: row.id });
            return;
          }

          data.value = data.value.filter((subject) => subject.id !== row.id);
          message.success("Môn học đã được xóa thành công.");
        } catch (err) {
          console.error("Lỗi xóa môn học:", err);
          message.error("Lỗi xóa môn học.");
        }
      }
    };

    return {
      delModal,
      edit,
      Status,
      Danhmuclist,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,
      filterStatus() {
        if (dataTableInstRef.value) {
          if (Danhmuclist.value === "All") {
            if (Status.value == "All") {
              dataTableInstRef.value.filter(null);
            } else {
              dataTableInstRef.value.filter({
                status: [Status.value || ""],
              });
            }
          } else {
            if (Status.value == "All") {
              dataTableInstRef.value.filter({
                danhmuc: [Danhmuclist.value || ""],
              });
            } else {
              dataTableInstRef.value.filter({
                danhmuc: [Danhmuclist.value || ""],
                status: [Status.value || ""],
              });
            }
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
      },
      danhmucoptions,
      statusoptions: [
        { label: "All", value: "All" },
        { label: "Hoạt động", value: "Hoạt động" },
        { label: "Không hoạt động", value: "Không hoạt động" },
      ],
      danhmucstate,
      danhmucId,
      formValue,
      isLoading,
      cancelEdit,
      railStyle,
      handleSubmit,
    };
  },
});

function createColumns(
  editRow: (row: RowData) => void,
  deleteSub: (row: RowData) => void,
): DataTableColumns<RowData> {
  return [
    {
      title: "STT",
      key: "stt",
      titleAlign: "center",
    },
    { title: "Mã môn học", key: "code" },
    {
      title: "Tên Môn học",
      key: "monhoc",
    },

    {
      title: "Danh mục",
      key: "danhmuc",
      filter(value, row) {
        return row.danhmuc.includes(value as string);
      },
    },
    {
      title: "Học phí(VNĐ)",
      key: "hocphi",
      sorter: "default",
      render(row) {
        return row.fee_type == 1
          ? "miễn phí"
          : Number(row.hocphi).toLocaleString("en-US");
      },
    },

    {
      title: "Số buổi",
      key: "sobuoi",
      sorter: "default",
    },
    {
      title: "Số lớp",
      key: "solop",
      sorter: "default",
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
      defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
      filter(value, row) {
        return row.status.includes(value as string);
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
              onclick: () => editRow(row),
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
              onclick: () => deleteSub(row),
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
              <n-input type="text" placeholder="Tìm kiếm mã, tên môn học" />
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-form-item>
              <n-select
                v-model="Danhmuclist"
                :options="danhmucoptions"
                placeholder="Danh mục"
                @change="
                  (() => {
                    Danhmuclist = $event;
                    filterStatus();
                  })()
                "
              />
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
                placeholder="Tất cả trạng thái"
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
              @update:checked-row-keys="handleCheck"
            />
          </n-gi>
        </n-grid>
      </div>
    </div>
  </div>
</template>
