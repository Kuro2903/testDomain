<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";

const dropdowns = reactive<{ [key: string]: boolean }>({
  canhan: true,
  nhucau: false,
  danhsach: false,
  phuhuynh: false,
  chamsoc: false,
});

const message = useMessage();
const { restAPI } = useApi();
const route = useRoute();
const isCollapsed = ref(false);
const isLoading = ref(false);
const activeDropdown = ref("canhan");
const shifts = ref([]);
const listShifts = async () => {
  const { data } = await restAPI.cms.getShift({});
  shifts.value = data.value.data.data;
};
const Nhucauarrey = ref<{ stt: number; Needid: string }[]>([]);
function addNeed() {
  Nhucauarrey.value.push({
    stt: Nhucauarrey.value.length + 1,
    Needid: "",
  });
}

const Brancharray = ref([]);
const singleBranchId = ref("");

const showModal = ref(false);
const deleteTarget = ref<{ value: string | null; stt: number | null }>({
  value: null,
  stt: null,
});

const openDeleteModal = (value: string, stt: number) => {
  if (!value) {
    deleteNeed(value, stt);
    return;
  }
  deleteTarget.value = { value, stt };
  showModal.value = true;
};

const confirmDelete = async () => {
  isLoading.value = true;
  if (deleteTarget.value.value) {
    await deleteNeed(deleteTarget.value.value, deleteTarget.value.stt!);
  }
  showModal.value = false;
  isLoading.value = false;
};

const loadBranch_id = async () => {
  try {
    const { data: resData } = await restAPI.cms.getBranches({});

    if (resData.value?.status) {
      Brancharray.value = resData.value.data
        .map(({ id, Name, address }) => ({
          id,
          display: `${Name}: ${address}`,
        }))
        .sort((a, b) => a.display.localeCompare(b.display));
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

async function getNeed() {
  const stu_id = route.query.id;

  if (!stu_id) return;

  try {
    const { data: resData } = await restAPI.cms.listStudyNeed();

    const filteredData = resData.value.data.filter(
      (item) => item.student_id === stu_id,
    );

    Nhucauarrey.value = filteredData.map((item, index) => ({
      stt: index + 1,
      Needid: item.id,
      student_id: item.student_id,
      branch_id: item.branch_id,
    }));
    singleBranchId.value =
      Nhucauarrey.value.length > 0 ? Nhucauarrey.value[0].branch_id : null;
  } catch (error) {
    console.error("Error fetching need data:", error);
  }
}

async function deleteNeed(value: string, st: number) {
  if (!value) {
    Nhucauarrey.value = Nhucauarrey.value
      .filter((i) => i.stt !== st)
      .map((item, index) => ({
        ...item,
        stt: index + 1,
      }));
    return;
  }
  const { data: delData, error } = await restAPI.cms.deleteStudyNeed({
    id: value,
  });
  if (delData?.value?.status) {
    message.success("Xóa nhu cầu học tập thành công!");
    Nhucauarrey.value = Nhucauarrey.value
      .filter((i) => i.stt !== st)
      .map((item, index) => ({
        ...item,
        stt: index + 1,
      }));
  } else {
    message.error(error.value.data.message);
  }
  const queryId = route.query.id;
  await listShifts();
  console.log(shifts);

  const work_id_prefix = `${queryId}_${st}_`;
  const matchingShiftIds = shifts.value
    .filter((s) => s.title.startsWith(work_id_prefix))
    .map((s) => s.id);
  for (const id of matchingShiftIds) {
    try {
      await restAPI.cms.deleteShift({ id });
    } catch (error) {
      console.error(`Failed to delete shift with ID: ${id}`, error);
    }
  }
}

const toggleDropdown = (menu: string) => {
  if (menu.startsWith("nhucau-")) {
    if (activeDropdown.value === menu) {
      activeDropdown.value = "";
    } else {
      activeDropdown.value = menu;
    }
    return;
  }
  if (dropdowns[menu]) {
    // Close the dropdown if already open
    dropdowns[menu] = false;
    activeDropdown.value = ""; // Unset the active dropdown
  } else {
    // Close all dropdowns
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    // Open the clicked dropdown
    dropdowns[menu] = true;
    activeDropdown.value = menu; // Set the active dropdown
  }
};

onMounted(async () => {
  await nextTick();
  getNeed();
  loadBranch_id();
});
</script>
<template>
  <div class="flex h-full w-full">
    <div class="flex h-full w-1/6">
      <nav>
        <ul class="flex flex-col">
          <li
            @click="toggleDropdown('canhan')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'canhan'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'canhan'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin cá nhân
          </li>
          <li
            @click="toggleDropdown('nhucau')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown.startsWith('nhucau')
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown.startsWith('nhucau')
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nhu cầu học tập
          </li>
          <li
            @click="toggleDropdown('danhsach')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'danhsach'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'danhsach'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Danh sách lớp học
          </li>
          <li
            @click="toggleDropdown('phuhuynh')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'phuhuynh'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'phuhuynh'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin phụ huynh
          </li>
          <li
            @click="toggleDropdown('chamsoc')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'chamsoc'
                ? '-mr-10 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'chamsoc'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin chăm sóc
          </li>
        </ul>
      </nav>
    </div>
    <div class="flex h-full w-5/6 overflow-auto rounded-2xl bg-gray-50">
      <!-- Main Content -->
      <div class="flex-1">
        <nav>
          <ul class="mx-5 my-5 flex flex-col gap-y-5 text-xl">
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('canhan')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'canhan'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin cá nhân</div>
                </span>
                <i
                  :class="
                    dropdowns.canhan
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.canhan" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoHocvienctPerInfo />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('nhucau')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',
                  activeDropdown.startsWith('nhucau')
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Nhu cầu học tập</div>
                </span>
                <i
                  :class="
                    dropdowns.nhucau
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.nhucau" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <div class="px5 mt-5">
                      <div class="flex items-center justify-between gap-4">
                        <n-select
                          v-model:value="singleBranchId"
                          :options="Brancharray"
                          label-field="display"
                          value-field="id"
                          placeholder="Chọn chi nhánh"
                          :disabled="
                            Nhucauarrey.some(
                              (item) =>
                                item.Needid !== null &&
                                item.Needid !== undefined,
                            )
                          "
                        />
                        <n-button
                          round
                          type="info"
                          class="h-12 w-48 rounded-2xl text-xl"
                          @click="addNeed"
                          :disabled="!singleBranchId"
                        >
                          Thêm mới
                          <i class="fa-solid fa-plus ml-3"></i>
                        </n-button>
                      </div>
                      <div v-for="item in Nhucauarrey" :key="item.stt">
                        <div>
                          <li
                            :class="[
                              'cursor-pointer py-2',
                              activeDropdown === `nhucau-${item.stt}`
                                ? 'text-[#133D85]'
                                : 'text-gray-600',
                            ]"
                            @click="toggleDropdown(`nhucau-${item.stt}`)"
                          >
                            <div
                              :class="[
                                'flex h-full w-full items-center justify-between bg-gray-200 px-1',
                                activeDropdown === `nhucau-${item.stt}`
                                  ? 'rounded-t-2xl text-[#133D85]'
                                  : 'rounded-2xl text-gray-600',
                              ]"
                            >
                              <div
                                class="my-3 flex h-full w-full items-center justify-between px-5"
                              >
                                <p>Nhu cầu {{ item.stt }}: {{ item.Needid }}</p>
                                <button
                                  @click.prevent="
                                    openDeleteModal(item.Needid, item.stt)
                                  "
                                  :loading="isLoading"
                                  class="text-red-500 hover:text-red-700"
                                >
                                  <i class="fas fa-trash-alt"></i>
                                  <!-- Font Awesome Trash Icon -->
                                </button>
                              </div>
                            </div>
                          </li>
                          <div
                            class="-mt-2"
                            v-if="activeDropdown === `nhucau-${item.stt}`"
                          >
                            <!-- Content to be shown when active -->
                            <div
                              class="rounded-b-2xl border-[4px] border-gray-200"
                            >
                              <DaotaoHocvienctNeed
                                :stt="item.stt"
                                :needId="item.Needid"
                                :branchId="singleBranchId"
                                @apiSuccess="getNeed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('danhsach')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'danhsach'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Danh sách lớp học</div>
                </span>
                <i
                  :class="
                    dropdowns.danhsach
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.danhsach" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoHocvienctClass />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('phuhuynh')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'phuhuynh'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin phụ huynh</div>
                </span>
                <i
                  :class="
                    dropdowns.phuhuynh
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('chamsoc')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'chamsoc'
                    ? 'rounded-3xl bg-gray-200 text-[#133D85]'
                    : 'text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin chăm sóc</div>
                </span>
                <i
                  :class="
                    dropdowns.chamsoc
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <n-modal
      v-model:show="showModal"
      preset="card"
      title="Xác nhận xóa"
      closable
      @close="showModal = false"
      style="max-width: 450px; width: 90%; margin: 0 auto; text-align: center"
    >
      <p>Bạn có chắc chắn muốn xóa nhu cầu học tập này không?</p>
      <template #footer>
        <div class="flex justify-center gap-2">
          <n-button @click="showModal = false">Hủy</n-button>
          <n-button type="error" @click="confirmDelete">Xác nhận</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
