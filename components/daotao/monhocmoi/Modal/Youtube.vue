<script setup>
import { ref, watch, nextTick } from "vue";

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
  type: 1,
  name: null,
  url: null,
  is_live: false,
});

const rules = {
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Tên video không được để trống."));
        else if (newValue.length > 250)
          reject(Error("Bạn đã nhập quá 250 ký tự."));
        else resolve();
      });
    },
  },
  url: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Link video YouTube không được để trống."));
        else if (
          !newValue.includes("www.youtube.com") &&
          !newValue.includes("youtu.be")
        )
          reject(Error("Đường link youtube không hợp lệ."));
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
  () => formValue.url,
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
      url: null,
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
    formValue.url = data?.metadata.url || "";
    formValue.is_live = data?.is_live || false;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const valid = await formRef.value.validate();
  if (!valid) return;

  const { id, name, url, type, position } = formValue;
  let body = {
    name,
    url,
    type,
    position,
  };

  if (!is_addnew.value) {
    body.id = id;
  }

  emit("submit", body);
  closeModal();
};

const closeModal = () => {
  isModalVisible.value = false;
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
              Thêm video Youtube mới cho bài học
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa video Youtube mới cho bài học
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Tên video:" path="name">
              <n-input
                placeholder="Nhập tên bài"
                v-model:value="formValue.name"
              ></n-input>
            </n-form-item>
          </n-gi>

          <n-gi span="1">
            <n-form-item label="Link video Youtube:" path="url">
              <n-input
                placeholder="Nhập link video Youtube"
                v-model:value="formValue.url"
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
