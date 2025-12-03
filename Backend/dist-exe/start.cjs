
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
