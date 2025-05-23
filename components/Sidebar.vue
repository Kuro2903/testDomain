<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from "vue";

const dropdowns = reactive<{ [key: string]: boolean }>({
  tuyensinh: false,
  daoTao: false,
  taichinh: false,
  nhansu: false,
  baocao: false,
  thietlap: false,
});

const activeDropdown = ref("");
const activeItem = ref("");

const setActive = (menu: string, dropdown?: string) => {
  activeItem.value = menu;
  if (dropdown) {
    dropdowns[dropdown] = true;
    activeDropdown.value = dropdown;
  } else {
    Object.keys(dropdowns).forEach((key) => {
      dropdowns[key] = false;
    });
    activeDropdown.value = "";
  }
};
const toggleDropdown = (menu: string) => {
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
const isCollapsed = ref(false);

const handleResize = () => {
  isCollapsed.value = window.innerWidth < 1500;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <aside class="h-in-sreen w-1/6 min-w-min overflow-auto bg-white shadow-md">
    <!-- User Info -->
    <div class="flex items-center space-x-3 border-b p-4">
      <img
        src="../public/images/becoming-a-technical-leader.webp"
        alt="User Avatar"
        class="h-10 w-10 rounded-full"
      />
      <div v-if="!isCollapsed">
        <h3 class="text-sm font-semibold text-black">Đào Thị Hồng Thư</h3>
        <p class="text-xs text-gray-500">Giám đốc trung tâm</p>
      </div>
    </div>

    <!-- Menu -->
    <nav class="mt-4">
      <ul class="space-y-2">
        <!-- Menu Item -->
        <li>
          <NuxtLink
            to="/dashboard"
            :class="[
              'flex items-center px-4 py-2.5 hover:bg-blue-50',
              activeItem === 'home'
                ? 'bg-blue-100 text-blue-500'
                : 'text-gray-600',
            ]"
            @click="setActive('')"
          >
            <i class="fas fa-home mr-3"></i>
            <div v-if="!isCollapsed">Không gian chung</div>
          </NuxtLink>
        </li>

        <!-- Dropdown Menu -->
        <li>
          <div
            @click="toggleDropdown('tuyensinh')"
            :class="[
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',

              activeDropdown === 'tuyensinh'
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-tower-broadcast mr-3"></i>
              <div v-if="!isCollapsed">Tuyển Sinh</div>
            </span>
            <i
              :class="
                dropdowns.tuyensinh
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.tuyensinh"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="/blog"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem == 'tuyensinhpage'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('tuyensinhpage', 'tuyensinh')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'tuyensinhpage'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                tuyen sinh page
              </NuxtLink>
            </li>
          </ul>
        </li>

        <li>
          <div
            @click="toggleDropdown('daoTao')"
            :class="[
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',
              activeDropdown === 'daoTao'
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-graduation-cap mr-3"></i>
              <div v-if="!isCollapsed">Đào tạo</div>
            </span>
            <i
              :class="
                dropdowns.daoTao
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.daoTao"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="../daotao/monhoc"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'monHoc' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('monHoc', 'daoTao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'monHoc'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Môn học
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="../daotao/lophoc"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'lophoc' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('lophoc', 'daoTao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'lophoc'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Lớp học
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="../daotao/hocvienct"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'hocvienct'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('hocvienct', 'daoTao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'hocvienct'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Học viên chính thức
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="../daotao/giangvien"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'giangvien'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('giangvien', 'daoTao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'giangvien'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Giảng viên
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="../daotao/lichhoc"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'lichhoc' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('lichhoc', 'daoTao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'lichhoc'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Lịch học
              </NuxtLink>
            </li>
          </ul>
        </li>

        <li>
          <div
            @click="toggleDropdown('taichinh')"
            :class="[
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',
              activeDropdown === 'taichinh'
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-arrow-trend-up mr-3"></i>
              <div v-if="!isCollapsed">Tài Chính</div>
            </span>
            <i
              :class="
                dropdowns.taichinh
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.taichinh"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="../taichinh/popup"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'taichinh'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('taichinh', 'taichinh')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'taichinh'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                something
              </NuxtLink>
            </li>
          </ul>
        </li>

        <li>
          <div
            @click="toggleDropdown('nhansu')"
            :class="[
              dropdowns.nhansu
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-user mr-3"></i>
              <div v-if="!isCollapsed">Nhân Sự</div>
            </span>
            <i
              :class="
                dropdowns.nhansu
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.nhansu"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="../nhansu/danhsach"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'danhsach'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('danhsach', 'nhansu')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'danhsach'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Danh sách nhân sự
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="../nhansu/phanquyen"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'phanquyen'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('phanquyen', 'nhansu')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'phanquyen'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Phân Quyền
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/dashboard"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'chamcong'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('chamcong', 'nhansu')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'chamcong'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Bảng chấm công
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/dashboard"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'nhiemvu' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('nhiemvu', 'nhansu')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'nhiemvu'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Nhiệm vụ
              </NuxtLink>
            </li>
          </ul>
        </li>

        <!-- Another Dropdown Menu -->
        <li>
          <div
            @click="toggleDropdown('baocao')"
            :class="[
              activeDropdown === 'baocao'
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-chart-simple mr-3"></i>
              <div v-if="!isCollapsed">Báo cáo</div>
            </span>
            <i
              :class="
                dropdowns.baocao
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.baocao"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="/dashboard"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'baocao' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('baocao', 'baocao')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'baocao'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Báo cáo
              </NuxtLink>
            </li>
          </ul>
        </li>
        <li>
          <div
            @click="toggleDropdown('thietlap')"
            :class="[
              activeDropdown === 'thietlap'
                ? 'bg-blue-100 font-semibold text-blue-500'
                : 'text-gray-600',
              'flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-blue-100 hover:text-blue-500',
            ]"
          >
            <span class="flex items-center">
              <i class="fas fa-cogs mr-3"></i>
              <div v-if="!isCollapsed">Thiết lập</div>
            </span>
            <i
              :class="
                dropdowns.thietlap
                  ? 'fas fa-chevron-down'
                  : 'fas fa-chevron-right'
              "
            ></i>
          </div>
          <ul
            v-if="dropdowns.thietlap"
            class="ml-6 mt-2 space-y-1 text-sm text-gray-500"
          >
            <li>
              <NuxtLink
                to="../thietlap/hocvien"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'tkhvt' ? 'font-semibold text-blue-500' : '',
                ]"
                @click="setActive('tkhvt', 'thietlap')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'tkhvt'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                TestGround
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="../thietlap/trungtam"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'thongtin'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('thongtin', 'thietlap')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'thongtin'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Thông tin đơn vị
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/dashboard"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'taikhoan'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('taikhoan', 'thietlap')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'taikhoan'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Tài Khoản
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/dashboard"
                class="block px-2 py-1 hover:text-blue-500"
                :class="[
                  'block px-2 py-1 hover:text-blue-500',
                  activeItem === 'phanquyen'
                    ? 'font-semibold text-blue-500'
                    : '',
                ]"
                @click="setActive('phanquyen', 'thietlap')"
              >
                <i
                  :class="[
                    'fa-2xs mr-5',
                    activeItem === 'phanquyen'
                      ? 'fas fa-circle'
                      : 'fas fa-circle-dot',
                  ]"
                >
                </i>
                Phân quyền
              </NuxtLink>
            </li>
          </ul>
        </li>

        <!-- Single Items -->
        <li>
          <NuxtLink
            to="#"
            :class="[
              'flex items-center px-4 py-2.5 hover:bg-blue-50',
              activeItem === 'thongBao'
                ? 'bg-blue-100 text-blue-500'
                : 'text-gray-600',
            ]"
            @click="setActive('thongBao')"
          >
            <i class="fas fa-bell mr-3"></i>
            <div v-if="!isCollapsed">Thông báo</div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="#"
            :class="[
              'flex items-center px-4 py-2.5 hover:bg-blue-50',
              activeItem === 'bcdaotao'
                ? 'bg-blue-100 text-blue-500'
                : 'text-gray-600',
            ]"
            @click="setActive('bcdaotao')"
          >
            <i class="fas fa-chart-bar mr-3"></i>
            <div v-if="!isCollapsed">Báo cáo đào tạo</div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="#"
            :class="[
              'flex items-center px-4 py-2.5 hover:bg-blue-50',
              activeItem === 'help'
                ? 'bg-blue-100 text-blue-500'
                : 'text-gray-600',
            ]"
            @click="setActive('help')"
          >
            <i class="fas fa-circle-question mr-3"></i>
            <div v-if="!isCollapsed">Trung tâm trợ giúp</div>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
/* Add any custom styles here if needed */
</style>
