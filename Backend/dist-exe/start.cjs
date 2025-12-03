
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
