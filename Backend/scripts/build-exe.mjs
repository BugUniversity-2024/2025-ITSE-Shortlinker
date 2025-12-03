import * as esbuild from 'esbuild'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const outDir = 'dist-exe'
const frontendDir = path.resolve(process.cwd(), '../Frontend')
const frontendDist = path.join(frontendDir, 'dist')

// 构建前端
console.log('🎨 Building frontend...')
try {
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit'
  })
  console.log('✅ Frontend build complete')
} catch (e) {
  console.error('❌ Frontend build failed:', e.message)
  process.exit(1)
}

// 清理输出目录（保留目录本身，只清理内容）
if (fs.existsSync(outDir)) {
  const entries = fs.readdirSync(outDir)
  for (const entry of entries) {
    const entryPath = path.join(outDir, entry)
    try {
      fs.rmSync(entryPath, { recursive: true, force: true })
    } catch (e) {
      console.warn(`⚠️  Could not remove ${entry}: ${e.message}`)
    }
  }
} else {
  fs.mkdirSync(outDir)
}

console.log('📦 Building backend with esbuild...')

// 使用 esbuild 打包
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: `${outDir}/server.cjs`,
  external: [
    // Prisma 需要外部处理
    '@prisma/client',
    'prisma',
  ],
  minify: false,
  sourcemap: false,
})

console.log('✅ Esbuild complete')

// 复制必要文件
console.log('📋 Copying files...')

// 复制前端构建产物到 public 目录
fs.cpSync(frontendDist, `${outDir}/public`, { recursive: true })
console.log('  Copied frontend dist → public')

// 复制 prisma schema
fs.mkdirSync(`${outDir}/prisma`, { recursive: true })
fs.copyFileSync('prisma/schema.prisma', `${outDir}/prisma/schema.prisma`)

// 创建干净的数据库模板（包含表结构，无数据）
console.log('🗄️  Creating database template...')
const templateDbPath = `${outDir}/data.db`
try {
  // 删除旧的
  if (fs.existsSync(templateDbPath)) {
    fs.rmSync(templateDbPath)
  }
  // 用 prisma db push 创建新的空数据库
  execSync(`npx prisma db push --schema=prisma/schema.prisma --skip-generate`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:../${templateDbPath}` }
  })
  console.log('✅ Database template created')
} catch (e) {
  console.error('⚠️  Failed to create database template:', e.message)
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
const path = require('path');
const fs = require('fs');

// 获取实际运行目录
const appDir = process.pkg
  ? path.dirname(process.execPath)  // pkg 打包后，使用可执行文件所在目录
  : __dirname;                       // 正常 Node.js 环境

// 虚拟文件系统中的资源目录（pkg 打包的文件）
const snapshotDir = __dirname;

console.log('🚀 TinyBridge Starting...');
console.log('📁 App directory:', appDir);

// 递归复制目录
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 首次运行时解压必要文件
if (process.pkg) {
  // 解压 .env
  const envDest = path.join(appDir, '.env');
  if (!fs.existsSync(envDest)) {
    console.log('📋 Extracting .env...');
    fs.copyFileSync(path.join(snapshotDir, '.env'), envDest);
  }

  // 解压 prisma 目录
  const prismaDest = path.join(appDir, 'prisma');
  if (!fs.existsSync(prismaDest)) {
    console.log('📋 Extracting prisma schema...');
    copyDirSync(path.join(snapshotDir, 'prisma'), prismaDest);
  }

  // 解压 node_modules（Prisma 运行时）
  const nodeModulesDest = path.join(appDir, 'node_modules');
  if (!fs.existsSync(path.join(nodeModulesDest, '@prisma'))) {
    console.log('📋 Extracting Prisma runtime (this may take a moment)...');
    copyDirSync(path.join(snapshotDir, 'node_modules'), nodeModulesDest);
  }

  // 解压 public 目录（前端文件）
  const publicDest = path.join(appDir, 'public');
  if (!fs.existsSync(publicDest)) {
    console.log('📋 Extracting frontend files...');
    copyDirSync(path.join(snapshotDir, 'public'), publicDest);
  }

  // 解压数据库模板（如果不存在）
  const dbDest = path.join(appDir, 'data.db');
  if (!fs.existsSync(dbDest)) {
    console.log('📋 Extracting database template...');
    fs.copyFileSync(path.join(snapshotDir, 'data.db'), dbDest);
  }
}

// 切换到应用目录
process.chdir(appDir);

// 设置环境变量
process.env.DATABASE_URL = 'file:' + path.join(appDir, 'data.db');

// 启动服务器
require('./server.cjs');
`)

console.log('✅ Files copied')

// 创建 package.json for pkg
const pkgJson = {
  name: 'tinybridge',
  version: '1.0.0',
  main: 'start.cjs',
  bin: 'start.cjs',
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
    targets: ['node20-win-x64'],
    outputPath: 'executable'
  }
}

fs.writeFileSync(`${outDir}/package.json`, JSON.stringify(pkgJson, null, 2))

// 复制必要的 node_modules
console.log('📦 Copying node_modules...')
const modulesToCopy = ['@prisma', '.prisma']
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
console.log('\nAfter pkg, copy these files next to the exe:')
console.log('  - .env')
console.log('  - prisma/schema.prisma')
console.log('  - data.db (optional, will be created if not exists)')
console.log('  - node_modules/@prisma and node_modules/.prisma')
