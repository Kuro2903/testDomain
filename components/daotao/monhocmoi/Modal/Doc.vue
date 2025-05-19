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
  type: 5,
  name: null,
  file_size: 0,
  file_name: null,
  is_live: false,
  content_type: "application/pdf",
  document_id: "550e8400-e29b-41d4-a716-446655440002",
});

const rules = {
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Tên tài liệu không được để trống."));
        else if (newValue.length > 250)
          reject(Error("Bạn đã nhập quá 250 ký tự."));
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
);
watch(isModalVisible, (newValue, oldValue) => {
  if (!newValue) {
    Object.assign(formValue, {
      name: null,
      is_live: false,
    });
  }
});

const uploadedFiles = ref([]);
const handleFileChange = (fileList) => {
  if (fileList.fileList.length > 0) {
    const file = fileList.fileList[0].file; // Get the selected file
    uploadedFiles.value = [
      {
        file_size: file.size,
        file_name: file.name,
        content_type: file.type,
        file,
      },
    ];
    console.log(uploadedFiles);
  }
};

const fetchLessonData = async () => {
  if (!formValue.id) return;

  const { data: resData } = await restAPI.cms.getLessonData({
    id: formValue.id,
  });

  if (resData.value?.status) {
    const data = resData.value?.data;
    formValue.name = data?.name || "";
    formValue.is_live = data?.is_live || false;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const valid = await formRef.value.validate();
  if (!valid) return;
  let fileData = uploadedFiles.value.length > 0 ? uploadedFiles.value[0] : null;
  const { id, name, type, position, is_live } = formValue;
  let body = {
    name,
    type,
    position,
    file_size: fileData ? fileData.file_size : null,
    file_name: fileData ? fileData.file_name : null,
    content_type: fileData ? fileData.content_type : null,
    is_live,
  };

  if (!is_addnew.value) {
    body.id = id;
  }
  console.log(body);
  emit("submit", body);
  closeModal();
};

const closeModal = () => {
  isModalVisible.value = false;
  uploadedFiles.value = [];
  emit("update:isDocumentModalOpen", false);
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
              Tải lên tài liệu mới cho bài học
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa tài liệu cho bài học
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Tên tài liệu:" path="name">
              <n-input
                placeholder="Nhập tên tài liệu"
                v-model:value="formValue.name"
              ></n-input>
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Tài liệu:">
              <n-upload :max="1" :multiple="false" @change="handleFileChange">
                <n-upload-dragger v-if="uploadedFiles.length < 1">
                  <n-text style="font-size: 16px">
                    Chọn file để tải lên hoặc kéo 1 tệp vào đây
                  </n-text>
                  <n-p depth="1" style="font-size: 14px">
                    Dung lượng tối đa 20Mb. Hỗ trợ các định dạng file: doc, pdf,
                    xls, xlsx, pptx, png, jpeg.
                  </n-p>
                </n-upload-dragger>
              </n-upload>
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
