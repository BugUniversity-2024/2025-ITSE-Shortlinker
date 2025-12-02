<template>
  <div class="relative" :style="{ height: `${height}px` }">
    <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  labels: string[]
  data: number[]
  colors?: string[]
  height?: number
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  showLegend: true
})

const defaultColors = [
  'rgba(59, 130, 246, 0.8)',   // primary
  'rgba(16, 185, 129, 0.8)',   // green
  'rgba(245, 158, 11, 0.8)',   // yellow
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(139, 92, 246, 0.8)',   // purple
  'rgba(236, 72, 153, 0.8)',   // pink
  'rgba(34, 211, 238, 0.8)',   // cyan
  'rgba(251, 146, 60, 0.8)'    // orange
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.colors || defaultColors.slice(0, props.data.length),
    borderWidth: 0
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'right' as const
    }
  },
  cutout: '60%'
}))
</script>
