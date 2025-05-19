<template>
  <MenuLayout :menus v-model:collapsed="collapsed" :helps="helpsRemain" />
  <!-- {{ permissionMapping }} -->
</template>
<script setup>
const message = useMessage();
const userStore = useUserStore();
const permissionMapping = {
  "training/setting": [
    "training/setting/subject",
    "training/setting/classroom",
    "training/setting/program",
    "training/setting/category",
    "training/setting/certificate",
    "training/setting/other",
    "training/setting/document",
  ],
};

let timeInterval;
let conn;
let timeout = 250;

// function connectWs() {
//   conn = new WebSocket(
//     `${useRuntimeConfig().public.wsUrl}/ws?token=${userStore.userInfo?.token}`,
//   );
//   conn.onopen = (event) => {
//     timeInterval = setInterval(() => {
//       conn.send(JSON.stringify({ type: "ping" }));
//     }, 60000);
//   };
//   conn.onclose = (evt) => {
//     clearInterval(timeInterval);
//     if (timeout < 10000) setTimeout(connectWs, (timeout += timeout));
//   };
//   conn.onmessage = (evt) => {
//     const data = JSON.parse(evt?.data);
//     helpsRemain.value = data?.total_unhandled || 0;
//     if (data?.event_code === 1234) {
//       const showWarning = useDebounce(() => {
//         message.warning(t("common.permission.changed"));
//       }, 500);
//       showWarning();
//     }
//   };
// }
// connectWs();

// console.log("perm", userStore.permissions);
const checkPermissionMenu = (key) => {
  if (userStore.accessAll) return true;
  const path = key?.split("/");
  return userStore.permissions?.some((per) => {
    if (per?.key === key || per?.key === path[0]) {
      if (per?.checked) return true;

      return per?.listLevel1?.some((subP) => {
        const subKeys = permissionMapping[key];
        if (subKeys && subKeys.includes(subP?.key)) {
          if (subP?.checked) return true;
          return subP?.listLevel2?.some((pms) => pms?.checked);
        }
        if (per?.key === key || subP?.key === key) {
          if (subP?.checked) return true;
          return subP?.listLevel2?.some((pms) => pms?.checked);
        }
      });
    }
  });
};

const menus = ref([
  {
    label: "Không gian chung",
    key: `dashboard`,
    link_breadcrumb: true,
  },
  {
    label: "Tuyển sinh",
    key: `blog`,
    link_breadcrumb: true,
  },
  {
    label: "Đào tạo",
    key: `training`,
    show: checkPermissionMenu("training"),
    link_breadcrumb: false,
    children: [
      {
        label: "Lớp học",
        key: `daotao/lophoc`,
        show: checkPermissionMenu("training/class"),
      },
      {
        label: "Học viên chính thức",
        key: `daotao/hocvienct`,
        show: checkPermissionMenu("training/official_student"),
      },
      {
        label: "Lịch học",
        key: `daotao/lichhoc`,
        show: checkPermissionMenu("training/schedule"),
      },
    ],
  },
  {
    label: "Nhân sự",
    key: `staff`,
    show: checkPermissionMenu("staff"),
    // icon: renderIcon(StaffIcon),
    link_breadcrumb: false,
    children: [
      {
        label: "Danh sách nhân sự",
        key: `daotao/giangvien`,
        show: checkPermissionMenu("staff/list"),
        // icon: renderIconChild("/staff/list"),
      },
    ],
  },
]);
</script>
