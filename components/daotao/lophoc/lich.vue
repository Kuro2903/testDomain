<script lang="ts" setup>
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { NModal, NCard } from "naive-ui";

const events = ref<any[]>([]);
const showModal = ref(false);
const selectedEvent = ref<any>(null);
const { restAPI } = useApi();

const getRandomColor = () => {
  const colors = ["#FBCFE8", "#86EFAC", "#93C5FD", "#FCA5A5", "#E9D5FF"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const fetchEvents = async () => {
  try {
    const response = await fetch(
      "https://677e47a194bde1c1252b403f.mockapi.io/Data/User/schedule",
    );
    // const { data: resData, error } = await restAPI.cms.getScheduleClass({});

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();

    events.value = data.map((event: any) => ({
      title: event.title || "Không có tên",
      start: event.start_at || "N/A",
      end: event.end_at || "N/A",
      color: getRandomColor(),
      teacher: event.teacher || "Chưa cập nhật",
      class: event.class || "Chưa có lớp",
      format: event.format || "Chưa cập nhật",
      status: event.status || "Chưa điểm danh",
    }));
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sự kiện:", error);
  }
};
const formatTime = (dateTime: string) => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

onMounted(fetchEvents);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  slotMinTime: "06:00:00",
  slotMaxTime: "23:00:00",
  editable: false,
  selectable: false,
  alldaySlot: false,
  contentHeight: "auto",
  events,
  eventClick: (info: any) => {
    selectedEvent.value = {
      title: info.event.title,
      start: formatTime(info.event.startStr),
      end: formatTime(info.event.endStr),
      teacher: info.event.extendedProps.teacher,
      class: info.event.extendedProps.class,
      format: info.event.extendedProps.format,
      status: info.event.extendedProps.status,
    };
    showModal.value = true;
  },
});
</script>

<template>
  <div class="h-fit w-full overflow-auto rounded-2xl bg-white">
    <FullCalendar
      :options="calendarOptions"
      class="rounded-lg bg-white p-4 shadow-md"
    />
  </div>

  <!-- Modal hiển thị chi tiết sự kiện -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="Chi tiết buổi học"
    style="width: fit-content"
  >
    <div v-if="selectedEvent">
      <p><strong>Môn học:</strong> {{ selectedEvent.title }}</p>
      <p><strong>Lớp học:</strong> {{ selectedEvent.class }}</p>
      <p>
        <strong>Thời gian học:</strong> {{ selectedEvent.start }} ->
        {{ selectedEvent.end }}
      </p>
      <p><strong>Giảng viên:</strong> {{ selectedEvent.teacher }}</p>
      <p><strong>Hình thức:</strong> {{ selectedEvent.format }}</p>
      <p>
        <strong>Trạng thái:</strong>
        <span
          :style="{
            color: selectedEvent.status === 'Chưa điểm danh' ? 'blue' : 'black',
          }"
        >
          {{ selectedEvent.status }}
        </span>
      </p>
    </div>
    <template #footer>
      <n-button class="w-full" type="info" @click="showModal = false"
        >Đóng</n-button
      >
    </template>
  </n-modal>
</template>
