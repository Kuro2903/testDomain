<script setup>
import { ref, reactive } from "vue";
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
const message = useMessage();
const dayjs = useDayjs();
const route = useRoute();
const router = useRouter();

const { restAPI } = useApi();
const isLoading = ref(false);
const formRef = ref(null);
const showSpin = ref(false);

const formValue = reactive({
  id: computed(() => route.query.id || null),
  name: null,
  gender: "Nam",
  type: 6,
  dob: null,
  email: null,
  phone: null,
  address: {
    province: null,
    district: null,
    address: null,
  },
  customer_source_id: null,
  contact_channel_id: null,
  status: 2,
  branch_id: null,
});

const options = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
];

const optionsProvinces = reactive({
  loading: false,
  data: [],
  default: {},
});

const optionsDistricts = reactive({
  params: {
    page: 1,
    length: 20,
    province: null,
  },
  loading: false,
  data: [],
  default: {},
});

const rules = reactive({
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        const nameRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!newValue) reject(Error("Tên không được để trống!"));
        else if (newValue.length > 50)
          reject(Error("Tên không được quá 50 ký tự!"));
        else if (nameRegex.test(newValue))
          reject(Error("Tên không được chứa ký tự đặc biệt!"));
        else resolve();
      });
    },
  },

  email: {
    required: true,
    trigger: ["input", "blur"],
    validator: (_, value) => {
      const emailRegex =
        /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
      return new Promise((resolve, reject) => {
        if (!value) reject(Error("Email không được để trống!"));
        else if (value && !emailRegex.test(value))
          reject(Error("Email không hợp lệ!"));
        else if (value && value.length > 100)
          reject(Error("Email không được quá 100 ký tự!"));
        else resolve();
      });
    },
  },
  phone: {
    trigger: ["input", "blur"],
    validator: (_, value) => {
      return new Promise((resolve, reject) => {
        const phoneRegex =
          /^((84|(\+84))(3|5|7|8|9)([0-9]{8})\b|(0[3|5|7|8|9])([0-9]{8}))$/;
        if (!value) reject(Error("Số điện thoại không được để trống!"));
        else if (value && !phoneRegex.test(value))
          reject(Error("Số điện thoại không hợp lệ!"));
        else resolve();
      });
    },
  },
  customer_source_id: {
    required: true,
    trigger: ["input", "blur"],
    message: "Nguồn khách hàng không được để trống!",
  },
});

if (formValue.id) {
  showSpin.value = true;
  const { data: resData } = await restAPI.cms.getStudentDetail({
    id: formValue.id,
  });
  if (resData.value?.status) {
    const data = resData.value?.data?.entry;
    formValue.name = data?.full_name;
    formValue.gender = data?.gender;
    formValue.dob = data?.dob ? dayjs(data?.dob).valueOf() : null;
    formValue.email = data?.email;
    formValue.phone = data?.phone;
    formValue.type = data?.type;
    formValue.address.province = data?.province_id;
    formValue.address.district = data?.district_id;
    formValue.address.address = data?.address;
    formValue.branch_id = data?.branch_id;
    optionsDistricts.params.province = data?.province_id;
    formValue.status = data?.status;
    if (data?.province?.id > 20) {
      optionsProvinces.default = data.province;
      optionsProvinces.data.push({
        value: data?.province?.id,
        label: data?.province?.name,
      });
    }
    if (data?.district?.id > 20) {
      optionsDistricts.default = data.district;
      optionsDistricts.data.push({
        value: data?.district?.id,
        label: data?.district?.name,
      });
    }
  }
  showSpin.value = false;
}

const handleSubmit = async (e) => {
  if (isLoading.value) return;
  e.preventDefault();

  const { id, name, gender, dob, email, phone, address, status, type } =
    formValue;

  if (address?.address?.length > 250) return;
  const unit_id = sessionStorage.getItem("unit_id");

  let body = {
    id,
    full_name: name,
    gender,
    dob: dayjs(dob).isValid() ? dayjs(dob).toISOString() : null,
    email,
    phone,
    province_id: Number(address.province),
    district_id: Number(address.district),
    address: address.address,
    status,
    type: Number(type),
  };
  try {
    await formRef.value?.validate();
    if (id) {
      const { data: resUpdate, error } = await restAPI.cms.updateStudent({
        id,
        body,
      });
      if (resUpdate?.value?.status) {
        message.success("Cập nhật thông tin học viên thành công!");
      } else {
        message.error(error.value.data.message);
      }
    } else {
      const { data: resCreate, error } = await restAPI.cms.createStudent({
        body,
      });
      if (resCreate?.value?.status) {
        message.success("Tạo học viên thành công!");
        const newId = resCreate.value.data;
        router.push({ path: window.location.pathname, query: { id: newId } });
      } else {
        message.error(error.value.data.message);
      }
    }
  } catch (err) {
    message.error("Vui lòng kiểm tra lại thông tin!");
    console.error("API error:", err);
  } finally {
    isLoading.value = false;
  }
};

const loadProvinces = async () => {
  if (optionsProvinces.loading) return;

  optionsProvinces.loading = true;

  try {
    const { data: resData, error } = await restAPI.cms.getProvinces({
      cache: "force-cache",
    });

    if (resData.value?.status) {
      const newProvinces = resData.value?.data?.data || [];

      newProvinces.forEach((item) => {
        const exists = optionsProvinces.data.some(
          (province) => province.value === item.id,
        );

        if (!exists) {
          optionsProvinces.data.push({
            value: item.id,
            label: item.name,
          });
        }
      });

      if (newProvinces.length === 0) {
        message.info("All provinces loaded.");
      }
    } else {
      message.error("Failed to load provinces!");
    }
  } catch (err) {
    message.error("Error fetching provinces!");
    console.error(err);
  } finally {
    optionsProvinces.loading = false;
  }
};

const loadDistricts = async () => {
  optionsDistricts.loading = true;
  if (optionsDistricts.params.province) {
    const {
      data: resData,
      pending: loading,
      refresh,
    } = await restAPI.cms.getDistricts({
      params: optionsDistricts.params,
      cache: "force-cache",
    });
    if (resData.value?.status) {
      resData.value?.data?.data?.forEach((item) => {
        if (
          !optionsDistricts?.default?.id ||
          (optionsDistricts?.default?.id !== item?.id &&
            optionsDistricts.default?.name !== item?.name)
        ) {
          optionsDistricts.data.push({
            value: item?.id,
            label: item?.name,
          });
        }
      });
      optionsDistricts.params.page += 1;
    }
  } else {
    optionsDistricts.params.page = 1;
    optionsDistricts.data = [];
  }
  optionsDistricts.loading = false;
};

const handleUpdateProvince = async (value) => {
  if (optionsDistricts.params.province !== value) {
    formValue.address.district = null;
    optionsDistricts.params.province = value;
    optionsDistricts.params.page = 1;
    optionsDistricts.data = [];
    await loadDistricts();
  }
};

const handleScrollProvinces = async (e) => {
  const currentTarget = e.currentTarget;
  if (
    currentTarget.scrollTop + currentTarget.offsetHeight + 150 >=
      currentTarget.scrollHeight &&
    !optionsProvinces.loading
  ) {
    await loadProvinces();
  }
};

const handleScrollDistricts = async (e) => {
  const currentTarget = e.currentTarget;
  if (
    currentTarget.scrollTop + currentTarget.offsetHeight + 150 >=
      currentTarget.scrollHeight &&
    !optionsDistricts.loading
  ) {
    await loadDistricts();
  }
};

onMounted(async () => {
  await loadProvinces();
  if (optionsDistricts.params.province) {
    await loadDistricts();
  }
});
</script>

<template>
  <n-spin :show="showSpin" class="px-5">
    <n-form :model="formValue" :rules="rules" ref="formRef">
      <n-grid :x-gap="30" cols="1 m:2" responsive="screen" class="my-5">
        <n-gi>
          <n-form-item label="Họ và tên học viên" path="name">
            <n-input
              v-model:value="formValue.name"
              placeholder="Điền tên nhóm học viên"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item
            class="mt-7"
            label="Trạng thái tài khoản"
            label-placement="left"
            path="switchValue"
          >
            <n-switch
              :unchecked-value="1"
              :checked-value="2"
              v-model:value="formValue.status"
              :rail-style="railStyle"
            />
          </n-form-item>
        </n-gi>

        <n-gi>
          <n-form-item label="Giới tính">
            <n-select
              v-model:value="formValue.gender"
              :options="options"
              placeholder="Chọn giới tính"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="Ngày sinh">
            <n-date-picker
              class="w-full"
              v-model:value="formValue.dob"
              type="date"
              placeholder="Chọn ngày"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="Email" path="email">
            <n-input
              type="email"
              v-model:value="formValue.email"
              placeholder="Nhập email"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="Số điện thoại" path="phone">
            <n-input
              type="tel"
              v-model:value="formValue.phone"
              placeholder="Nhập số điện thoại"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:2">
          <n-form-item label="Địa chỉ" path="address">
            <n-grid :x-gap="30" cols="1 m:2" responsive="screen">
              <n-gi>
                <n-select
                  v-model:value="formValue.address.province"
                  :loading="optionsProvinces.loading"
                  @scroll="handleScrollProvinces"
                  @update:value="handleUpdateProvince"
                  :options="optionsProvinces.data"
                  placeholder="Tỉnh/Thành phố"
                  class="custom-select-no-bg"
                />
              </n-gi>
              <n-gi>
                <n-select
                  v-model:value="formValue.address.district"
                  :loading="optionsDistricts.loading"
                  @scroll="handleScrollDistricts"
                  :options="optionsDistricts.data"
                  placeholder="Quận/Huyện"
                />
              </n-gi>
              <n-gi span="1 m:2" class="mt-2">
                <n-input
                  v-model:value="formValue.address.address"
                  placeholder="Nhập địa chỉ"
                />
              </n-gi>
            </n-grid>
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-button
            round
            type="info"
            class="h-12 w-52 rounded-2xl text-lg"
            :loading="isLoading"
            @click.prevent="handleSubmit"
          >
            Lưu
          </n-button>
        </n-gi>
      </n-grid>
    </n-form>
  </n-spin>
</template>
