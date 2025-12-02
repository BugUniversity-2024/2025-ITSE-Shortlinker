<template>
  <div class="flex flex-col items-center">
    <div
      ref="qrContainer"
      class="bg-white p-4 rounded-lg"
      :style="{ width: `${size + 32}px`, height: `${size + 32}px` }"
    >
      <canvas ref="qrCanvas" :width="size" :height="size" />
    </div>

    <div v-if="showDownload" class="mt-4 flex space-x-2">
      <button
        @click="downloadQR('png')"
        class="btn-secondary text-sm"
      >
        Download PNG
      </button>
      <button
        @click="downloadQR('svg')"
        class="btn-outline text-sm"
      >
        Download SVG
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

interface Props {
  url: string
  size?: number
  color?: string
  backgroundColor?: string
  showDownload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  color: '#000000',
  backgroundColor: '#ffffff',
  showDownload: true
})

const qrCanvas = ref<HTMLCanvasElement | null>(null)

async function generateQR() {
  if (!qrCanvas.value || !props.url) return

  try {
    await QRCode.toCanvas(qrCanvas.value, props.url, {
      width: props.size,
      margin: 0,
      color: {
        dark: props.color,
        light: props.backgroundColor
      }
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

function downloadQR(format: 'png' | 'svg') {
  if (!qrCanvas.value) return

  if (format === 'png') {
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrCanvas.value.toDataURL('image/png')
    link.click()
  } else {
    // SVG 格式需要使用 QRCode.toString
    QRCode.toString(props.url, {
      type: 'svg',
      width: props.size,
      margin: 0,
      color: {
        dark: props.color,
        light: props.backgroundColor
      }
    }).then(svg => {
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.download = 'qrcode.svg'
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }
}

watch(() => [props.url, props.size, props.color, props.backgroundColor], generateQR)

onMounted(generateQR)
</script>
