<script setup>
import { ref, watch } from "vue";

const { restAPI } = useApi();
const emit = defineEmits(["submit"]);
const is_addnew = ref(true);
const isModalVisible = ref(false);
const setAddNew = (value, id) => {
  isModalVisible.value = true;
  is_addnew.value = value;
  formValue.id = id;
  if (id) {
    fetchLessonData();
  }
};
defineExpose({ setAddNew });

const formRef = ref(null);
const formValue = reactive({
  id: null,
  position: 1,
  type: 3,
  name: null,
  content: null,
  is_live: false,
});

const rules = {
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Tên đoạn văn không được để trống."));
        else if (newValue.length > 250)
          reject(Error("Bạn đã nhập quá 250 ký tự."));
        else resolve();
      });
    },
  },
  content: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Nội dung đoạn văn không được để trống."));
        else resolve();
      });
    },
  },
};

watch(
  () => formValue.name,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      formRef.value.validate().catch(() => {});
    }
  },
  () => formValue.content,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      formRef.value.validate().catch(() => {});
    }
  },
);
watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      name: null,
      content: null,
      is_live: false,
    });
  }
});

const fetchLessonData = async () => {
  if (!formValue.id) return;

  const { data: resData } = await restAPI.cms.getLessonData({
    id: formValue.id,
  });

  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.name = data?.name || "";
    formValue.content = data?.metadata.content || "";
    formValue.is_live = data?.is_live || false;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const valid = await formRef.value.validate();
  if (!valid) return;

  const { id, name, content, type, position, is_live } = formValue;
  let body = {
    name,
    content,
    type,
    position,
    is_live,
  };

  if (!is_addnew.value) {
    body.id = id;
  }

  emit("submit", body);
  closeModal();
};

const closeModal = () => {
  isModalVisible.value = false;
  emit("update:isTextModalOpen", false);
};
</script>
<template>
  <n-modal-provider>
    <n-modal
      v-model:show="isModalVisible"
      preset="card"
      style="max-width: 600px"
      :header-style="{ padding: '10px' }"
      :closable="false"
      @update:show="closeModal"
    >
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <n-grid cols="1" :x-gap="20">
          <n-gi span="1">
            <h1 v-if="is_addnew" class="text-2xl font-bold text-[#133D85]">
              Thêm đoạn văn cho bài học
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa đoạn văn cho bài học
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Tên đoạn văn:" path="name">
              <n-input
                placeholder="Nhập tên đoạn văn"
                v-model:value="formValue.name"
              ></n-input>
            </n-form-item>
          </n-gi>

          <n-gi span="1">
            <n-form-item label="Nội dung đoạn văn:" path="content">
              <n-input
                type="textarea"
                placeholder="Nhập nội dung đoạn văn"
                v-model:value="formValue.content"
              ></n-input>
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-grid cols="2" :x-gap="20">
              <n-gi>
                <n-button
                  ghost
                  class="h-12 w-full rounded-2xl text-lg"
                  @click="closeModal"
                >
                  Hủy
                </n-button>
              </n-gi>
              <n-gi>
                <n-button
                  round
                  type="info"
                  class="h-12 w-full rounded-2xl text-lg"
                  @click.prevent="handleSubmit"
                >
                  Lưu
                </n-button>
              </n-gi>
            </n-grid>
          </n-gi>
        </n-grid>
      </n-form>
    </n-modal>
  </n-modal-provider>
</template>
