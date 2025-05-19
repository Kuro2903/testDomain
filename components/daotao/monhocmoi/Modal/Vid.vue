<script setup>
import { ref } from "vue";

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
  type: 2,
  name: null,
  url: null,
  is_live: false,
});

const uploadedFiles = ref([]);
const uploadRef = ref(null);

const triggerUpload = () => {
  const fileInput = uploadRef.value?.$el.querySelector("input");
  if (fileInput) {
    fileInput.click();
  }
};

const handleFileChange = (fileList) => {
  uploadedFiles.value = fileList.fileList;
};

const closeModal = () => {
  isModalVisible.value = false;
  uploadedFiles.value = [];
  emit("update:isVideoModalOpen", false);
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
      <n-form>
        <n-grid cols="1" :x-gap="20">
          <n-gi span="1">
            <h1 v-if="is_addnew" class="text-2xl font-bold text-[#133D85]">
              Tải lên video mới cho bài học
            </h1>
            <h1 v-else class="text-2xl font-bold text-[#133D85]">
              Chỉnh sửa video mới cho bài học
            </h1>
            <div class="mt-5"></div>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Tên video:">
              <n-input placeholder="Nhập tên video"></n-input>
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-form-item label="Video:">
              <n-grid cols="2" :x-gap="20">
                <n-gi span="1">
                  <n-upload
                    ref="uploadRef"
                    :max="1"
                    :multiple="false"
                    @change="handleFileChange"
                  >
                    <n-upload-dragger v-if="uploadedFiles.length < 1">
                      <i class="fa-solid fa-video text-4xl"></i><br />
                      <n-text style="font-size: 16px">
                        Click or drag a file to this area to upload
                      </n-text>
                    </n-upload-dragger>
                  </n-upload>
                </n-gi>
                <n-gi span="1">
                  <div style="margin-bottom: 12px"></div>
                  <n-p depth="3" style="text-sm">
                    Hỗ trợ định dạng: mp4. avi, flv, wmv Khuyến khích video chất
                    lượng tối thiểu 720p và nhỏ hơn 1GB
                  </n-p>
                  <n-button
                    ghost
                    class="text-md w-30 h-10 rounded-xl"
                    @click="triggerUpload"
                  >
                    Chọn video
                  </n-button>
                </n-gi>
              </n-grid>
            </n-form-item>
          </n-gi>
          <n-gi span="1"></n-gi>
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
