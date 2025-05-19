<script lang="ts">
import { NButton, type DataTableColumns } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";

export default defineComponent({
  setup() {
    interface Classrooms {
      id: string;
      name: string;
      slots: number;
      is_active: boolean;
      room_type: string;
      branch_id: string;
      center_id: string;
      branches: string;
      center: string;
      address: string;
    }

    const { restAPI } = useApi();
    if (!restAPI?.cms?.getClassrooms) {
      console.error("API getClassrooms chưa được định nghĩa!");
    }

    const paginationReactive = reactive({
      page: 1,

      pageSize: 10,
      showSizePicker: true,
      pageSizes: [5, 10, 15],
      itemCount: computed(() => classrooms.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });

    const classrooms = ref<Classrooms[]>([]);
    const branches = ref<{ label: string; value: string; address: string }[]>(
      [],
    );
    const center = ref<{ label: string; value: string }[]>([]);
    const data = ref<Classrooms[]>([]);
    const isLoading = ref(false);
    const showAddClassroomModal = ref(false);

    const selectedStatus = ref<string | null>("All");
    const selectedRoomType = ref<string | null>("All");

    const isEditing = ref(false);
    const editingClassroomId = ref<string | null>(null);

    const loadClassrooms = async () => {
      try {
        isLoading.value = true;
        const { data: resData, error } = await restAPI.cms.getClassrooms({});

        if (error?.value) {
          throw new Error(
            error.value.data?.message || "Lỗi khi tải danh sách phòng học",
          );
        }

        classrooms.value = resData.value?.data?.data || [];
        data.value = classrooms.value.map((classroom: Classrooms) => {
          return {
            id: classroom.id,
            name: classroom.name,
            slots: classroom.slots,
            is_active: classroom.is_active,
            room_type: classroom.room_type,
            branch_id: classroom.branch_id,
            center_id: classroom.center_id,
            branches: classroom.branches,
            center: classroom.center,
            address: classroom.address,
          };
        });
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      } finally {
        isLoading.value = false;
      }
    };
    const fetchBranches = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getBranches({});
        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách chi nhánh",
          );
          return;
        }
        branches.value =
          resData.value?.data?.map((branch: any) => ({
            label: `${branch.Name} - ${branch.address}`,
            value: branch.id,
            address: branch.address,
          })) || [];
      } catch (err) {
        console.error("Lỗi khi tải danh sách chi nhánh:", err);
      }
    };

    const fetchCenter = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getCenter({});

        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách trung tâm",
          );
          return;
        }

        const centerData = resData.value?.data;
        if (!centerData || typeof centerData !== "object") {
          message.error("Lỗi định dạng dữ liệu trung tâm.");
          return;
        }

        center.value = [
          {
            label: centerData.address,
            value: centerData.id,
          },
        ];
      } catch (err) {
        console.error("Lỗi khi tải danh sách trung tâm:", err);
      }
    };

    // lọc dữ liệu

    const statusOptions = [
      { label: "Tất cả trạng thái", value: "All" },
      { label: "Còn trống", value: "true" },
      { label: "Đã có lớp", value: "false" },
    ];

    const roomTypeOptions = [
      { label: "Tất cả loại phòng", value: "All" },
      { label: "Zoom", value: "Zoom" },
      { label: "Live class", value: "Live class" },
      { label: "Google Meet", value: "Google Meet" },
      { label: "Practicing", value: "Practicing" },
      { label: "Theory", value: "Theory" },
    ];

    // Lọc dữ liệu dựa vào trạng thái và loại phòng
    const filteredClassrooms = computed(() => {
      return classrooms.value.filter((room) => {
        const matchesStatus =
          selectedStatus.value === "All" ||
          room.is_active === (selectedStatus.value === "true");

        const matchesRoomType =
          selectedRoomType.value === "All" ||
          room.room_type === selectedRoomType.value;

        return matchesStatus && matchesRoomType;
      });
    });

    const newClassroom = ref({
      branch_id: "",
      name: "",
      is_online: false,
      room_type: "",
      metadata: {
        notes: "",
      },
      slots: 50,
      is_active: true,
    });
    const resetForm = () => {
      newClassroom.value = {
        branch_id: "",
        name: "",
        is_online: false,
        room_type: "",
        metadata: { notes: "" },
        slots: 50,
        is_active: true,
      };
    };

    const addClassroom = async () => {
      try {
        let response;

        if (isEditing.value && editingClassroomId.value) {
          // Nếu đang sửa, gọi API cập nhật
          response = await restAPI.cms.updateClassroom({
            id: editingClassroomId.value,
            body: newClassroom.value,
          });
        } else {
          // Nếu đang thêm mới, gọi API tạo lớp học
          response = await restAPI.cms.createClassroom({
            body: newClassroom.value,
          });
        }

        if (response.data?.value?.status) {
          message.success(
            isEditing.value ? "Cập nhật thành công!" : "Thêm mới thành công!",
          );
        } else {
          message.warning("Có lỗi xảy ra, vui lòng thử lại!");
        }

        loadClassrooms(); // Cập nhật lại danh sách
        showAddClassroomModal.value = false; // Đóng modal
        resetForm(); // Reset form sau khi lưu
        isEditing.value = false; // Quay lại chế độ thêm mới
        editingClassroomId.value = null; // Xóa ID của lớp học đang sửa
      } catch (error) {
        console.error("Lỗi khi lưu lớp học:", error);
        message.error("Lỗi khi lưu lớp học!");
      }
    };

    const editClassroom = (classroom: Classrooms) => {
      isEditing.value = true;
      editingClassroomId.value = classroom.id;

      newClassroom.value = {
        branch_id: classroom.branch_id,
        name: classroom.name,
        is_online: false,
        room_type: classroom.room_type,
        metadata: {
          notes: "",
        },
        slots: classroom.slots,
        is_active: classroom.is_active,
      };

      showAddClassroomModal.value = true;
    };

    const deleteClassroom = async (id: string) => {
      if (!id) {
        message.error("Lỗi: Không tìm thấy ID phòng học.");
        return;
      }

      console.log("Đang xóa phòng học với ID:", id); // Debug ID trước khi gọi API

      try {
        const { error } = await restAPI.cms.deleteClassroom({ id });

        if (error?.value) {
          throw new Error(error.value.data?.message || "Lỗi khi xóa phòng học");
        }

        message.success("Xóa phòng học thành công");
        await loadClassrooms(); // Cập nhật danh sách
      } catch (error) {
        console.error("Lỗi khi xóa phòng học:", error);
        message.error((error as any).message || "Lỗi khi xóa phòng học");
      }
    };
    const selectedBranchAddress = computed(() => {
      const branch = branches.value.find(
        (b) => b.value === newClassroom.value.branch_id,
      );
      return branch ? branch.address : "Không có địa chỉ";
    });

    function createColumns(): DataTableColumns<Classrooms> {
      return [
        { title: "Tên phòng học", key: "name", titleAlign: "center" },
        { title: "Sức chứa", key: "slots" },
        {
          title: "Chi nhánh",
          key: "branch_id",
          titleAlign: "center",
          render(row) {
            return computed(() => {
              const branch = branches.value.find(
                (b) => b.value === row.branch_id,
              );
              return branch ? branch.label : "Không xác định";
            }).value;
          },
        },
        {
          title: "Trung tâm",
          key: "center_id",
          titleAlign: "center",
          render(row) {
            return computed(() => {
              const cen = center.value.find((c) => c.value === row.center_id);
              return cen ? cen.label : "Không xác định";
            }).value;
          },
        },

        {
          title: "Loại phòng",
          key: "room_type",
          titleAlign: "center",
          render(row) {
            const onlineTypes = ["Zoom", "Live class", "Google Meet"];
            const offlineTypes = ["Practicing", "Theory"];

            if (onlineTypes.includes(row.room_type)) {
              return `${row.room_type} (Online)`;
            } else if (offlineTypes.includes(row.room_type)) {
              return `${row.room_type} (Offline)`;
            } else {
              return "Không xác định";
            }
          },
        },
        {
          title: "Trạng thái",
          key: "is_active",
          align: "center",
          render(row) {
            let color = "";
            let background = "";

            if (row.is_active) {
              color = "#00974F";
              background = "#F0FFF8";
            } else {
              color = "#4D6FA8";
              background = "#ECF1F9";
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
              row.is_active ? "Còn trống" : "Đã có lớp",
            );
          },
        },
        {
          title: "Hành động",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                {
                  size: "small",
                  quaternary: true,
                  style: { backgroundColor: "transparent", color: "green" },
                  onClick: () => editClassroom(row),
                },
                () => h("i", { class: "fa-regular fa-pen-to-square" }),
              ),
              h(
                NButton,
                {
                  size: "small",
                  quaternary: true,
                  style: { backgroundColor: "transparent", color: "red" },
                  onClick: () => deleteClassroom(row.id),
                },
                () => h("i", { class: "fa-solid fa-trash" }),
              ),
            ]);
          },
        },
      ];
    }

    onMounted(() => {
      fetchBranches();
      fetchCenter();
      loadClassrooms();
    });

    return {
      isLoading,
      classrooms,
      filteredClassrooms,
      columns: createColumns(),
      pagination: paginationReactive,
      selectedStatus,
      selectedRoomType,
      statusOptions,
      showAddClassroomModal,
      roomTypeOptions,
      newClassroom,
      addClassroom,
      branches,
      resetForm,
      isEditing,
      selectedBranchAddress,
    };
  },
});
</script>
<template>
  <div class="rounded-2xl bg-white p-4">
    <!-- Bộ lọc -->
    <div class="mb-4 flex gap-4">
      <n-select
        v-model:value="selectedStatus"
        :options="statusOptions"
        placeholder="Lọc theo trạng thái"
      />
      <n-select
        v-model:value="selectedRoomType"
        :options="roomTypeOptions"
        placeholder="Lọc theo loại phòng"
      />
      <n-button type="info" @click="showAddClassroomModal = true">
        Thêm phòng học <i class="fa-solid fa-plus ml-1 px-2"></i>
      </n-button>
    </div>

    <!-- Bảng -->
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="filteredClassrooms"
      :loading="isLoading"
      :pagination="pagination"
    />
  </div>

  <n-modal v-model:show="showAddClassroomModal">
    <n-card
      title="Thêm lớp học"
      style="width: 500px"
      :bordered="false"
      size="medium"
    >
      <n-form>
        <n-form-item label="Tên lớp học">
          <n-input
            v-model:value="newClassroom.name"
            placeholder="Nhập tên lớp học"
          />
        </n-form-item>

        <n-form-item label="Loại phòng">
          <n-select
            v-model:value="newClassroom.room_type"
            :options="roomTypeOptions"
            placeholder="Chọn loại phòng"
          />
        </n-form-item>
        <n-form-item label="Chi nhánh">
          <n-select
            v-model:value="newClassroom.branch_id"
            :options="branches"
            placeholder="Chọn chi nhánh"
          />
        </n-form-item>

        <n-form-item label="Số lượng chỗ ngồi">
          <n-input-number v-model:value="newClassroom.slots" :min="1" />
        </n-form-item>

        <n-form-item label="Ghi chú">
          <n-input
            v-model:value="newClassroom.metadata.notes"
            placeholder="Nhập ghi chú"
          />
        </n-form-item>

        <n-form-item label="Trạng thái">
          <n-space Align="center">
            <span>Đã có lớp học</span>
            <n-switch v-model:value="newClassroom.is_active" />
            <span>Còn trống</span>
          </n-space>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space>
          <n-button
            @click="
              showAddClassroomModal = false;
              resetForm();
            "
            >Hủy</n-button
          >
          <n-button type="primary" @click="addClassroom">
            {{ isEditing ? "Cập nhật" : "Lưu" }}
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
