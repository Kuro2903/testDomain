<script setup>
import { DaotaoMonhocmoiLesson } from "#components";
import { reactive, ref } from "vue";

const isCollapsed = ref(false);
const dropdowns = reactive({
  coban: true,
  noidung: false,
  chungchi: false,
  caidat: false,
  chamsoc: false,
});
const activeDropdown = ref("coban");

const toggleDropdown = (menu) => {
  if (menu.startsWith("noidung-")) {
    activeDropdown.value = activeDropdown.value === menu ? "" : menu;
    return;
  }

  if (dropdowns[menu]) {
    dropdowns[menu] = false;
    activeDropdown.value = "";
  } else {
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
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
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'coban'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
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
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown.startsWith('noidung')
                ? '-mr-14 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'noidung'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Nội dung bài giảng
          </li>
          <li
            @click="toggleDropdown('chungchi')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'chungchi'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'chungchi'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Chứng chỉ
          </li>
          <li
            @click="toggleDropdown('caidat')"
            :class="[
              'relative flex cursor-pointer items-center py-3 pl-3 pr-10',
              activeDropdown === 'caidat'
                ? '-mr-12 bg-gray-50 pr-0 text-[#133D85]'
                : 'text-[#4D6FA8]',
            ]"
          >
            <i
              :class="[
                'pr-3 text-[8px] text-[#133D85]',
                activeDropdown === 'caidat'
                  ? 'fa-solid fa-circle text-[#133D85]'
                  : 'fa-solid fa-circle-dot text-[#4D6FA8]',
              ]"
            ></i>
            Cài đặt
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
              <ul v-if="dropdowns.coban" class="h-full w-full">
                <li>
                  <div class="h-full w-full" v-if="!isCollapsed">
                    <DaotaoMonhocmoiClassInfo />
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
                  <DaotaoMonhocmoiLesson />
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('chungchi')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'chungchi'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Chứng chỉ</div>
                </span>
                <i
                  :class="
                    dropdowns.chungchi
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <ul v-if="dropdowns.chungchi" class="h-full w-full">
                <li>
                  <div class="h-full w-full" v-if="!isCollapsed"></div>
                </li>
              </ul>
            </li>
            <li class="rounded-2xl text-[#133D85]">
              <div
                @click="toggleDropdown('caidat')"
                :class="[
                  'flex cursor-pointer items-center justify-between px-4 py-2.5',

                  activeDropdown === 'caidat'
                    ? 'rounded-3xl bg-gray-300 text-[#133D85]'
                    : 'rounded-3xl bg-gray-200 text-gray-600',
                ]"
              >
                <span class="flex items-center">
                  <div v-if="!isCollapsed">Cài đặt</div>
                </span>
                <i
                  :class="
                    dropdowns.caidat
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <DelModal @confirm-delete="handleConfirmDelete" ref="delref" />
  </div>
</template>
