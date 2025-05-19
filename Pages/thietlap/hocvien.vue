<script setup>
import { ref, watch, computed } from "vue";

const exist = ref(4);
const massadd = ref(false);
const number = ref(0); // Number starts at 0
const mainName = ref(""); // Separate name input (not part of Addform)
const Addform = ref([]);
const errors = ref({ number: "", mainName: "" });

// Function to update Addform based on number input
const updateAddform = () => {
  Addform.value = Array.from({ length: number.value }, (_, index) => ({
    name: mainName.value
      ? `${mainName.value} ${exist.value + index + 1}`
      : `${exist.value + index + 1}`,
    is_trial: false,
  }));
};

// Watch number changes and update Addform accordingly
watch(number, (newVal, oldVal) => {
  if (newVal < 1) {
    errors.value.number = "Số lượng phải lớn hơn 0"; // Number must be > 0
  } else {
    errors.value.number = "";
  }

  if (newVal > oldVal) {
    for (let i = oldVal; i < newVal; i++) {
      Addform.value.push({
        name: mainName.value
          ? `${mainName.value} ${exist.value + i + 1}`
          : `${exist.value + i + 1}`,
        is_trial: false,
        is_live: true, // Always set to true
      });
    }
  } else {
    Addform.value.length = newVal;
  }
});

// Watch mainName changes and update names
watch(mainName, (newVal) => {
  if (!newVal) {
    errors.value.mainName = "Tên chính không được để trống"; // Main name is required
  } else {
    errors.value.mainName = "";
  }

  Addform.value.forEach((item, index) => {
    item.name = newVal
      ? `${newVal} ${exist.value + index + 1}`
      : `${exist.value + index + 1}`;
  });
});

// Master checkbox logic
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

// Validate inputs before submitting
const validateForm = () => {
  let valid = true;

  if (number.value < 1) {
    errors.value.number = "Số lượng phải lớn hơn 0";
    valid = false;
  }

  if (!mainName.value) {
    errors.value.mainName = "Tên chính không được để trống";
    valid = false;
  }

  return valid;
};

// Submit function
const handleSubmit = () => {
  if (!validateForm()) return; // Stop if validation fails

  const submittedData = Addform.value.map(({ name, is_trial, is_live }) => ({
    name,
    is_trial,
    is_live, // Always included in submission
  }));

  console.log("Form Submitted:", submittedData);
  alert(JSON.stringify(submittedData, null, 2));
};
</script>

<template>
  <div>
    <!-- Toggle Switch -->
    <n-switch v-model:value="massadd" />

    <!-- Conditional Display -->
    <div v-if="!massadd">A</div>
    <div v-else>
      <n-grid cols="2" :x-gap="20" :y-gap="10">
        <!-- Number Input (Required) -->
        <n-gi>
          <n-input-number
            v-model:value="number"
            clearable
            :min="0"
            :max="10"
            placeholder="Nhập số lượng"
          />
          <n-text v-if="errors.number" type="error">{{ errors.number }}</n-text>
        </n-gi>

        <!-- Separate Name Input (Required) -->
        <n-gi>
          <n-input v-model:value="mainName" placeholder="Nhập tên chính" />
          <n-text v-if="errors.mainName" type="error">{{
            errors.mainName
          }}</n-text>
        </n-gi>

        <!-- Master Checkbox Section -->
        <n-gi>
          <h1>Danh sách buổi học</h1>
        </n-gi>
        <n-gi>
          <n-checkbox
            v-model:checked="masterChecked"
            :indeterminate="masterChecked === null"
          >
            Chọn tất cả
          </n-checkbox>
        </n-gi>

        <!-- Dynamic Fields -->
        <n-gi v-for="(item, index) in Addform" :key="index" span="2">
          <n-grid cols="3" :x-gap="20">
            <n-gi>
              <!-- Dynamic Input Field (Readonly, absolute value) -->
              <n-input v-model:value="item.name" readonly />
            </n-gi>
            <n-gi>
              <!-- Child Checkbox -->
              <n-checkbox v-model:checked="item.is_trial" />
            </n-gi>
          </n-grid>
        </n-gi>
      </n-grid>

      <!-- Submit Button -->
      <div style="margin-top: 20px">
        <n-button type="primary" @click="handleSubmit">Submit</n-button>
      </div>
    </div>
  </div>
</template>
