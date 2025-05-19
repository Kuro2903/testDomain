<script setup>
import { reactive, ref } from "vue";

const message = useMessage();
const formParams = reactive({
  id: null,
  email: null,
  phone: null,
  address: null,
  logo: null,
  favicon: null,
  cover_img: null,
  highlight: null,
  program: null,
  description: null,
  age: null,
});

const previewImages = reactive({
  logo: null,
  favicon: null,
  cover_img: null,
});

const disabledInput = ref(true);
const { restAPI } = useApi();

await loadData();
async function loadData() {
  const { data: res, pending: pending } =
    await restAPI.cms.getUnitInformation();
  if (res?.value?.status) {
    const data = res?.value?.data;
    sessionStorage.setItem("unit_id", data.id);
    formParams.id = data.id;
    formParams.email = data.email;
    formParams.phone = data.phone;
    formParams.address = data.address;
    formParams.logo = "/images/" + data.logo;
    formParams.favicon = "/images/" + data.favicon;
    formParams.cover_img = "/images/" + data.cover_img;
    formParams.highlight = data.highlight;
    formParams.program = data.curriculum;
    formParams.description = data.description;
    formParams.age = data.age;

    previewImages.logo = formParams.logo;
    previewImages.favicon = formParams.favicon;
    previewImages.cover_img = formParams.cover_img;
  } else {
    console.log("Lấy dữ liệu thất bại");
  }
}

const handleImageUpload = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      requestAnimationFrame(() => {
        const fileName = file.name.replace(/^.*[\\\/]/, "");
        if (type === "logo") {
          previewImages.logo = e.target.result;
          formParams.logo = fileName;
        } else if (type === "favicon") {
          previewImages.favicon = e.target.result;
          formParams.favicon = fileName;
        } else if (type === "cover") {
          previewImages.cover_img = e.target.result;
          formParams.cover_img = fileName;
        }
      });
    };
    reader.readAsDataURL(file);
  }
};

const updUnitData = async () => {
  const updatedFormParams = {
    ...formParams,
    logo: formParams.logo ? formParams.logo.replace("/images/", "") : null,
    favicon: formParams.favicon
      ? formParams.favicon.replace("/images/", "")
      : null,
    cover_img: formParams.cover_img
      ? formParams.cover_img.replace("/images/", "")
      : null,
  };

  if (updatedFormParams.id) {
    const { data: res, pending: pending } =
      await restAPI.cms.updateUnitInformation({
        body: updatedFormParams,
      });

    if (res?.value?.status) {
      message.success("Lưu thông tin đơn vị thành công.");
      await loadData();
    } else {
      message.error("Lưu thông tin đơn vị không thành công.");
      await loadData();
    }
  }

  disabledInput.value = !disabledInput.value;
};

const cancleChange = () => {
  disabledInput.value = !disabledInput.value;
  loadData();
  message.warning("Hủy bỏ thay đổi.");
};
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="text-black">
        <div class="text-md mx-10 my-10">
          <div class="flex items-center gap-4">
            <h1 class="text-4xl font-bold">Thông tin đơn vị</h1>
            <n-button
              v-if="disabledInput"
              type="info"
              class="h-15 flex w-40 items-center justify-center text-center text-xl"
              @click="disabledInput = !disabledInput"
            >
              Chỉnh sửa
            </n-button>
          </div>
          <n-form v-model="formParams">
            <n-grid
              class="my-5 w-full"
              :x-gap="70"
              cols="1 m:5"
              responsive="screen"
            >
              <n-grid-item span="1 m:3">
                <n-grid :x-gap="30" cols="1 m:2" responsive="screen">
                  <n-gi span="1">
                    <n-form-item label="Email" path="email">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Nhập email"
                        v-model:value="formParams.email"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1">
                    <n-form-item label="Số điện thoại" path="phone">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Nhập số điện thoại"
                        v-model:value="formParams.phone"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1 m:2">
                    <n-form-item label="Địa chỉ" path="address">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Nhập địa chỉ"
                        v-model:value="formParams.address"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1 m:2">
                    <n-form-item label="Điểm nổi bật" path="highlight">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Textarea"
                        type="textarea"
                        :autosize="{
                          minRows: 3,
                          maxRows: 5,
                        }"
                        v-model:value="formParams.highlight"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1 m:2">
                    <n-form-item label="Chương trình dạy" path="highlight">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Textarea"
                        type="textarea"
                        :autosize="{
                          minRows: 3,
                          maxRows: 5,
                        }"
                        v-model:value="formParams.program"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1 m:2">
                    <n-form-item label="Mô tả chung" path="highlight">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Textarea"
                        type="textarea"
                        :autosize="{
                          minRows: 3,
                          maxRows: 5,
                        }"
                        v-model:value="formParams.description"
                      />
                    </n-form-item>
                  </n-gi>

                  <n-gi span="1 m:2">
                    <n-form-item label="Độ tuổi" path="highlight">
                      <n-input
                        :readonly="disabledInput"
                        placeholder="Textarea"
                        type="textarea"
                        :autosize="{
                          minRows: 3,
                          maxRows: 5,
                        }"
                        v-model:value="formParams.age"
                      />
                    </n-form-item>
                  </n-gi>
                </n-grid>
              </n-grid-item>

              <!-- right -->
              <n-grid-item span="1 m:2">
                <!-- Logo, Favicon, Cover on desktop -->

                <n-form-item label="Logo" path="logo">
                  <div>
                    <img
                      :src="previewImages.logo || formParams.logo"
                      alt="Logo"
                      style="
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        object-fit: cover;
                      "
                    />
                    <div class="mt-2">
                      <label
                        for="logo-upload"
                        class="cursor-pointer text-sm"
                        :class="{
                          'text-blue-500 hover:underline': !disabledInput,
                          'cursor-not-allowed text-gray-400': disabledInput,
                        }"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="logo-upload"
                        class="hidden"
                        accept="image/*"
                        @change="(event) => handleImageUpload(event, 'logo')"
                        :disabled="disabledInput"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                    </p>
                  </div>
                </n-form-item>
                <n-form-item label="Favicon" path="favicon">
                  <div>
                    <img
                      :src="previewImages.favicon || formParams.favicon"
                      alt="Favicon"
                      style="
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        object-fit: cover;
                      "
                    />
                    <div class="mt-2">
                      <label
                        for="favicon-upload"
                        class="cursor-pointer text-sm"
                        :class="{
                          'text-blue-500 hover:underline': !disabledInput,
                          'cursor-not-allowed text-gray-400': disabledInput,
                        }"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="favicon-upload"
                        class="hidden"
                        accept="image/*"
                        @change="(event) => handleImageUpload(event, 'favicon')"
                        :disabled="disabledInput"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                    </p>
                  </div>
                </n-form-item>
                <n-form-item label="Ảnh bìa" path="cover">
                  <div>
                    <img
                      :src="previewImages.cover_img || formParams.cover_img"
                      alt="Cover"
                      :square="false"
                      :width="400"
                      :height="200"
                      :rounded="15"
                    />
                    <div class="mt-2">
                      <label
                        for="cover-upload"
                        class="cursor-pointer text-sm"
                        :class="{
                          'text-blue-500 hover:underline': !disabledInput,
                          'cursor-not-allowed text-gray-400': disabledInput,
                        }"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="cover-upload"
                        class="hidden"
                        accept="image/*"
                        @change="(event) => handleImageUpload(event, 'cover')"
                        :disabled="disabledInput"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                    </p>
                  </div>
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-form>
          <div
            class="gap-25px flex w-full items-center justify-center"
            v-if="!disabledInput"
          >
            <n-space>
              <n-button
                class="flex h-10 w-32 items-center justify-center text-center text-xl text-blue-400"
                @click="cancleChange"
                >Hủy</n-button
              >
              <n-button
                type="info"
                class="flex h-10 w-32 items-center justify-center text-center text-xl"
                @click="updUnitData"
              >
                Lưu
              </n-button>
            </n-space>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
