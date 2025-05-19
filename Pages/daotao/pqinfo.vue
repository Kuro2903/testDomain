<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { NPopover } from "naive-ui";
import { useRouter, useRoute } from "vue-router";

const { restAPI } = useApi();
const isLoading = ref(false);
const PermsList = ref([]);
const selectedData = defineModel();
const keyLevel1 = ref();
const keyLevel2 = ref();
const route = useRoute();
const router = useRouter();
const isAll = ref(false);
const formRef = ref(null);
const message = useMessage();

const formValue = reactive({
  name: null,
  is_active: true,
});

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

const rules = {
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (rule, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Tên nhóm quyền không được để trống."));
        else if (newValue.length > 50)
          reject(Error("Bạn đã nhập vượt quá 50 ký tự."));
        else return resolve();
      });
    },
  },
};
watch(
  () => formValue.name,
  async (newValue) => {
    if (newValue) {
      formRef.value?.validate(["name"]).catch(() => {});
    }
  },
);

const { data: resData, error } = await restAPI.cms.getPermissionTags({});
const listPer = resData.value?.data?.data || [];
const permissionWith = resData.value?.data?.permissions_going_with || {};
listPer.forEach((level1) => {
  const lv1 = {
    id: level1.id,
    name: level1.name,
    key: level1?.key || null,
    checked: isAll.value,
    countSelected: 0,
    total: 0,
    listLevel1: level1.sub_tags?.map((level2) => {
      const lv2 = {
        id: level2.id,
        name: level2.name,
        key: level2?.key || null,
        checked: isAll.value,
        countSelected: 0,
        total: level2.permissions?.length || 0,
        listLevel2: level2.permissions?.map((level3) => {
          return {
            id: level3.id,
            name: level3.name,
            disabled: false,
            action: level3.action,
            checked: false,
          };
        }),
      };

      return lv2;
    }),
  };

  lv1.total = lv1.listLevel1.reduce((acc, curr) => acc + curr.total, 0);

  PermsList.value.push(lv1);
});

const loadData = async () => {
  const { data: resData, error } = await restAPI.cms.getPermissionGroupsDetails(
    {
      id: route.query.id,
    },
  );
  console.log(resData.value.data);
  formValue.name = resData.value.data.name;
  formValue.is_active = resData.value.data.is_active;
  const fetchedPermissions = resData.value.data?.tags || [];
  // console.log(fetchedPermissions);
  // Update the permissions using the fetched data
  // console.log("before: ", PermsList.value);
  updateCheckedStatus(fetchedPermissions, PermsList.value);
  // console.log("after: ", PermsList.value);
  updatePermissions(PermsList.value, permissionWith);

  selectedData.value = PermsList.value;
};

const load = () => {
  if (route.params.slug && !isAll.value) {
    const editDataTags = props.data?.tags || [];
    updateCheckedStatus(editDataTags, PermsList.value);
    updatePermissions(PermsList.value, permissionWith);
  } else {
    updatePermissions(PermsList.value, permissionWith);
  }
  selectedData.value = PermsList.value;
};

const updateCheckedStatus = (fetchedPermissions, permsList) => {
  permsList.forEach((level1) => {
    const matchedLevel1 = fetchedPermissions.find((p) => p.id === level1.id);
    if (matchedLevel1) {
      level1.checked = matchedLevel1.checked;
      level1.countSelected = matchedLevel1.countSelected || 0;

      level1.listLevel1.forEach((level2) => {
        const matchedLevel2 = matchedLevel1.listLevel1.find(
          (p) => p.id === level2.id,
        );
        if (matchedLevel2) {
          level2.checked = matchedLevel2.checked;
          level2.total = matchedLevel2.total;

          level2.listLevel2.forEach((level3) => {
            const matchedLevel3 = matchedLevel2.selectedActions.find(
              (p) => p.id === level3.id,
            );
            if (matchedLevel3) {
              level3.checked = matchedLevel3.checked;
            }
          });
        }
      });
    }
  });
};

watch(
  () => selectedData.value,
  () => {
    const currentTag = selectedData.value.find((t) => t.id == keyLevel1.value);
    if (currentTag) {
      currentTag.checked = currentTag.listLevel1.every((tag) => tag.checked);
    }
    isAll.value = selectedData.value.every((tag) => tag.checked);
    updatePermissions(selectedData.value, permissionWith);
  },
  {
    deep: true,
  },
);
onMounted(() => {
  if (route.query.id) {
    loadData();
  } else {
    load();
  }
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Function
function handleCheckAll(checked) {
  selectedData.value.forEach((lv1) => {
    lv1.checked = checked;
    lv1.listLevel1.forEach((lv2) => {
      lv2.checked = checked;
      lv2.listLevel2.forEach((lv3) => {
        lv3.checked = checked;
        if (!checked) lv3.disabled = checked;
      });
    });
  });
}
function handleSelectLevel1(checked, tag) {
  tag.checked = checked;
  tag.listLevel1.forEach((lv1) => {
    lv1.checked = checked;
    lv1.listLevel2.forEach((lv2) => {
      lv2.checked = checked;
      if (!checked) lv2.disabled = checked;
    });
  });
}
function handleSelectLevel2(checked, tag) {
  tag.checked = checked;
  tag.listLevel2.forEach((lv2) => {
    lv2.checked = checked;
    lv2.disabled = false;
  });
  const tagLevel1 = selectedData.value.find((t) => t.id == keyLevel1.value);
  tagLevel1.checked = tagLevel1.listLevel1.every((tag) => tag.checked);
}
async function handleSelectLevel3(checked, tag) {
  tag.checked = checked;
  const tagLevel1 = selectedData.value.find((t) => t.id == keyLevel1.value);
  const tagLevel2 = tagLevel1.listLevel1.find((t) => t.id == keyLevel2.value);

  if (checked) {
    const actionList = permissionWith[tag.action] || [];
    const actionTag = tagLevel2.listLevel2.filter((c) =>
      actionList.includes(c.action),
    );
    await Promise.all(
      actionTag.map(async (tag) => {
        tag.checked = checked;
        tag.disabled = checked;
      }),
    );
  } else {
    const disabledTag = tagLevel2.listLevel2.filter((t) => t.disabled);
    await Promise.all(
      disabledTag.map(async (tag) => {
        tag.checked = false;
        tag.disabled = false;
      }),
    );
  }
  tagLevel2.checked = tagLevel2.listLevel2.every((tag) => tag.checked);
}
function handleOpenMenuLevel1(tag) {
  if (tag.id == keyLevel1.value) handleClickOutside();
  else {
    if (tag.listLevel1.length) keyLevel1.value = tag.id;
    else keyLevel1.value = null;
  }
}
function handleOpenMenuLevel2(tag) {
  if (tag.id == keyLevel2.value) keyLevel2.value = null;
  else {
    if (tag.listLevel2.length) keyLevel2.value = tag.id;
    else keyLevel2.value = null;
  }
}
function handleClickOutside(e) {
  keyLevel1.value = null;
  keyLevel2.value = null;
}
function updatePermissions(data, permissionWith) {
  data.forEach((level0) => {
    level0.listLevel1.forEach((level1) => {
      level1.listLevel2.forEach((level2) => {
        if (level2.checked) {
          const requiredActions = permissionWith[level2.action] || [];
          level1.listLevel2.forEach((item) => {
            if (requiredActions.includes(item.action)) {
              item.checked = true;
              item.disabled = true;
            }
          });
        }
      });
    });

    const countSelected = level0.listLevel1.reduce((acc, curr) => {
      const childCount = curr.listLevel2.reduce(
        (childAcc, childCurr) => (childAcc += childCurr.checked ? 1 : 0),
        0,
      );
      return (acc += childCount);
    }, 0);
    level0.countSelected = countSelected;
  });
}

const handleSubmit = async (e) => {
  if (isLoading.value) return;

  const valid = await formRef.value.validate();
  if (!valid) return;

  const { name, is_active } = formValue;

  let permission_ids = [];

  const tags = selectedData.value.map((level1) => ({
    id: level1.id,
    name: level1.name,
    checked: level1.checked,
    countSelected: level1.listLevel1.reduce(
      (count, level2) =>
        count + level2.listLevel2.filter((level3) => level3.checked).length,
      0,
    ),
    listLevel1: level1.listLevel1.map((level2) => ({
      id: level2.id,
      name: level2.name,
      checked: level2.checked,
      total: level2.listLevel2.length,
      selectedActions: level2.listLevel2
        .filter((level3) => {
          if (level3.checked) permission_ids.push(level3.id);
          return level3.checked;
        })
        .map((level3) => ({
          id: level3.id,
          name: level3.name,
          action: level3.action,
          checked: level3.checked,
        })),
    })),
  }));

  const payload = {
    name,
    is_active,
    is_selected_all: isAll.value,
    tags,
    permission_ids,
  };

  if (route.query.id) {
    const { data: resUpdate, error } = await restAPI.cms.updatePermissionGroups(
      {
        id: route.query.id,
        body: JSON.stringify(payload),
      },
    );

    if (resUpdate?.value?.status) {
      message.success("Cập nhật nhóm phân quyền thành công!");
      router.push("phanquyen");
    } else {
      message.error(resUpdate?.value?.message || "Cập nhật thất bại!");
    }
  } else {
    const { data: resCreate, error } = await restAPI.cms.createPermissionGroups(
      {
        body: JSON.stringify(payload),
      },
    );

    if (resCreate?.value?.status) {
      message.success("Tạo nhóm phân quyền thành công!");
      router.push("phanquyen");
    } else {
      message.error(error?.value?.data?.message || "Tạo mới thất bại!");
    }
  }
  isLoading.value = false;
};
</script>
<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <n-form
      class="mx-10 w-full overflow-auto py-10"
      :rules="rules"
      :model="formValue"
      ref="formRef"
    >
      <n-grid cols="4" :x-gap="40" class="text-[#133D85]">
        <n-gi span="1">
          <n-form-item
            label="Tên nhóm quyền"
            path="name"
            :label-style="{ fontSize: '16px' }"
          >
            <n-input
              placeholder="Tên nhóm quyền"
              v-model:value="formValue.name"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="1">
          <n-form-item
            class="mt-7"
            label="Trạng thái hoạt động"
            label-placement="left"
            path="switchValue"
            :label-style="{ fontSize: '16px' }"
          >
            <n-switch
              v-model:value="formValue.is_active"
              :unchecked-value="false"
              :checked-value="true"
              :rail-style="railStyle"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2"></n-gi>
        <n-gi span="2">
          <n-form-item
            label="Phân quyền:"
            label-placement="left"
            :label-style="{ fontSize: '16px', transform: 'translateY(-10px)' }"
          >
            <div>
              <n-checkbox
                v-model:checked="isAll"
                label="Chọn tất cả"
                class="my-checkbox"
                @click.stop
                :on-update:checked="handleCheckAll"
              />
              <div class="min-w-200px mt-3 space-y-3">
                <div
                  v-for="tag in selectedData"
                  :key="tag"
                  class="flex items-center justify-between"
                >
                  <n-checkbox
                    :checked="tag.checked"
                    :label="`${tag.name} (${tag.countSelected}/${tag.total})`"
                    class="my-checkbox"
                    @click.stop
                    :on-update:checked="
                      (checked) => handleSelectLevel1(checked, tag)
                    "
                  />
                  <n-popover
                    :show="keyLevel1 == tag.id"
                    placement="right-start"
                    trigger="manual"
                    @click.stop
                    class="per-popover"
                  >
                    <template #trigger>
                      <button
                        class="px-2 py-1.5"
                        @click.stop="handleOpenMenuLevel1(tag)"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          :class="keyLevel1 == tag.id && 'rotate-90'"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M4.29274 1.46477C3.90222 1.07424 3.26905 1.07424 2.87853 1.46477C2.488 1.85529 2.488 2.48846 2.87853 2.87898L4.99982 5.00028L2.8785 7.1216C2.48798 7.51212 2.48798 8.14529 2.8785 8.53581C3.26903 8.92633 3.90219 8.92633 4.29272 8.53581L7.11503 5.71349C7.11709 5.71147 7.11913 5.70945 7.12117 5.70741C7.50559 5.32299 7.5116 4.70345 7.13919 4.31168C7.13328 4.30546 7.12727 4.2993 7.12117 4.2932C7.12116 4.29319 7.12115 4.29318 7.12114 4.29317C7.12107 4.2931 7.121 4.29303 7.12094 4.29296L4.29274 1.46477Z"
                            :class="
                              keyLevel1 == tag.id
                                ? 'fill-[#090025]'
                                : 'fill-[#090025]'
                            "
                          />
                        </svg>
                      </button>
                    </template>
                    <div class="per-shadow bg-white !p-0">
                      <div
                        v-if="
                          selectedData?.find((t) => t.id == keyLevel1)
                            ?.listLevel1?.length
                        "
                      >
                        <div
                          v-for="item in selectedData?.find(
                            (t) => t.id == keyLevel1,
                          )?.listLevel1"
                          :key="item.id"
                          class="w-full"
                        >
                          <div
                            class="flex w-full items-center justify-between py-1.5 pl-3.5 text-left"
                            :class="
                              keyLevel1 == item.id
                                ? 'bg-#E6F7FF per-shadow'
                                : keyLevel1 && 'per-shadow-x'
                            "
                          >
                            <n-checkbox
                              :checked="item.checked"
                              :label="`${item.name} (${item.listLevel2.filter((child) => child.checked).length}/${item.listLevel2.length})`"
                              class="my-checkbox min-w-[220px]"
                              :on-update:checked="
                                (checked) => handleSelectLevel2(checked, item)
                              "
                            />
                            <n-popover
                              :show="keyLevel2 == item.id"
                              placement="right-start"
                              trigger="click"
                              class="per-popover"
                            >
                              <template #trigger>
                                <button
                                  class="px-2 py-1.5"
                                  @click="handleOpenMenuLevel2(item)"
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="duration-300"
                                    :class="keyLevel2 == item.id && 'rotate-90'"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M4.29274 1.46477C3.90222 1.07424 3.26905 1.07424 2.87853 1.46477C2.488 1.85529 2.488 2.48846 2.87853 2.87898L4.99982 5.00028L2.8785 7.1216C2.48798 7.51212 2.48798 8.14529 2.8785 8.53581C3.26903 8.92633 3.90219 8.92633 4.29272 8.53581L7.11503 5.71349C7.11709 5.71147 7.11913 5.70945 7.12117 5.70741C7.50559 5.32299 7.5116 4.70345 7.13919 4.31168C7.13328 4.30546 7.12727 4.2993 7.12117 4.2932C7.12116 4.29319 7.12115 4.29318 7.12114 4.29317C7.12107 4.2931 7.121 4.29303 7.12094 4.29296L4.29274 1.46477Z"
                                      :class="
                                        keyLevel2 == item.id
                                          ? 'fill-[#090025]'
                                          : 'fill-[#090025]'
                                      "
                                    />
                                  </svg>
                                </button>
                              </template>
                              <div
                                v-if="keyLevel2 == item.id"
                                class="per-shadow bg-white py-2"
                              >
                                <div v-if="item.listLevel2.length">
                                  <div
                                    v-for="child in item.listLevel2"
                                    :key="child.id"
                                    class="px-3.5 py-1.5"
                                  >
                                    <n-checkbox
                                      :label="child.name"
                                      class="my-checkbox-child"
                                      :checked="child.checked"
                                      :disabled="child.disabled"
                                      :on-update:checked="
                                        (checked) =>
                                          handleSelectLevel3(checked, child)
                                      "
                                    />
                                  </div>
                                </div>
                                <div
                                  v-else
                                  class="font-500 px-5 py-2 text-primary"
                                >
                                  Chưa có quyền nào
                                </div>
                              </div>
                            </n-popover>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else-if="keyLevel1"
                        class="font-500 px-5 py-2 text-primary"
                      >
                        Chưa có quyền nào
                      </div>
                    </div>
                  </n-popover>
                </div>
              </div>
            </div>
          </n-form-item>
        </n-gi>
        <n-gi span="2"></n-gi>
        <n-gi span="1"></n-gi>
        <n-gi>
          <div class="gap-30 col-start-2 row-start-6 flex-row">
            <n-space class="gap-50">
              <n-button
                class="h-11 w-24 text-lg text-blue-400"
                @click="$router.push('phanquyen')"
                >Hủy</n-button
              >
              <n-button
                type="info"
                class="h-11 w-24 text-lg"
                @click.prevent="handleSubmit"
                :loading="isLoading"
              >
                Lưu
              </n-button>
            </n-space>
          </div>
        </n-gi>
      </n-grid>
    </n-form>
  </div>
</template>
<style>
.my-checkbox .n-checkbox__label,
.my-checkbox-child .n-checkbox__label {
  @apply text-[15px] font-semibold text-[#133D85];
}

.my-checkbox.n-checkbox--checked .n-checkbox__label,
.my-checkbox-child.n-checkbox--checked .n-checkbox__label {
  @apply font-semibold text-[#0066CC];
}

.my-checkbox-child .n-checkbox__label {
  @apply text-sm;
}

.my-checkbox-child.n-checkbox--disabled .n-checkbox__label {
  @apply text-gray-400;
}

.per-popover.n-popover {
  @apply !rounded-none !border-none !bg-transparent !px-0 !py-1 !shadow-none;
}

/* n-popover n-popover-shared n-popover-shared--show-arrow */
.per-shadow {
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.25);
}

.per-shadow-x {
  /* box-shadow: -4px 0px 10px 0px rgba(0, 0, 0, 0.25), 4px 0px 0px 0px rgba(0, 0, 0, 0.25); */
}
</style>
