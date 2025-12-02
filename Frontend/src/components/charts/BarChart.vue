<template>
  <div class="relative" :style="{ height: `${height}px` }">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
  }>
  height?: number
  showLegend?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  showLegend: true,
  horizontal: false
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    backgroundColor: dataset.backgroundColor || getDefaultColor(index),
    borderRadius: 4
  }))
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
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

function getDefaultColor(index: number) {
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)'
  ]
  return colors[index % colors.length]
}
</script>
