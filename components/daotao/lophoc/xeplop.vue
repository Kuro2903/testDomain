<script setup>
import { ref, computed, onMounted, toRaw, nextTick, watch } from "vue";
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
    session_id: formValue.value.sessions[day].length,
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

const handleSessionChange = (item, sessionIndex, sessionValue, session) => {
  if (sessionValue && sessionTimeRanges[sessionValue]) {
    const { start, end } = sessionTimeRanges[sessionValue];
    formValue.value.sessions[item][sessionIndex].time.start = start;
    formValue.value.sessions[item][sessionIndex].time.end = end;
    fetchTeach(session, item, start, end);
  } else {
    formValue.value.sessions[item][sessionIndex].time.start = null;
    formValue.value.sessions[item][sessionIndex].time.end = null;
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
        classType: item.type || "N/A",
        startAt: item.start_at?.split("T")[0] || "N/A",
        endAt: item.end_at?.split("T")[0] || "N/A",
        status: item.status,
        name: item.name,
        subjectName: item.subject?.name || "N/A",
        subjectId: item.subject_id || "N/A",
        totalLessons: item.subject?.total_lessons || 0,
        branchId: item.branch?.id || "N/A",
      }));
      branchId.value = rawData[0]?.branch?.id || null;
    }
  } catch (err) {
    message.error("Lỗi tải dữ liệu.");
  }
};

const Staffarray = ref([]);
const Staffdate = ref([]);
const Staffday = ref([]);
const StaffTemparray = ref([]);
const scheduleIds = ref(null);
let Slot = [];
const dayMapping = {
  "Thứ 2": 1,
  "Thứ 3": 2,
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
  "Chủ Nhật": 0,
};

const fetch1 = async () => {
  const { data: resData } = await restAPI.cms.getSubjectDetail({
    id: props.correctSubjectId,
  });
  if (resData.value?.status) {
    const sortedTeachers = resData.value.data.teachers
      .map(({ id, full_name }) => ({
        id,
        full_name,
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    StaffTemparray.value = sortedTeachers;
    Staffday.value = sortedTeachers;
    Staffdate.value = sortedTeachers;
  } else {
    message.error("Failed to load Teachers!");
    StaffTemparray.value = [];
  }
};

const fetch2 = async () => {
  const { data: resData } = await restAPI.cms.listCalendars({});
  if (resData.value?.status) {
    const users = Array.isArray(resData.value.data) ? resData.value.data : [];

    scheduleIds.value = users
      .filter((user) =>
        StaffTemparray.value.some((staff) => staff.id === user.user_id),
      )
      .map((user) => user.id);
  } else {
    message.error("Failed to load schedule!");
  }
};

const fetchTeach = async (session, item, start, end) => {
  let dateitem = "";
  if (scheduleMode.value == "date") {
    const formattedDate = item.replace(/\//g, "-");
    const date = new Date(formattedDate);
    const daysOfWeekVn = [
      "Chủ Nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    dateitem = daysOfWeekVn[date.getDay()];
  }
  Slot = [];
  const slotRequests = scheduleIds.value.map(async (userId) => {
    const { data: resData } = await restAPI.cms.getCalendarDetails({
      id: userId,
    });

    const validShifts = resData.value.data.user_shifts.filter((shift) => {
      const dayKey =
        scheduleMode.value === "date" ? dayMapping[dateitem] : dayMapping[item];
      return shift.day_of_week === dayKey;
    });
    const validTimeSlots = resData.value.data.time_slots.filter((slot) => {
      const slotStart = dayjs(slot.start_time);
      const slotEnd = dayjs(slot.end_time);
      const selectedStart = dayjs(start);
      const selectedEnd = dayjs(end);

      const selectedStartTime =
        selectedStart.hour() * 60 + selectedStart.minute();
      const selectedEndTime = selectedEnd.hour() * 60 + selectedEnd.minute();
      const slotStartTime = slotStart.hour() * 60 + slotStart.minute();
      const slotEndTime = slotEnd.hour() * 60 + slotEnd.minute();

      return (
        selectedStartTime >= slotStartTime && selectedEndTime <= slotEndTime
      );
    });
    const matchingTimeSlots = validTimeSlots.filter((slot) =>
      validShifts.some(
        (shift) => shift.work_session_id === slot.work_session_id,
      ),
    );

    if (validShifts.length > 0 && matchingTimeSlots.length > 0) {
      Slot.push(resData.value.data);
    }
  });
  await Promise.all(slotRequests);
  const slotUserIds = Slot.map((slot) => slot.user_id);

  if (!Staffarray.value[item]) {
    Staffarray.value[item] = {};
  }

  if (!Staffarray.value[item][session.session]) {
    Staffarray.value[item][session.session] = {};
  }

  if (!Staffarray.value[item][session.session][session.session_id]) {
    Staffarray.value[item][session.session][session.session_id] = [];
  }
  Staffarray.value[item][session.session][session.session_id] =
    StaffTemparray.value.filter((staff) => slotUserIds.includes(staff.id));

  const teacherList =
    Staffarray.value?.[item]?.[session.session]?.[session.session_id] || [];

  if (!teacherList.some((staff) => staff.id === session.teacher)) {
    session.teacher = null;
  }
};

const Roomarray = ref([]);
const branchId = ref(null);
const fetchFilteredRooms = async () => {
  try {
    const { data: resData } = await restAPI.cms.getClassrooms({});

    if (!resData.value?.status || !Array.isArray(resData.value.data?.data)) {
      message.error("Lỗi tải danh sách phòng học!");
      return;
    }

    if (!newId) {
      message.error("Không có ID lớp học!");
      return;
    }

    const foundClass = data.value.find((cls) => cls.id === newId);
    if (!foundClass) {
      message.error("Không tìm thấy lớp học!");
      return;
    }

    const { classType, branchId: classBranchId } = foundClass;

    Roomarray.value = resData.value.data.data
      .filter((room) => {
        const typeMatch =
          classType === 1
            ? room.is_online === true
            : classType === 2
              ? room.is_online === false
              : true;

        return typeMatch && room.branch?.id === classBranchId;
      })
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (Roomarray.value.length === 0) {
      message.warning("Không có phòng học phù hợp!");
    }
  } catch (err) {
    message.error("Lỗi khi tải phòng học!");
    console.error(err);
  }
};

//______________________________________________________________________________________________________

//Session_______________________________________________________________________________________________
const session_id = ref(null);
const createSession = async () => {
  let body = {
    title: route.query.id,
    start_time: dayjs().startOf("day").toISOString(),
    end_time: dayjs().endOf("day").toISOString(),
    branch_id: branchId.value,
    is_active: true,
  };

  const { data: resData } = await restAPI.cms.createShift({ body });
  if (resData?.value?.data?.id) {
    session_id.value = resData.value.data.id;
  } else {
    await getSession();
  }
};

const getSession = async () => {
  try {
    const { data } = await restAPI.cms.getShift({});

    if (!data?.value?.data?.data || !Array.isArray(data.value.data.data)) {
      console.error("Invalid response structure:", data);
      return;
    }

    const session = data.value.data.data.find((session) =>
      session.title.includes(route.query.id),
    );

    if (session) {
      session_id.value = session.id;
      console.log(session_id.value);
    } else {
      console.warn("No matching session found.");
    }
  } catch (error) {
    console.error("Error fetching session:", error);
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
  await createSession();
  if (!formRefs.value || formRefs.value.length === 0) {
    return;
  }

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

  if (isValid.includes(false)) {
    message.error("Vui lòng kiểm tra lại các biểu mẫu!");
    return;
  }

  if (hasConflict) {
    message.error("Có xung đột trong lịch, vui lòng kiểm tra lại!");
    return;
  }

  const scheduleData = formValue.value.sessions || {};
  const dateFiltered = filterSchedule(scheduleData, true);
  const dayFiltered = filterSchedule(scheduleData, false);

  let scheduleDetails = [];
  let dates = [];
  let weeks = [];

  if (scheduleMode.value === "date") {
    Object.entries(dateFiltered).forEach(([date, sessions]) => {
      sessions.forEach((session) => {
        scheduleDetails.push({
          start_date: new Date(date).toISOString(),
          name: session.session,
          start_time: dayjs(session.time.start).format("HH:mm"),
          end_time: dayjs(session.time.end).format("HH:mm"),
          teacher_id: session.teacher,
          asistant_id: session.assistant || null,
          classroom_ids: session.room || [],
          session_id: session_id.value,
          is_sub: session.is_sub || false,
          childrens: [],
        });
      });
      dates.push(new Date(date).toISOString());
    });
  } else if (scheduleMode.value === "week") {
    Object.entries(dayFiltered).forEach(([day, sessions]) => {
      sessions.forEach((session) => {
        scheduleDetails.push({
          start_date: new Date().toISOString(),
          name: day,
          start_time: dayjs(session.time.start).format("HH:mm"),
          end_time: dayjs(session.time.end).format("HH:mm"),
          teacher_id: session.teacher,
          asistant_id: session.assistant || null,
          classroom_ids: session.room || [],
          session_id: session_id.value,
          is_sub: session.is_sub || false,
          childrens: [],
        });
      });
      weeks.push(parseInt(day)); // Assuming "day" is a numeric index for weeks
    });
  }

  let body = {
    class_id: route.query.id,
    type: scheduleMode.value === "date" ? 1 : 2, // 1 for date mode, 2 for week mode
    schedule_details: scheduleDetails,
    dates: scheduleMode.value === "date" ? dates : [],
    weeks: scheduleMode.value === "week" ? weeks : [],
  };

  console.log(JSON.stringify(body, null, 2));
  // const { data: createData } = await restAPI.cms.createClassSchedule({ body });
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
  await fetch1();
  await fetch2();
  // await fetchTeach();
  // await fetchTeachers();
  // await fetchSchedule();
  // await fetchslot();
  fetchFilteredRooms();
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
                                handleSessionChange(
                                  item,
                                  sessionIndex,
                                  $event,
                                  session,
                                )
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
                                @update:value="
                                  () =>
                                    fetchTeach(
                                      session,
                                      item,
                                      session.time.start,
                                      session.time.end,
                                    )
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
                                @update:value="
                                  () =>
                                    fetchTeach(
                                      session,
                                      item,
                                      session.time.start,
                                      session.time.end,
                                    )
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
                              :options="
                                (Staffarray[item] &&
                                  Staffarray[item][session.session] &&
                                  Staffarray[item][session.session][
                                    session.session_id
                                  ]) ||
                                []
                              "
                              label-field="full_name"
                              value-field="id"
                              placeholder="Chọn giảng viên"
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
