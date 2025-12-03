import * as esbuild from 'esbuild'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const outDir = 'dist-exe'

// 清理输出目录
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true })
}
fs.mkdirSync(outDir)

console.log('📦 Building with esbuild...')

// 使用 esbuild 打包
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: `${outDir}/server.cjs`,
  external: [
    // Prisma 需要外部处理
    '@prisma/client',
    'prisma',
    // 原生模块
    'argon2',
  ],
  minify: false,
  sourcemap: false,
})

console.log('✅ Esbuild complete')

// 复制必要文件
console.log('📋 Copying files...')

// 复制 public 目录
fs.cpSync('public', `${outDir}/public`, { recursive: true })

// 复制 prisma schema
fs.mkdirSync(`${outDir}/prisma`, { recursive: true })
fs.copyFileSync('prisma/schema.prisma', `${outDir}/prisma/schema.prisma`)

// 复制数据库文件（如果存在）
if (fs.existsSync('prisma/dev.db')) {
  fs.copyFileSync('prisma/dev.db', `${outDir}/data.db`)
}

// 创建生产环境 .env
fs.writeFileSync(`${outDir}/.env`, `
DATABASE_URL="file:./data.db"
NODE_ENV=production
PORT=8000
JWT_SECRET=your-production-secret-change-this
CORS_ORIGINS=http://localhost:8000
`.trim())

// 创建包装脚本（用于初始化 Prisma 并启动服务器）
fs.writeFileSync(`${outDir}/start.cjs`, `
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

process.chdir(__dirname);

// 如果数据库不存在，创建它
if (!fs.existsSync('./data.db')) {
  console.log('🗄️  Initializing database...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️  Database init failed, will retry on first connection');
  }
}

// 启动服务器
require('./server.cjs');
`)

console.log('✅ Files copied')

// 创建 package.json for pkg
const pkgJson = {
  name: 'tinybridge',
  version: '1.0.0',
  main: 'start.cjs',
  pkg: {
    scripts: ['start.cjs', 'server.cjs'],
    assets: [
      'public/**/*',
      'prisma/**/*',
      '.env',
      'data.db',
      'node_modules/@prisma/client/**/*',
      'node_modules/.prisma/**/*',
    ],
    targets: ['node18-win-x64'],
    outputPath: 'executable'
  }
}

fs.writeFileSync(`${outDir}/package.json`, JSON.stringify(pkgJson, null, 2))

// 复制必要的 node_modules
console.log('📦 Copying node_modules...')
const modulesToCopy = ['@prisma', '.prisma', 'argon2']
fs.mkdirSync(`${outDir}/node_modules`, { recursive: true })

for (const mod of modulesToCopy) {
  const src = `node_modules/${mod}`
  const dest = `${outDir}/node_modules/${mod}`
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true })
    console.log(`  Copied ${mod}`)
  }
}

console.log('✅ Build complete!')
console.log(`\n📁 Output directory: ${outDir}/`)
console.log('\nTo create executable:')
console.log(`  cd ${outDir} && npx @yao-pkg/pkg . --compress GZip`)
