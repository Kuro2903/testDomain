<script lang="ts">
import type { DataTableColumns } from "naive-ui";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
} from "vue";
import { NButton } from "naive-ui";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    interface RowData {
      id: string;
      stt: number;
      tthv: string;
      email: string;
      accstatus: string;
      phone: number;
    }
    const message = useMessage();

    const route = useRoute();
    const classId = ref(route.params.id);
    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const router = useRouter();

    // Modal state
    const showModal = ref(false);
    const selectedStudents = ref<string[]>([]);
    const studentsList = ref<any[]>([]);

    // Modal state cho xóa học viên
    const showDeleteModal = ref(false);
    const deleteReason = ref("");
    const studentToDelete = ref<RowData | null>(null);

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

    const dayjs = useDayjs();
    const newId = route.query.id;

    onMounted(() => {
      loadData();
    });
    // gọi danh sách học viên
    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClassStudent({
          id: newId,
        });

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const studentsData = rawData?.data || [];

        data.value = studentsData.map((item: any, index: any) => ({
          id: item.id || "N/A",
          stt: index + 1,
          tthv: item.full_name || "N/A",
          email: item.email || "N/A",
          phone: item.phone || "Null",
          accstatus:
            item.status != null && Number(item.status) === 2
              ? "Hoạt động"
              : item.status != null && Number(item.status) === 1
                ? "Dừng hoạt động"
                : "N/A",
        }));
      } catch (err) {
        message.error("Lỗi tải dữ liệu.");
      }
    };
    // Fetch danh sách học viên chưa thêm vào lớp
    const fetchStudents = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getStudents({});

        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách học viên",
          );
          return;
        }

        const rawData = resData.value?.data;
        const allStudents = Array.isArray(rawData?.data) ? rawData.data : [];

        // Lấy danh sách ID của học viên đã có trong lớp
        const existingStudentIds = new Set(
          data.value.map((student) => student.id),
        );

        studentsList.value = allStudents
          .filter((student: any) => !existingStudentIds.has(student.id))
          .map((student: any) => ({
            ...student,
            accstatus:
              student.status != null && Number(student.status) === 2
                ? "Hoạt động"
                : student.status != null && Number(student.status) === 1
                  ? "Không hoạt động"
                  : "N/A",
          }));

        // Lọc ra các học viên chưa có trong lớp
        studentsList.value = allStudents.filter(
          (student: any) => !existingStudentIds.has(student.id),
        );

        showModal.value = true;
      } catch (err) {
        message.error("Lỗi tải danh sách học viên.");
      }
    };

    // Gửi danh sách học viên đã chọn lên API
    const handleSubmit = async () => {
      try {
        const classIdFromPath = newId || route.params.id;
        if (!classIdFromPath) {
          message.error("Không tìm thấy ID lớp học!");
          return;
        }

        if (!selectedStudents.value || selectedStudents.value.length === 0) {
          message.error("Vui lòng chọn ít nhất một học viên!");
          return;
        }

        const requestData = {
          class_id: classIdFromPath,
          student_id: selectedStudents.value,
        };

        const { error } = await restAPI.cms.addStudentsToClass({
          body: requestData,
        });

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi thêm học viên");
          return;
        }

        message.success("Thêm học viên thành công!");
        showModal.value = false;
        await loadData();
      } catch (err) {
        console.error("Lỗi khi gửi dữ liệu:", err);
        message.error("Lỗi khi gửi dữ liệu.");
      }
    };
    //action
    function edit(value: RowData) {
      router.push({
        path: "hocvieninfo",
        query: { id: value.id },
      });
    }

    // Hàm hiển thị modal xóa
    const confirmDelete = (student: RowData) => {
      studentToDelete.value = student;
      showDeleteModal.value = true;
    };
    // Hàm xóa học viên khỏi lớp
    const removeStudentFromClass = async () => {
      if (!studentToDelete.value || !deleteReason.value.trim()) {
        message.error("Vui lòng nhập lý do xóa.");
        return;
      }

      try {
        const requestBody = {
          class_id: newId,
          student_id: [studentToDelete.value.id], // Đảm bảo là mảng
        };

        console.log("🚀 Gửi yêu cầu xóa:", requestBody); // Kiểm tra dữ liệu gửi đi

        const { data: resData, error } = await restAPI.cms.deleteClassStudent({
          body: requestBody,
        });

        if (error?.value) {
          console.error("❌ Lỗi từ API:", error.value);
          message.error(error?.value?.data?.message || "Lỗi khi xóa học viên.");
          return;
        }

        console.log("✅ Kết quả trả về:", resData);

        message.success("Xóa học viên thành công!");
        data.value = data.value.filter(
          (student) => student.id !== studentToDelete.value?.id,
        );
      } catch (err) {
        console.error("❌ Lỗi trong quá trình xóa:", err);
        message.error("Lỗi khi xóa học viên. Vui lòng thử lại.");
      } finally {
        showDeleteModal.value = false;
        deleteReason.value = "";
        studentToDelete.value = null;
      }
    };

    // Cấu hình cột cho bảng học viên
    const studentColumns: DataTableColumns<any> = [
      { type: "selection" },
      { title: "Tên học viên", key: "full_name" },
      { title: "Số điện thoại", key: "phone" },
      { title: "Email", key: "email" },
      {
        title: "Trạng thái",
        key: "accstatus",
        render(row) {
          let color = row.status === "Hoạt động" ? "#00974F" : "gray";
          return h("span", { style: { color } }, row.status);
        },
      },
    ];

    function createColumns(): DataTableColumns<RowData> {
      return [
        { type: "selection" },
        {
          title: "STT",
          key: "stt",
        },
        {
          title: "Thông tin học viên",
          key: "tthv",
        },
        {
          title: "Email",
          key: "email",
        },
        {
          title: "Số Điện Thoại",
          key: "phone",
        },
        {
          title: "Trạng thái tài khoản",
          key: "accstatus",
          align: "center",
          render(row) {
            let color = row.accstatus === "Hoạt động" ? "#00974F" : "gray";
            return h("span", { style: { color } }, row.accstatus);
          },
        },
        {
          title: "Hành động",
          key: "actions",
          align: "center",
          render(row) {
            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                {
                  size: "small",
                  type: "primary",
                  quaternary: true,
                  onClick: () => edit(row),
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-regular fa-pen-to-square",
                      style: "color: green;",
                    }),
                },
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  quaternary: true,
                  onClick: () => confirmDelete(row),
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-solid fa-trash",
                      style: "color: red;",
                    }),
                },
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "warning",
                  quaternary: true,
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-solid fa-ellipsis-vertical",
                      style: "color: orange;",
                    }),
                },
              ),
            ]);
          },
        },
      ];
    }

    return {
      classId,
      data,
      columns: createColumns(),
      pagination: paginationReactive,
      showModal,
      studentsList,
      selectedStudents,
      handleSubmit,
      fetchStudents,
      studentColumns,
      showDeleteModal,
      studentToDelete,
      deleteReason,
      removeStudentFromClass,
    };
  },
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <div class="flex-1">
      <div class="h-full text-black">
        <n-card class="h-full bg-gray-50">
          <div class="flex items-center justify-between text-[#133D85]">
            <h1 class="text-4xl font-bold">
              Danh sách học viên của lớp {{ classId }}
            </h1>
            <n-button
              type="info"
              class="h-15 flex w-52 items-center justify-center text-center text-xl"
              @click="fetchStudents"
            >
              Thêm học viên
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <n-data-table
            style="margin-top: 50px"
            :columns="columns"
            :data="data"
            :pagination="pagination"
          />
          <n-modal v-model:show="showModal">
            <n-card
              style="width: 800px"
              title="Chọn học viên"
              closable
              @close="showModal = false"
            >
              <n-data-table
                :columns="studentColumns"
                :data="studentsList"
                :row-key="(row) => row.id"
                v-model:checked-row-keys="selectedStudents"
              />

              <template #footer>
                <div class="flex justify-end space-x-2">
                  <n-button @click="showModal = false">Hủy</n-button>
                  <n-button type="primary" @click="handleSubmit"
                    >Xác nhận</n-button
                  >
                </div>
              </template>
            </n-card>
          </n-modal>
          <n-modal v-model:show="showDeleteModal">
            <n-card
              title="Xác nhận xóa học viên"
              style="width: 400px"
              closable
              @close="showDeleteModal = false"
            >
              <p>
                Bạn có chắc chắn muốn xóa học viên
                <strong>{{ studentToDelete?.tthv }}</strong> khỏi lớp không?
              </p>
              <n-input
                v-model:value="deleteReason"
                placeholder="Nhập lý do xóa..."
                type="textarea"
              />
              <template #footer>
                <div class="flex justify-end space-x-2">
                  <n-button @click="showDeleteModal = false">Hủy</n-button>
                  <n-button type="error" @click="removeStudentFromClass"
                    >Xác nhận</n-button
                  >
                </div>
              </template>
            </n-card>
          </n-modal>
        </n-card>
      </div>
    </div>
  </div>
</template>
