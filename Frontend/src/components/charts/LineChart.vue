<template>
  <div class="relative" :style="{ height: `${height}px` }">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }>
  height?: number
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  showLegend: true
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.borderColor || getDefaultColor(index),
    backgroundColor: dataset.backgroundColor || getDefaultColor(index, 0.1),
    fill: dataset.fill ?? true,
    tension: 0.4
  }))
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}))

function getDefaultColor(index: number, alpha = 1) {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`,  // primary
    `rgba(16, 185, 129, ${alpha})`,  // green
    `rgba(245, 158, 11, ${alpha})`,  // yellow
    `rgba(239, 68, 68, ${alpha})`,   // red
    `rgba(139, 92, 246, ${alpha})`   // purple
  ]
  return colors[index % colors.length]
}
</script>
