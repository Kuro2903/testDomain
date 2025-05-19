<template>
  <div class="">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from "vue";
import { Chart, registerables, type ChartData } from "chart.js";
Chart.register(...registerables);

export default defineComponent({
  name: "PieChart",
  props: {
    data: {
      type: Object as PropType<ChartData<"pie", number[], unknown>>,
      required: true,
    },
  },
  setup(props) {
    const chart = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (chart.value) {
        new Chart(chart.value, {
          type: "polarArea",
          data: props.data,
          options: {
            indexAxis: "y",
            scales: {
              r: {
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
