<script setup>
import { ref, computed, onMounted, toRaw, nextTick } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

const message = useMessage();
const { restAPI } = useApi();
const data = ref([]);
const showSchedule = ref(false);
const currentClass = ref(null);
const scheduleMode = ref("week");
const dates = ref([]);
const route = useRoute();
const newId = route.query.id;
const formRefs = ref(null);
const maxLessonCount = computed(() => route.query.num);
const currentLessonCount = computed(() => {
  return Object.entries(formValue.value.sessions)
    .filter(([key]) => {
      if (scheduleMode.value === "week") {
        return !key.includes("/"); // Exclude date-based keys
      } else if (scheduleMode.value === "date") {
        return key.includes("/"); // Include only date-based keys
      }
      return true; // Default case, include everything
    })
    .reduce((total, [, sessions]) => total + sessions.length, 0);
});
const props = defineProps({
  correctSubjectId: String,
});
//Rules_________________________________________________________________________________________________
const rules = computed(() => {
  const sessionRules = {};
  for (const day in formValue.value.sessions) {
    formValue.value.sessions[day].forEach((_, index) => {
      sessionRules[`sessions.${day}.${index}.session`] = {
        required: true,
        message: "Ca học phải được chọn",
        trigger: ["blur", "change"],
      };
      sessionRules[`sessions.${day}.${index}.teacher`] = {
        required: true,
        message: "Giảng viên phải được chọn",
        trigger: ["blur", "change"],
      };
      sessionRules[`sessions.${day}.${index}.room`] = {
        required: true,
        message: "Phòng học phải được chọn",
        trigger: ["blur", "change"],
        validator(rule, value) {
          return value && value.length > 0
            ? Promise.resolve()
            : Promise.reject("Phòng học phải được chọn");
        },
      };
    });
  }
  return sessionRules;
});

//______________________________________________________________________________________________________

//Schedule______________________________________________________________________________________________
const daysOfWeek = ref([
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
]);

const selectedDays = ref([]);
const selectedDates = ref([]);
const DisplayDates = ref([]);
const selectedDisplay = computed(() => {
  if (scheduleMode.value === "date") {
    return selectedDates.value;
  } else if (scheduleMode.value === "week") {
    return selectedDays.value;
  }
  return [];
});

const toggleDay = (day, checked) => {
  const dayOrder = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ Nhật",
  ];
  if (checked) {
    if (currentLessonCount.value >= maxLessonCount.value) {
      message.warning("Số buổi học đã đạt giới hạn!");
      return;
    }

    if (!selectedDays.value.includes(day)) {
      selectedDays.value.push(day);
      addSession(day);
    }
  } else {
    const index = selectedDays.value.indexOf(day);
    if (index !== -1) {
      selectedDays.value.splice(index, 1);
      delete formValue.value.sessions[day];
    }
  }

  selectedDays.value.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};

const formValue = ref({
  sessions: {},
});

//______________________________________________________________________________________________________

//ScheduleDisplay_______________________________________________________________________________________
const addSession = (day) => {
  if (currentLessonCount.value >= maxLessonCount.value) {
    message.warning("Số buổi học đã đạt giới hạn!");
    return;
  }
  if (!formValue.value.sessions[day]) {
    formValue.value.sessions[day] = [];
  }
  formValue.value.sessions[day].push({
    session: null,
    time: { start: null, end: null },
    teacher: null,
    room: null,
  });
};

const removeSession = (day, index) => {
  formValue.value.sessions[day].splice(index, 1);
};

const sessionTimeRanges = {
  Sáng: {
    start: new Date().setHours(6, 0, 0, 0),
    end: new Date().setHours(12, 0, 0, 0),
  },
  Chiều: {
    start: new Date().setHours(12, 0, 0, 0),
    end: new Date().setHours(18, 0, 0, 0),
  },
  Tối: {
    start: new Date().setHours(18, 0, 0, 0),
    end: new Date().setHours(22, 0, 0, 0),
  },
};

const handleSessionChange = (day, sessionIndex, sessionValue) => {
  if (sessionValue && sessionTimeRanges[sessionValue]) {
    const { start, end } = sessionTimeRanges[sessionValue];
    formValue.value.sessions[day][sessionIndex].time.start = start;
    formValue.value.sessions[day][sessionIndex].time.end = end;
  } else {
    formValue.value.sessions[day][sessionIndex].time.start = null;
    formValue.value.sessions[day][sessionIndex].time.end = null;
  }
};

const getDisabledMinutes = (selectedHour, session, isEndPicker) => {
  if (!session.time.start || !session.time.end || selectedHour === null) {
    return [];
  }

  const startTime = new Date(session.time.start);
  const endTime = new Date(session.time.end);
  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();

  const sessionRange = sessionTimeRanges[session.session];
  if (!sessionRange) return [];

  const lastHour = new Date(sessionRange.end).getHours();

  if (isEndPicker && selectedHour === lastHour) {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  }

  if (!isEndPicker && selectedHour === lastHour - 1) {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  }

  if (isEndPicker && selectedHour === startHour + 1) {
    return Array.from({ length: startMinute }, (_, i) => i);
  }

  return [];
};

const checkOverlap = (day) => {
  const sessions = formValue.value.sessions[day];
  const conflicts = new Set();

  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      if (
        sessions[i].time.start &&
        sessions[i].time.end &&
        sessions[j].time.start &&
        sessions[j].time.end
      ) {
        const startA = new Date(sessions[i].time.start).getTime();
        const endA = new Date(sessions[i].time.end).getTime();
        const startB = new Date(sessions[j].time.start).getTime();
        const endB = new Date(sessions[j].time.end).getTime();

        if (startA < endB && startB < endA) {
          conflicts.add(i);
          conflicts.add(j);
        }
      }
    }
  }

  return conflicts;
};

//______________________________________________________________________________________________________

//Handle________________________________________________________________________________________________
const handleDateChange = (dates) => {
  let formattedDates = dates.map((date) => dayjs(date).format("YYYY/MM/DD"));

  const previousSelection = new Set(selectedDates.value);
  const newSelections = formattedDates.filter(
    (date) => !previousSelection.has(date),
  );

  // Use computed currentLessonCount instead of manually counting sessions
  if (newSelections.length + currentLessonCount.value > maxLessonCount.value) {
    message.warning("Số buổi học đã đạt giới hạn!");
    formattedDates = [...selectedDates.value];
  }

  // Remove unselected dates from formValue
  const unselectedDates = selectedDates.value.filter(
    (selectedDate) => !formattedDates.includes(selectedDate),
  );
  unselectedDates.forEach((unselectedDate) => {
    delete formValue.value.sessions[unselectedDate];
  });

  // Update UI selection
  selectedDates.value = formattedDates;
  DisplayDates.value = formattedDates;

  // Ensure only allowed dates add new sessions
  formattedDates.forEach((formattedDate) => {
    if (!formValue.value.sessions[formattedDate]) {
      addSession(formattedDate);
    }
  });
};

const handleClose = () => {
  showSchedule.value = false;
  currentClass.value = null;
  dates.value = [];
  scheduleMode.value = "week";
};
//______________________________________________________________________________________________________

//Load__________________________________________________________________________________________________
const loadData = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getClasses({});
    if (error?.value) {
      message.error(error.value.data?.message || "Lỗi tải dữ liệu");
      return;
    }
    const rawData = toRaw(resData.value)?.data?.classes;
    if (Array.isArray(rawData)) {
      data.value = rawData.map((item) => ({
        id: item.id || "N/A",
        classType: item.type ? `${item.type}` : "N/A",
        startAt: item.start_at?.split("T")[0] || "N/A",
        endAt: item.end_at?.split("T")[0] || "N/A",
        status: item.status,
        name: item.name,
        subjectName: item.subject?.name || "N/A",
        totalLessons: item.subject?.total_lessons || 0,
      }));
    }
  } catch (err) {
    message.error("Lỗi tải dữ liệu.");
  }
};

// const fetchTeachers = async () => {
//   try {
//     // Lấy danh sách lớp học
//     const { data: classData, error: classError } = await restAPI.cms.getClasses(
//       {},
//     );
//     if (classError?.value) {
//       message.error(
//         classError.value.data?.message || "Lỗi tải danh sách lớp học",
//       );
//       return;
//     }

//     const classes = toRaw(classData.value)?.data?.classes || [];
//     if (!classes.length) {
//       message.warning("Không có lớp học nào");
//       return;
//     }

//     // Lấy danh sách subjectID từ lớp học
//     const subjectIDs = [
//       ...new Set(classes.map((cls) => cls.subject?.id).filter(Boolean)),
//     ];
//     if (!subjectIDs.length) {
//       message.warning("Không tìm thấy môn học hợp lệ");
//       return;
//     }

//     // Lấy danh sách giảng viên từ từng môn học
//     let allTeachers = [];
//     for (const subjectID of subjectIDs) {
//       const { data: subjectData, error: subjectError } =
//         await restAPI.cms.getSubjectDetail({ id: subjectID });
//       if (subjectError?.value) {
//         message.warning(`Lỗi tải môn học ID: ${subjectID}`);
//         continue;
//       }

//       const teachers = toRaw(subjectData.value)?.data?.teachers || [];
//       allTeachers = [...allTeachers, ...teachers];
//     }

//     // Lọc giảng viên trùng lặp
//     Staffarray.value = [
//       ...new Map(allTeachers.map((t) => [t.id, t])).values(),
//     ].sort((a, b) => a.full_name.localeCompare(b.full_name));
//   } catch (err) {
//     message.error("Lỗi khi lấy danh sách giảng viên");
//     console.error(err);
//   }
// };

const Staffarray = ref([]);
const filteredUserIds = ref(null);
const dayMapping = {
  "Thứ 2": 1,
  "Thứ 3": 2,
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
  "Chủ Nhật": 0,
};

const fetchTeach = async (item, session) => {
  console.log(item);
  console.log(session);
  try {
    const { data: resData } = await restAPI.cms.getSubjectDetail({
      id: props.correctSubjectId,
    });
    if (resData.value?.status) {
      Staffarray.value = resData.value.data.teachers
        .map(({ id, full_name }) => ({
          id,
          full_name,
        }))
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      message.error("Failed to load Teachers!");
      Staffarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching Teachers!");
    console.error(err);
    Staffarray.value = [];
  }
  try {
    const { data: resData } = await restAPI.cms.listCalendars({});
    if (resData.value?.status) {
      const users = Array.isArray(resData.value.data) ? resData.value.data : []; // Ensure it's an array

      filteredUserIds.value = users
        .filter((user) =>
          Staffarray.value.some((staff) => staff.id === user.user_id),
        ) // Filter valid users
        .map((user) => user.id); // Extract only the id values

      console.log("Filtered User IDs:", filteredUserIds.value);
    } else {
      message.error("Failed to load schedule!");
      Staffarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching schedule!");
    console.error(err);
    Staffarray.value = [];
  }
  const mappedDays = selectedDisplay.value.map((day) => dayMapping[day]);

  console.log("Mapped Days:", mappedDays);
  try {
    if (!filteredUserIds.value || filteredUserIds.value.length === 0) {
      message.error("No user IDs found!");
      return;
    }

    // Array to store fetched slot data
    const Slot = [];

    // Create an array of API call promises
    const slotRequests = filteredUserIds.value.map(async (userId) => {
      try {
        const { data: resData } = await restAPI.cms.getCalendarDetails({
          id: userId,
        });
        const validShifts = resData.value.data.user_shifts.filter((shift) =>
          mappedDays.includes(shift.day_of_week),
        );

        // Only push to Slot if there are valid shifts
        if (validShifts.length > 0) {
          Slot.push(resData.value.data);
        } else {
          console.warn(`No slot data found for user ID: ${userId}`);
        }
      } catch (error) {
        console.error(`Error fetching slot for user ID: ${userId}`, error);
      }
    });

    // Execute all API calls concurrently
    await Promise.all(slotRequests);

    // Log the final structured data
    console.log("Fetched Slot Data:", Slot);

    // You can now use Slot in your application as needed
  } catch (err) {
    message.error("Error fetching slots!");
    console.error(err);
  }
};

const Roomarray = ref([]);
const fetchRoom = async () => {
  try {
    const { data: resData } = await restAPI.cms.getClassrooms({});
    if (resData.value?.status) {
      Roomarray.value = resData.value.data.data
        .filter((room) => room.is_active)
        .map(({ id, name }) => ({
          id,
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      message.error("Failed to load classroom!");
      Roomarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching classroom!");
    console.error(err);
    Roomarray.value = [];
  }
};
//______________________________________________________________________________________________________

//Submit________________________________________________________________________________________________
function filterSchedule(schedule, filterByDate = true) {
  const rawSchedule = toRaw(schedule);

  return Object.fromEntries(
    Object.entries(rawSchedule).filter(([key]) => {
      return filterByDate ? key.includes("/") : !key.includes("/");
    }),
  );
}

const handleSubmit = async () => {
  const isValid = await Promise.all(
    formRefs.value.map(async (form) => {
      if (form) {
        return form
          .validate()
          .then(() => true)
          .catch(() => false);
      }
      return false;
    }),
  );

  const hasConflict = Object.keys(formValue.value.sessions).some(
    (day) => checkOverlap(day).size > 0,
  );

  if (isValid.includes(false) || hasConflict) {
    return;
  }

  const scheduleData = formValue.value.sessions || {};
  const dateFiltered = filterSchedule(scheduleData, true);
  const dayFiltered = filterSchedule(scheduleData, false);
  if (scheduleMode.value === "date") {
  } else if (scheduleMode.value === "week") {
  }
};
//______________________________________________________________________________________________________

//Func__________________________________________________________________________________________________
const limitSelection = (value, session, formRef, item, sessionIndex) => {
  // Ensure at least 1 room is selected
  session.room = value.length > 2 ? value.slice(-2) : value;

  nextTick(() => {
    if (formRef) {
      formRef
        .validateField(`sessions.${item}.${sessionIndex}.room`)
        .catch(() => {});
    }
  });
};
const computedMinDate = computed(() => {
  if (!currentClass.value) return new Date();

  const startAt = currentClass.value.startAt
    ? new Date(currentClass.value.startAt)
    : null;
  const today = new Date();

  return startAt && startAt > today ? startAt : today;
});
//______________________________________________________________________________________________________

onMounted(async () => {
  await loadData();
  // await fetchTeach();
  // await fetchTeachers();
  // await fetchSchedule();
  // await fetchslot();
  fetchRoom();
  if (newId) {
    const foundClass = data.value.find((cls) => cls.id === newId);
    if (foundClass) {
      currentClass.value = foundClass;
      showSchedule.value = true;
    } else {
      message.error("Không tìm thấy lớp học");
    }
  }
});
</script>

<template>
  <div class="h-full w-full overflow-auto rounded-2xl bg-white">
    <div class="mt-4 rounded-md border p-4">
      <h2 class="mb-2 text-xl font-bold">
        Xếp lịch học cho lớp: {{ currentClass?.name }}
      </h2>

      <div>
        <div class="mb-4 flex items-center gap-3">
          <n-grid cols="1">
            <n-gi>
              <n-radio-group v-model:value="scheduleMode">
                <n-space>
                  <n-radio value="week">Tuần</n-radio>
                  <n-radio value="date">
                    Chọn ngày (Hệ thống sẽ không tự tạo buổi học theo lịch tuần)
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-gi>
            <n-gi v-if="scheduleMode === 'date'">
              <n-grid cols="1" class="mb-2">
                <n-gi class="mb-2 px-10">
                  <VueDatePicker
                    v-if="scheduleMode === 'date'"
                    v-model="DisplayDates"
                    :min-date="computedMinDate"
                    :max-date="currentClass?.endAt"
                    multi-dates
                    inline
                    auto-apply
                    :enable-time-picker="false"
                    @update:model-value="handleDateChange"
                  />
                </n-gi>
                <n-gi>
                  <n-grid cols="2" x-gap="20">
                    <n-gi>
                      <span>Số buổi đã xếp: {{ currentLessonCount }} buổi</span>
                    </n-gi>
                    <n-gi>
                      <span>Số buổi của lớp: {{ maxLessonCount }} buổi</span>
                    </n-gi>
                  </n-grid>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi v-if="scheduleMode === 'week'" class="mt-2">
              <n-grid cols="4" :x-gap="10">
                <n-gi span="1">
                  <h1 class="ml-5 text-lg">Chọn nhanh thời gian học</h1>
                </n-gi>
                <n-gi span="3" class="mb-3">
                  <n-grid
                    cols="7"
                    :x-gap="20"
                    style="display: flex; flex-wrap: wrap"
                  >
                    <n-gi v-for="(day, index) in daysOfWeek" :key="index">
                      <n-checkbox
                        :checked="selectedDays.includes(day)"
                        @update:checked="toggleDay(day, $event)"
                      >
                        {{ day }}
                      </n-checkbox>
                    </n-gi>
                  </n-grid>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi
              v-for="(item, index) in selectedDisplay"
              :key="'form-' + index"
              span="4"
            >
              <n-form :model="formValue" ref="formRefs" :rules="rules">
                <n-grid :cols="21" :x-gap="20">
                  <n-gi :span="4">
                    <n-form-item label="Ngày học">
                      <n-input :value="item" disabled />
                    </n-form-item>
                  </n-gi>
                  <n-gi :span="17">
                    <template
                      v-for="(session, sessionIndex) in formValue.sessions[
                        item
                      ]"
                      :key="sessionIndex"
                    >
                      <n-grid :cols="17" :x-gap="20">
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Ca học' : ''"
                            :path="`sessions.${item}.${sessionIndex}.session`"
                          >
                            <n-select
                              v-model:value="session.session"
                              placeholder="Chọn ca học"
                              :options="[
                                { label: 'Sáng', value: 'Sáng' },
                                { label: 'Chiều', value: 'Chiều' },
                                { label: 'Tối', value: 'Tối' },
                              ]"
                              @update:value="
                                handleSessionChange(item, sessionIndex, $event)
                              "
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4" class="text-red-400">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Thời gian' : ''"
                            :feedback="
                              checkOverlap(item).has(sessionIndex)
                                ? 'Thời gian của ca học bị trùng!'
                                : ''
                            "
                            feedback-status="error"
                            :style="{ marginBottom: '8px' }"
                          >
                            <n-input-group
                              class="w-fit rounded-2xl border bg-[#F5F5F5]"
                            >
                              <n-time-picker
                                class="custom-tp-left"
                                placeholder="Bắt đầu"
                                format="HH:mm"
                                v-model:value="session.time.start"
                                :hours="
                                  (() => {
                                    if (
                                      !session.session ||
                                      !sessionTimeRanges[session.session]
                                    )
                                      return [];
                                    const sessionRange =
                                      sessionTimeRanges[session.session];

                                    const startHour = new Date(
                                      sessionRange.start,
                                    ).getHours();
                                    const endHour = new Date(
                                      sessionRange.end,
                                    ).getHours();

                                    return startHour < endHour
                                      ? Array.from(
                                          { length: endHour - startHour },
                                          (_, i) => startHour + i,
                                        )
                                      : [];
                                  })()
                                "
                                :is-minute-disabled="
                                  (minute, hour) =>
                                    hour !== null &&
                                    getDisabledMinutes(
                                      hour,
                                      session,
                                      false,
                                    ).includes(minute)
                                "
                              />

                              <n-time-picker
                                class="custom-tp-right"
                                placeholder="Kết thúc"
                                format="HH:mm"
                                v-model:value="session.time.end"
                                :hours="
                                  (() => {
                                    if (
                                      !session.session ||
                                      !sessionTimeRanges[session.session] ||
                                      !session.time.start
                                    )
                                      return [];

                                    const sessionRange =
                                      sessionTimeRanges[session.session];
                                    const startHour = new Date(
                                      session.time.start,
                                    ).getHours();
                                    const endHour = new Date(
                                      sessionRange.end,
                                    ).getHours();

                                    return startHour < endHour
                                      ? Array.from(
                                          { length: endHour - startHour },
                                          (_, i) => startHour + i + 1,
                                        )
                                      : [];
                                  })()
                                "
                                :is-minute-disabled="
                                  (minute, hour) =>
                                    hour !== null &&
                                    getDisabledMinutes(
                                      hour,
                                      session,
                                      true,
                                    ).includes(minute)
                                "
                              />
                            </n-input-group>
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Giảng viên' : ''"
                            :path="`sessions.${item}.${sessionIndex}.teacher`"
                          >
                            <n-select
                              v-model:value="session.teacher"
                              :options="Staffarray"
                              label-field="full_name"
                              value-field="id"
                              placeholder="Chọn giảng viên"
                              @focus="fetchTeach(item, sessionIndex)"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Phòng học' : ''"
                            :path="`sessions.${item}.${sessionIndex}.room`"
                          >
                            <n-select
                              multiple
                              clearable
                              v-model:value="session.room"
                              :options="Roomarray"
                              label-field="name"
                              value-field="id"
                              placeholder="Chọn phòng học"
                              @update:value="
                                (value) =>
                                  limitSelection(
                                    value,
                                    session,
                                    formRefs[item],
                                    item,
                                    sessionIndex,
                                  )
                              "
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi
                          v-if="sessionIndex == 0"
                          class="flex items-center justify-center"
                        >
                          <n-button quaternary circle @click="addSession(item)">
                            <i
                              class="fa-regular fa-square-plus"
                              style="font-size: 24px; color: #008cff"
                            ></i>
                          </n-button>
                        </n-gi>
                        <n-gi
                          v-else
                          class="mb-8 flex items-center justify-center"
                        >
                          <n-button
                            quaternary
                            circle
                            @click="removeSession(item, sessionIndex)"
                          >
                            <i
                              class="fa-solid fa-trash-can text-lg text-red-500"
                            ></i>
                          </n-button>
                        </n-gi>
                      </n-grid>
                    </template>
                  </n-gi>
                </n-grid>
              </n-form>
            </n-gi>
            <n-gi class="flex justify-center">
              <n-button type="info" class="w-1/5" @click="handleSubmit">
                Lưu
              </n-button>
            </n-gi>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
* :deep(.custom-tp-left .n-input) {
  --n-border-disabled: none !important;
  --n-padding-right: 0px !important;
  --n-border: none !important;
  --n-border-focus: none !important;
  --n-border-hover: none !important;
  --n-box-shadow-focus: none !important;
  --n-color: #fff !important;
  --n-color-disabled: #fff !important;
  --n-color-focus: #fff !important;
  --n-color-focus-error: #fff !important;
  --n-border-error: none !important;
  --n-border-focus-error: none !important;
  --n-box-shadow-focus-error: none !important;
  --n-border-hover-error: none !important;
}

* :deep(.custom-tp-right .n-input) {
  --n-padding-left: 7px !important;
  --n-padding-right: 12px !important;
  --n-border-disabled: none !important;
  --n-border: none !important;
  --n-border-focus: none !important;
  --n-border-hover: none !important;
  --n-box-shadow-focus: none !important;
  --n-color: #fff !important;
  --n-color-disabled: #fff !important;
  --n-color-focus: #fff !important;
  --n-color-focus-error: #fff !important;
  --n-border-error: none !important;
  --n-border-focus-error: none !important;
  --n-box-shadow-focus-error: none !important;
  --n-border-hover-error: none !important;
}
:deep(.custom-tp-left .n-input),
:deep(.custom-tp-right .n-input) {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

* :deep(.custom-tp-right .n-input .n-input__suffix) {
  display: none !important;
}

:deep(.n-form-item .n-form-item-feedback-wrapper .n-form-item-feedback) {
  color: red;
}

:deep(.dp__theme_light) {
  --dp-primary-color: #00a2eb; // Selected date background
  --dp-text-color: #133d85; // Default text color

  --dp-border-radius: 8px;
  --dp-font-size: 14px;
}

:deep(.dp__month_year_select) {
  background: white;
  border: 1px solid #dce8ff;
  border-radius: 6px;
  padding: 5px 10px;
  font-weight: bold;
  color: #133d85;
  display: flex;
  gap: 80px;
}
:deep(.dp__menu) {
  min-width: 350px !important;
  border: none !important;
  box-shadow: none !important;
}
</style>
