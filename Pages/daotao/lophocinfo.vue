<script setup lang="ts">
import { DaotaoLophocDanhsach } from "#components";
import { reactive, ref } from "vue";

const dropdowns = reactive<{ [key: string]: boolean }>({
  coban: true,
  noidung: false,
  xeplich: false,
  danhsach: false,
});
const isCollapsed = ref(false);
const activeDropdown = ref("coban");
const subjectID = ref("");

const handleUpdate = (value: string) => {
  subjectID.value = value;
};

const toggleDropdown = (menu: string) => {
  if (menu.startsWith("noidung-")) {
    if (activeDropdown.value === menu) {
      activeDropdown.value = "";
    } else {
      activeDropdown.value = menu;
    }
    return;
  }
  if (dropdowns[menu]) {
    // Close the dropdown if already open
    dropdowns[menu] = false;
    activeDropdown.value = "";
  } else {
    // Close all dropdowns
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    // Open the clicked dropdown
    dropdowns[menu] = true;
    activeDropdown.value = menu;
  }
};
</script>
<template>
  <div class="flex h-full w-full">
    <div class="flex h-full w-1/6">
      <nav>
        <ul class="flex flex-col">
          <li
            @click="toggleDropdown('coban')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-16',
              activeDropdown === 'coban'
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'coban'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Thông tin cơ bản
          </li>
          <li
            @click="toggleDropdown('noidung')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-16',
              activeDropdown.startsWith('noidung')
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown.startsWith('noidung')
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nội dung bài giảng
          </li>
          <li
            @click="toggleDropdown('xeplich')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-16',
              activeDropdown === 'xeplich'
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'xeplich'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Xếp lịch học
          </li>
          <li
            @click="toggleDropdown('danhsach')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-16',
              activeDropdown === 'danhsach'
                ? '-mr-4 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px]',
                activeDropdown === 'danhsach'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i
            >Danh sách học viên
          </li>
        </ul>
      </nav>
    </div>
    <div class="flex h-full w-5/6 overflow-auto rounded-2xl bg-gray-50">
      <!-- Main Content -->
      <div class="flex-1">
        <nav>
          <ul class="mx-5 my-5 flex flex-col gap-y-5 text-xl">
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('coban')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'coban'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Thông tin cơ bản</div>
                </span>
                <i
                  :class="
                    dropdowns.coban
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.coban" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoLophocNewclass @update-value="handleUpdate" />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('noidung')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown.startsWith('noidung')
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Nội dung bài giảng</div>
                </span>
                <i
                  :class="
                    dropdowns.noidung
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.noidung" class="w-ful h-full">
                <li>
                  <DaotaoMonhocmoiLesson :correctSubjectId="subjectID" />
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('xeplich')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'xeplich'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Xếp lịch học</div>
                </span>
                <i
                  :class="
                    dropdowns.xeplich
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.xeplich" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoLophocXeplop :correctSubjectId="subjectID" />
                  </div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('danhsach')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'danhsach'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Danh sách học viên</div>
                </span>
                <i
                  :class="
                    dropdowns.danhsach
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.danhsach" class="w-ful h-full">
                <li>
                  <div class="w-ful h-full" v-if="!isCollapsed">
                    <DaotaoLophocDanhsach />
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
