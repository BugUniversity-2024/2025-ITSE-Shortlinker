# Picture 2-8: Use Case Diagram of QR Code Generation
# 图 2-8:QR 码生成的用例图

```mermaid
graph TB
    User([用户<br>User])

    subgraph "二维码生成系统<br>QR Code Generation System"
        GenerateQR[生成二维码<br>Generate QR Code]
        CustomizeStyle[自定义样式<br>Customize Style]
        PreviewQR[预览二维码<br>Preview QR Code]
        DownloadQR[下载二维码<br>Download QR Code]
        ChooseFormat[选择格式<br>Choose Format]
    end

    Browser[浏览器<br>Browser]
    QRCodeLib[qrcode.js<br>QR Code Library]

    User -->|生成| GenerateQR
    User -->|自定义| CustomizeStyle
    User -->|预览| PreviewQR
    User -->|下载| DownloadQR

    GenerateQR ..>|可选| CustomizeStyle
    GenerateQR -->|调用库| QRCodeLib
    GenerateQR -->|显示| PreviewQR

    CustomizeStyle -->|设置颜色| CustomizeStyle
    CustomizeStyle -->|设置尺寸| CustomizeStyle
    CustomizeStyle -->|设置纠错等级| CustomizeStyle

    PreviewQR -->|实时渲染| Browser

    DownloadQR ..>|扩展| ChooseFormat
    DownloadQR -->|PNG格式| Browser
    DownloadQR -->|SVG格式| Browser

    QRCodeLib -->|客户端渲染| Browser

    style User fill:#10B981,color:#fff
    style GenerateQR fill:#3B82F6,color:#fff
    style CustomizeStyle fill:#8B5CF6,color:#fff
    style PreviewQR fill:#3B82F6,color:#fff
    style DownloadQR fill:#F59E0B,color:#fff
    style ChooseFormat fill:#EC4899,color:#fff
    style Browser fill:#6366F1,color:#fff
    style QRCodeLib fill:#EF4444,color:#fff
```

## 用例说明

### 参与者 (Actors)
- **用户 (User)**: 需要为短链接生成二维码的用户
- **浏览器 (Browser)**: 客户端渲染环境
- **qrcode.js**: JavaScript 二维码生成库

---

### 用例详解

#### 1. 生成二维码 (Generate QR Code)

**前置条件**: 用户已创建短链接

**主要流程**:
1. 用户在链接详情页点击"生成二维码"
2. 前端读取短链接 URL (`https://tinybridge.link/{code}`)
3. 调用 `qrcode.js` 库生成二维码
4. 二维码在浏览器中实时渲染
5. 显示二维码预览

**技术实现**:
```javascript
import QRCode from 'qrcode'

async function generateQRCode(url) {
  const options = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }

  const dataURL = await QRCode.toDataURL(url, options)
  return dataURL
}
```

**性能指标**:
- 生成时间 < 100ms
- 完全在客户端执行,不消耗服务器资源

---

#### 2. 自定义样式 (Customize Style)

**前置条件**: 用户正在生成二维码

**可自定义选项**:

| 选项 | 可选值 | 默认值 |
|------|--------|--------|
| **颜色** | 任意 HEX 颜色 | #000000 (黑色) |
| **背景色** | 任意 HEX 颜色 | #FFFFFF (白色) |
| **尺寸** | 128x128 ~ 1024x1024 | 300x300 |
| **纠错等级** | L (7%) / M (15%) / Q (25%) / H (30%) | M (15%) |

**纠错等级说明**:
- **L**: 可恢复 7% 的数据损坏 (适合完美打印环境)
- **M**: 可恢复 15% 的数据损坏 (推荐,平衡扫描速度和容错)
- **Q**: 可恢复 25% 的数据损坏 (适合户外/易损环境)
- **H**: 可恢复 30% 的数据损坏 (适合极端环境,二维码较大)

**主要流程**:
1. 用户点击"自定义样式"
2. 用户调整颜色选择器
3. 用户拖动尺寸滑块 (128-1024px)
4. 用户选择纠错等级
5. 实时预览更新

---

#### 3. 预览二维码 (Preview QR Code)

**主要流程**:
1. 系统在浏览器中渲染二维码
2. 显示二维码尺寸和纠错等级信息
3. 提供扫描测试提示

**预览界面显示**:
```
┌─────────────────────────┐
│   二维码预览            │
├─────────────────────────┤
│                         │
│    [二维码图像]         │
│                         │
├─────────────────────────┤
│ 尺寸: 300x300           │
│ 纠错: M (15%)           │
│ URL: tinybridge.link/abc│
└─────────────────────────┘
```

---

#### 4. 下载二维码 (Download QR Code)

**前置条件**: 二维码已生成

**支持格式**:
- **PNG**: 位图格式,适合网页显示和普通打印
- **SVG**: 矢量格式,适合印刷和大尺寸输出

**主要流程 (PNG)**:
1. 用户点击"下载 PNG"
2. 系统生成 Data URL
3. 创建临时 `<a>` 标签
4. 触发浏览器下载
5. 文件名: `qrcode_{short_code}.png`

```javascript
function downloadPNG(url, shortCode) {
  QRCode.toDataURL(url, options, (err, dataURL) => {
    const link = document.createElement('a')
    link.download = `qrcode_${shortCode}.png`
    link.href = dataURL
    link.click()
  })
}
```

**主要流程 (SVG)**:
1. 用户点击"下载 SVG"
2. 系统生成 SVG 字符串
3. 创建 Blob 对象
4. 触发下载
5. 文件名: `qrcode_{short_code}.svg`

```javascript
function downloadSVG(url, shortCode) {
  QRCode.toString(url, { type: 'svg' }, (err, svg) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `qrcode_${shortCode}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
  })
}
```

---

### 使用场景

#### 场景 1: 线下活动海报
- **需求**: 清晰度高,支持大尺寸打印
- **建议配置**:
  - 格式: SVG
  - 尺寸: 1024x1024
  - 纠错等级: H (30%)
  - 颜色: 与海报主题匹配

#### 场景 2: 微信群分享
- **需求**: 文件小,扫描快速
- **建议配置**:
  - 格式: PNG
  - 尺寸: 300x300
  - 纠错等级: M (15%)
  - 颜色: 默认黑白

#### 场景 3: 户外广告牌
- **需求**: 高容错,远距离扫描
- **建议配置**:
  - 格式: SVG
  - 尺寸: 512x512
  - 纠错等级: Q (25%)
  - 颜色: 高对比度

---

### 优势

✅ **客户端生成**: 不占用服务器资源,无需存储二维码文件
✅ **实时更新**: 修改短链接目标 URL,二维码仍然有效
✅ **无限制**: 用户可以生成任意数量的二维码
✅ **隐私保护**: 二维码不包含敏感信息,仅包含短链接 URL
✅ **高性能**: 生成速度快,无网络延迟

---

### 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| **前端库** | qrcode.js / vue-qrcode | 轻量级二维码生成库 |
| **渲染方式** | Canvas / SVG | Canvas 用于 PNG,SVG 用于矢量 |
| **下载方式** | Blob API + URL.createObjectURL | 纯前端下载,无需后端 |

---

### 兼容性

| 浏览器 | 支持情况 |
|--------|----------|
| **Chrome** | ✅ 完全支持 |
| **Firefox** | ✅ 完全支持 |
| **Safari** | ✅ 完全支持 |
| **Edge** | ✅ 完全支持 |
| **移动端浏览器** | ✅ 完全支持 |
