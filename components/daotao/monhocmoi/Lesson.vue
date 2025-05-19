<script setup>
import { NModal } from "naive-ui";
import { reactive, ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

const message = useMessage();
const { restAPI } = useApi();
const route = useRoute();
const isModalVisible = ref(false);
const isLessonVisible = ref(false);
const is_addnew = ref(false);
const lessonarray = ref([]);
const componentKey = ref(0);
const formRef = ref(null);
const railStyle = ({ focused, checked }) => {
  const style = {};
  if (checked) {
    style.background = "#2080f0";
    if (focused) {
      style.boxShadow = "0 0 0 2px #2080f0";
    }
  }
  return style;
};

//massadd____________________________________________________________________________
const exist = ref(0);
const createdNumber = computed(() => exist.value);
const massadd = ref(false);
const number = ref(0);
const mainName = ref("");
const Addform = ref([]);
const Max = computed(() => route.query.num - exist.value);

const updateAddform = () => {
  Addform.value = Array.from({ length: number.value }, (_, index) => ({
    name: mainName.value
      ? `${mainName.value} ${exist.value + index + 1}`
      : `${exist.value + index + 1}`,
    is_trial: false,
    is_live: true,
  }));
};

watch(number, (newVal, oldVal) => {
  if (newVal > oldVal) {
    for (let i = oldVal; i < newVal; i++) {
      Addform.value.push({
        name: mainName.value
          ? `${mainName.value} ${exist.value + i + 1}`
          : `${exist.value + i + 1}`,
        is_trial: false,
        is_live: true,
      });
    }
  } else {
    Addform.value.length = newVal;
  }
});

watch(mainName, (newVal) => {
  Addform.value.forEach((item, index) => {
    item.name = newVal
      ? `${newVal} ${exist.value + index + 1}`
      : `${exist.value + index + 1}`;
  });
});

const masterChecked = computed({
  get: () => {
    const checkedCount = Addform.value.filter((item) => item.is_trial).length;
    if (checkedCount === 0) return false;
    if (checkedCount === Addform.value.length) return true;
    return null;
  },
  set: (value) => {
    Addform.value.forEach((item) => {
      item.is_trial = value;
    });
  },
});

const handleSave = () => {
  if (massadd.value) {
    saveMassLessons();
  } else {
    saveSingleLesson();
  }
};

const saveSingleLesson = () => {
  addchildLesson({
    name: lessondate.name,
    free_trial: lessondate.free_trial,
    is_live: true,
  });
};

const saveMassLessons = () => {
  Addform.value.forEach((lesson) => {
    addchildLesson({
      name: lesson.name,
      free_trial: lesson.is_trial,
      is_live: true,
    });
  });
};

// Submit function
// const handleSubmit = () => {
//   const submittedData = Addform.value.map(({ name, is_trial, is_live }) => ({
//     name,
//     is_trial,
//     is_live,
//   }));

//   console.log("Form Submitted:", submittedData);
//   alert(JSON.stringify(submittedData, null, 2));
// };
//___________________________________________________________________________________

//rules______________________________________________________________________________

//___________________________________________________________________________________

const refreshComponent = () => {
  componentKey.value += 1;
};

const pageName = computed(() => route.path.split("/")[2]);
const props = defineProps({
  correctSubjectId: String,
});

const formValue = reactive({
  id: null,
  name: null,
  subject_id: computed(() =>
    pageName.value === "lophocinfo"
      ? props.correctSubjectId
      : route.query.id || null,
  ),
  child_lessons: [],
});

const lessondate = reactive({
  name: null,
  free_trial: false,
});

//child_lessons______________________________________________________________________
const addchildLesson = (customLesson = {}) => {
  formValue.child_lessons.push({
    name: customLesson.name ?? null,
    position: formValue.child_lessons.length + 1,
    free_trial: customLesson.free_trial ?? false,
    is_live: customLesson.is_live ?? false,
  });

  isLessonVisible.value = false;
};

const removeLesson = (value, is_live) => {
  if (formValue.child_lessons.length > 0) {
    formValue.child_lessons.splice(value, 1);
  }
};
//___________________________________________________________________________________

//Dropdown___________________________________________________________________________
const dropdowns = reactive({
  lesson: true,
});
const activeDropdown = ref("lesson");
const toggleDropdown = (menu) => {
  if (dropdowns[menu]) {
    dropdowns[menu] = false;
    activeDropdown.value = "";
  } else {
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    dropdowns[menu] = true;
    activeDropdown.value = menu;
  }
};

function showChapterModal() {
  getLesson();
  is_addnew.value = true;
  isModalVisible.value = true;
}
//___________________________________________________________________________________

//Modal______________________________________________________________________________
const delref = ref(null);
const deleteAction = ref(null);
const itemId = ref(null);

const handleConfirmDelete = () => {
  if (deleteAction.value && itemId.value !== null) {
    deleteAction.value(itemId.value);
    itemId.value = null;
    deleteAction.value = null;
  }
};

const showDeleteModal = (action, title, id) => {
  deleteAction.value = action;
  itemId.value = id;
  if (delref.value) {
    delref.value.setAddNew(title);
  }
};

function CancelModal() {
  isModalVisible.value = false;
}
watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      id: null,
      name: null,
      child_lessons: [],
    });
  }
});

watch(isLessonVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(lessondate, {
      name: null,
      free_trial: false,
    });
    massadd.value = false;
    Addform.value = [];
    number.value = 0;
    mainName.value = 0;
  }
});

function CancelLModal() {
  isLessonVisible.value = false;
}
//___________________________________________________________________________________

//Data_______________________________________________________________________________
async function getLesson() {
  const lesson_id =
    pageName.value === "lophocinfo" ? props.correctSubjectId : route.query.id;
  if (!lesson_id) return;

  try {
    const { data: resData } = await restAPI.cms.getListLesson({
      id: lesson_id,
    });

    lessonarray.value = resData.value.data.map((lesson, index) => ({
      stt: index,
      id: lesson.id,
      name: lesson.name,
      childrens: lesson.childrens || [],
    }));
    exist.value = lessonarray.value.reduce(
      (count, lesson) => count + lesson.childrens.length,
      0,
    );
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
}
//___________________________________________________________________________________

//Function___________________________________________________________________________
async function deleteLesson(value) {
  const body = { id: value };
  const { data: delData, error } = await restAPI.cms.deleteLesson({
    body,
  });
  if (delData?.value?.status) {
    message.success("Xóa chương thành công!");
  } else {
    const errorCode = error.value?.data?.error;
    const errorMessage =
      ERROR_CODES[errorCode] ||
      resdel?.value?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại!";
    message.warning(errorMessage);
  }
  getLesson();
}

async function editSubject(value) {
  is_addnew.value = false;
  const { data: resData } = await restAPI.cms.getLessonDetail({
    id: value,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.id = data.id;
    formValue.name = data.name;
    formValue.child_lessons = data.childrens
      ? data.childrens.map((child) => ({
          id: child.id,
          name: child.name,
          position: child.position,
          is_live: child.is_live,
        }))
      : [];
  }
  isModalVisible.value = true;
}
//___________________________________________________________________________________

async function handleSubmit() {
  const { id, name, subject_id, child_lessons } = formValue;
  let body = {
    name,
    subject_id,
    child_lessons,
  };

  try {
    if (id === null) {
      const { data: resCreate, error } = await restAPI.cms.createLesson({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo chương thành công!");
        isModalVisible.value = false;
      } else {
        const errorCode = error.value.data.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resData.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";
        message.error(errorMessage);
      }
    } else {
      body.id = id;
      let finalBody = [body];

      const { data: resUpdate, error } = await restAPI.cms.updateLesson({
        body: finalBody,
      });
      if (resUpdate?.value?.status) {
        if (body.child_lessons && Array.isArray(body.child_lessons)) {
          for (const child of body.child_lessons) {
            try {
              child.parent_id = id;

              if (child.id) {
                const { data: resChildUpdate, error: childError } =
                  await restAPI.cms.updateLesson({ body: [child] });

                if (!resChildUpdate?.value?.status) {
                  console.warn(
                    `Failed to update child lesson ${child.id}:`,
                    childError?.value,
                  );
                }
              } else {
                child.parent_id = id;
                const { data: resChildCreate, error: childCreateError } =
                  await restAPI.cms.createLesson({ body: child });
                if (!resChildCreate?.value?.status) {
                  console.warn(
                    `Failed to create child lesson:`,
                    childCreateError?.value,
                  );
                } else {
                }
              }
            } catch (err) {
              console.error(
                `Error processing child lesson ${child.id || "(new)"}:`,
                err,
              );
            }
          }
        }
        message.success("Cập nhật chương thành công!");
        isModalVisible.value = false;
      } else {
        const errorCode = error.value?.data?.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resUpdate?.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";

        message.warning(errorMessage);
      }
    }
  } catch {
  } finally {
    getLesson();
    refreshComponent();
  }
}
const handleChildEvent = () => {
  getLesson();
};

onMounted(async () => {
  await nextTick();
  getLesson();
});

const getPlaceholder = (item) => {
  return item.is_live === true ? "Nhập tên buổi học" : "Nhập tên bài học";
};
</script>
<template>
  <div class="px-5">
    <div v-for="item in lessonarray" :key="item.id">
      <div>
        <li
          :class="[
            'cursor-pointer py-2',
            activeDropdown === `lesson-${item.stt}`
              ? 'text-[#133D85]'
              : 'text-gray-600',
          ]"
          @click="toggleDropdown(`lesson-${item.stt}`)"
        >
          <div
            :class="[
              'flex h-full w-full items-center justify-between rounded-2xl bg-gray-200',
              activeDropdown === `lesson-${item.stt}`
                ? 'text-[#133D85]'
                : 'text-gray-600',
            ]"
          >
            <div
              class="my-2 flex h-full w-full items-center justify-between px-5"
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-folder"></i>
                <p>{{ item.name }}</p>
              </div>
              <div>
                <button
                  @click.stop="editSubject(item.id)"
                  class="pr-5 text-green-500 hover:text-green-700"
                >
                  <i class="fas fa-regular fa-pen-to-square"></i>
                </button>
                <button
                  @click.stop="
                    showDeleteModal(deleteLesson, 'Xóa chương', item.id)
                  "
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </li>
        <div class="-mt-2" v-if="activeDropdown === `lesson-${item.stt}`">
          <!-- Content to be shown when active -->
          <div class="mt-2 border-b-2"></div>
          <DaotaoMonhocmoiNewsub
            :lessonId="item.id"
            :key="componentKey"
            :correctSubjectId="formValue.subject_id"
            :creatednumber="createdNumber"
            @childFunctionExecuted="handleChildEvent"
          />
          <div class="border-b-2"></div>
        </div>
      </div>
    </div>
    <n-button
      round
      type="info"
      class="mt-2 h-12 w-48 rounded-2xl text-xl"
      @click="showChapterModal"
    >
      Thêm mới
      <i class="fa-solid fa-plus ml-3"></i>
    </n-button>
    <n-modal
      v-model:show="isModalVisible"
      preset="card"
      style="max-width: 600px"
      :header-style="{ padding: '10px' }"
      :closable="false"
    >
      <n-form>
        <n-grid cols="2" :x-gap="20">
          <n-gi span="2">
            <h1 v-if="is_addnew" class="text-2xl font-bold text-[#133D85]">
              Thêm chương mới
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa chương
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="Tên chương mới:">
              <n-input
                v-model:value="formValue.name"
                placeholder="Nhập tên chương"
              ></n-input>
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-gi span="2">
              <n-form-item label="Thêm các bài học nằm trong chương này">
                <p class="-mt-6 text-[#4D6FA8]">
                  Nhập tên bài học trước và thêm nội dung chi tiết từng bài học
                  ở bước sau
                </p>
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="-mt-8 mb-5">
              <n-grid
                cols="15"
                :x-gap="20"
                v-for="(item, index) in formValue.child_lessons"
                :key="index"
              >
                <n-gi span="14" class="mb-2">
                  <n-input
                    v-model:value="item.name"
                    :placeholder="getPlaceholder(item)"
                  ></n-input>
                </n-gi>
                <n-gi>
                  <button
                    class="pt-3 text-red-500 hover:text-red-700"
                    @click="removeLesson(index, item.is_live)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi span="2" class="mb-1">
              <span
                class="cursor-pointer text-sm text-[#00A2EB]"
                @click="addchildLesson"
              >
                + Thêm bài học mới
              </span>
            </n-gi>
            <n-gi span="2" class="mb-5">
              <span
                class="cursor-pointer text-sm text-[#00A2EB]"
                @click="isLessonVisible = true"
              >
                + Thêm buổi học mới
              </span>
            </n-gi>
            <n-modal
              v-model:show="isLessonVisible"
              preset="card"
              style="width: auto; max-width: unset"
              :header-style="{ padding: '10px' }"
              :closable="false"
            >
              <n-grid cols="2" :x-gap="20">
                <n-gi span="2">
                  <h1 class="text-2xl font-bold text-[#133D85]">
                    Thêm buổi học
                  </h1>
                </n-gi>
                <!-- Note: rules -->
                <n-gi>
                  <n-form-item
                    label="Tạo buổi học hàng loạt"
                    label-placement="left"
                    :show-feedback="false"
                    path="number"
                  >
                    <n-switch v-model:value="massadd" :rail-style="railStyle" />
                  </n-form-item>
                </n-gi>
                <n-gi span="2" v-if="!massadd">
                  <n-gi>
                    <n-form-item label="Tiêu đề buổi học:" path="mainname">
                      <n-input
                        v-model:value="lessondate.name"
                        placeholder="Nhập tiêu đề buổi học"
                      ></n-input>
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item
                      label="Cho phép học thử"
                      label-placement="left"
                      :show-feedback="false"
                    >
                      <n-checkbox
                        v-model:checked="lessondate.free_trial"
                      ></n-checkbox>
                    </n-form-item>
                  </n-gi>
                </n-gi>
                <n-gi span="2" v-else class="mb-5">
                  <n-grid cols="2" :x-gap="20" :y-gap="10">
                    <n-gi>
                      <n-form-item label="Số buổi học">
                        <n-input-number
                          v-model:value="number"
                          clearable
                          :min="0"
                          :max="Max"
                          placeholder="Nhập số lượng"
                        />
                      </n-form-item>
                    </n-gi>

                    <n-gi>
                      <n-form-item label="Tiêu đề buổi học">
                        <n-input
                          v-model:value="mainName"
                          placeholder="Nhập tiêu đề buổi học"
                        />
                      </n-form-item>
                    </n-gi>

                    <n-gi>
                      <h1 class="text-lg font-bold text-[#133D85]">
                        Danh sách buổi học
                      </h1>
                    </n-gi>
                    <n-gi>
                      <n-checkbox
                        v-model:checked="masterChecked"
                        :indeterminate="masterChecked === null"
                        :style="{
                          fontSize: '18px',
                          '--n-font-weight': 'bold',
                          '--n-text-color': '#133D85',
                        }"
                      >
                        Chọn tất cả
                      </n-checkbox>
                    </n-gi>

                    <!-- Dynamic Fields -->
                    <n-gi
                      v-for="(item, index) in Addform"
                      :key="index"
                      span="2"
                    >
                      <n-grid cols="2" :x-gap="20">
                        <n-gi>
                          <!-- Dynamic Input Field (Readonly, absolute value) -->
                          <n-input v-model:value="item.name" readonly />
                        </n-gi>
                        <n-gi class="mt-2">
                          <!-- Child Checkbox -->
                          <n-checkbox
                            v-model:checked="item.is_trial"
                            :style="{
                              '--n-font-weight': 'bold',
                              '--n-text-color': '#133D85',
                            }"
                          >
                            Cho phép học thử
                          </n-checkbox>
                        </n-gi>
                      </n-grid>
                    </n-gi>
                  </n-grid>
                </n-gi>
                <n-gi>
                  <n-button
                    ghost
                    class="h-12 w-full rounded-2xl text-lg"
                    @click="CancelLModal"
                  >
                    Hủy
                  </n-button>
                </n-gi>
                <n-gi>
                  <n-button
                    round
                    type="info"
                    class="h-12 w-full rounded-2xl text-lg"
                    @click="handleSave"
                  >
                    Lưu
                  </n-button>
                </n-gi>
              </n-grid>
            </n-modal>
          </n-gi>
          <n-gi>
            <n-button
              ghost
              class="h-12 w-full rounded-2xl text-lg"
              @click="CancelModal"
            >
              Hủy
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              round
              type="info"
              class="h-12 w-full rounded-2xl text-lg"
              @click="handleSubmit"
            >
              Lưu
            </n-button>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
