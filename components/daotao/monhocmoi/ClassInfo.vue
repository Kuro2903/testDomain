<script setup>
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

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

const route = useRoute();
const router = useRouter();
const message = useMessage();
const { restAPI } = useApi();
const isLoading = ref(false);
const showSpin = ref(false);
const Staffarray = ref([]);
const Categoryarray = ref([]);
const token = ref("");

const formValue = reactive({
  thumbnail: "AA",
  color: "red",
  code: null,
  id: computed(() => route.query.id || null),
  name: null,
  teacher_ids: [],
  total_lessons: null,
  fee_type: null,
  origin_fee: null,
  discount_fee: null,
  category_id: null,
  description: null,
  input_require: null,
  output_require: null,
  is_active: true,
});

const displayPrice = computed({
  get: () => (formValue.fee_type === "1" ? "0" : formValue.origin_fee),
  set: (value) => {
    if (formValue.fee_type !== "1") {
      formValue.origin_fee = value;
      if (formValue.fee_type !== "1") {
        formValue.origin_fee = value;
      }
    }
  },
});

const options = [
  { label: "Sáng", value: "Sáng" },
  { label: "Tối", value: "Tối" },
];
if (typeof window !== "undefined" && window.sessionStorage) {
  token.value = `Bearer ${useUserStore()?.userInfo?.token}`;
}
if (typeof window !== "undefined" && window.sessionStorage) {
  token.value = `Bearer ${useUserStore()?.userInfo?.token}`;
}
const loadTeacher = async () => {
  try {
    const { data: resData } = await restAPI.cms.getStaff({});
    if (resData.value?.status) {
      Staffarray.value = resData.value.data.data
        .filter((staff) => staff.is_active && staff.position === 1)
        .map(({ id, full_name }) => ({
          id,
          full_name,
        }))
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      message.error("Failed to load Teachers!");
      Staffarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching Teachers!");
    console.error(err);
    Staffarray.value = [];
  }
};

const loadCategory = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getCategories({});
    if (resData.value?.status) {
      Categoryarray.value = resData.value.data
        .map(({ id, name }) => ({
          id,
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      message.error("Failed to load categorys!");
      Categoryarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching categorys!");
    console.error(err);
    Categoryarray.value = [];
  }
};

if (formValue.id) {
  showSpin.value = true;
  const { data: resData } = await restAPI.cms.getSubjectDetail({
    id: formValue.id,
  });
  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.thumbnail = data?.thumbnail;
    formValue.color = data?.color;
    formValue.code = data?.code;
    formValue.total_lessons = String(data?.total_lessons ?? "");
    formValue.name = data?.name;
    formValue.category_id = data?.category?.id;
    formValue.teacher_ids = Array.isArray(data.teachers)
      ? data.teachers.map((teacher) => teacher.id)
      : [];
    formValue.fee_type = String(data?.fee_type);
    formValue.origin_fee = data?.origin_fee;
    formValue.discount_fee = data?.discount_fee;
    formValue.description = data?.description;
    formValue.input_require = data?.input_require;
    formValue.output_require = data?.output_require;
    formValue.is_active = data?.is_active;
  }
  showSpin.value = false;
}

const handleSubmit = async (e) => {
  if (isLoading.value) return;
  e.preventDefault();
  isLoading.value = true;

  const {
    thumbnail,
    color,
    code,
    id,
    name,
    category_id,
    teacher_ids,
    total_lessons,
    fee_type,
    origin_fee,
    discount_fee,
    description,
    input_require,
    output_require,
    is_active,
  } = formValue;

  let body = {
    thumbnail,
    color,
    code,
    name,
    category_id,
    teacher_ids: Array.isArray(teacher_ids) ? teacher_ids : [teacher_ids],
    total_lessons: Number(total_lessons),
    fee_type: Number(fee_type),
    origin_fee: Number(origin_fee),
    discount_fee: Number(discount_fee),
    description,
    input_require,
    output_require,
    is_active,
  };

  try {
    // validate
    if (id) {
      console.log(id);
      body.id = id;
      console.log(JSON.stringify(body, null, 2));

      const { data: resUpdate, error } = await restAPI.cms.updateSubject({
        body,
      });

      if (resUpdate?.value?.status) {
        message.success("Cập nhật thông tin môn học thành công!");
        router.replace({
          query: { ...route.query, num: body.total_lessons },
        });
      } else {
        message.error(error.value.data.message);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createSubject({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo môn học thành công!");
        const newId = resCreate.value.data.id;
        router.push({
          path: window.location.pathname,
          query: { id: newId, num: body.total_lessons },
        });
      } else {
        const errorCode = error.value.data.error;
        const errorMessage =
          ERROR_CODES[errorCode] ||
          resCreate.value?.message ||
          "Đã xảy ra lỗi, vui lòng thử lại!";
        message.warning(errorMessage);
      }
    }
  } catch {
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  loadTeacher();
  loadCategory();
});
</script>

<template>
  <n-spin :show="showSpin">
    <div class="px-5">
      <n-form :model="formValue">
        <n-grid :x-gap="15" cols="1 m:4" responsive="screen" class="my-5">
          <n-gi>
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
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Màu hiển thị">
              <n-select
                v-model:value="formValue.color"
                :options="options"
                placeholder="Chọn màu sắc"
              />
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Mã môn học" path="code" class="w-32">
              <n-input v-model:value="formValue.code" placeholder="0465214" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:3" class="-ml-36">
            <n-form-item label="Môn học" path="name">
              <n-input
                v-model:value="formValue.name"
                placeholder="Nhập tên môn học"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Danh mục" path="cata">
              <n-select
                v-model:value="formValue.category_id"
                :options="Categoryarray"
                label-field="name"
                value-field="id"
                placeholder="Chọn danh mục"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Giảng viên phụ trách" path="teacher">
              <n-select
                multiple
                v-model:value="formValue.teacher_ids"
                :options="Staffarray"
                label-field="full_name"
                value-field="id"
                placeholder="Chọn giảng viên"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Số buổi học" path="session">
              <n-input
                v-model:value="formValue.total_lessons"
                placeholder="Nhập số buổi"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Học phí" path="session">
              <n-radio-group v-model:value="formValue.fee_type">
                <n-space>
                  <n-radio value="1"> Miễn phí </n-radio>
                  <n-radio value="2"> Trả phí </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-gi>
          <n-gi></n-gi>
          <n-gi>
            <n-form-item label="Giá gốc" path="price">
              <n-input
                v-model:value="displayPrice"
                placeholder="0"
                :disabled="formValue.fee_type === '1'"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Giá khuyến mại nếu có" path="discount">
              <n-input
                v-model:value="displayDiscount"
                placeholder="Nhập giá"
                :disabled="formValue.fee_type === '1'"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Mô tả" path="description">
              <n-input
                v-model:value="formValue.description"
                placeholder="Nhập mô tả"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Yêu cầu đầu vào" path="in">
              <n-input
                v-model:value="formValue.input_require"
                placeholder="Nhập mô tả"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:4">
            <n-form-item label="Tiêu chuẩn đầu ra" path="out">
              <n-input
                v-model:value="formValue.output_require"
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
                :unchecked-value="false"
                :checked-value="true"
                :rail-style="railStyle"
                v-model:value="formValue.is_active"
              />
            </n-form-item>
          </n-gi>
          <n-gi span="3"></n-gi>
          <n-gi class="pt-2">
            <n-button
              round
              type="info"
              class="h-12 w-52 rounded-2xl text-lg"
              @click.prevent="handleSubmit"
            >
              Lưu
            </n-button>
          </n-gi>
        </n-grid>
      </n-form>
    </div>
  </n-spin>
</template>
