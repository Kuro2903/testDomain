<template>
  <div class="size-sm">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import type { PropType } from "vue";
import { Chart, registerables } from "chart.js";
import type { ChartData } from "chart.js";
Chart.register(...registerables);

export default defineComponent({
  name: "BarChart",
  props: {
    data: {
      type: Object as PropType<ChartData>,
      required: true,
    },
  },
  setup(props) {
    const chart = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (chart.value) {
        new Chart(chart.value, {
          type: "bar",
          data: props.data,
          options: {
            indexAxis: "y",
            plugins: {
              legend: {
                display: false, //This will do the task
              },
            },
            scales: {
              x: {
                ticks: {
                  display: false,
                },
              },
            },
          },
        });
      }
    });

    return {
      chart,
    };
  },
});
</script>
