import app from './app.js'
import { config } from './config/index.js'
import prisma from './config/database.js'

async function main() {
  try {
    // 测试数据库连接
    await prisma.$connect()
    console.log('✅ Database connected')

    // 启动服务器
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`)
      console.log(`📚 Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

main()
