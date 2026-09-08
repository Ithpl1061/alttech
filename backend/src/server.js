import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { config } from './config/env.js'

const app = createApp()

try {
  await connectDatabase(config.mongodbUri)
  app.listen(config.port, '0.0.0.0', () => console.log(`Laboratory API listening on port ${config.port}`))
} catch (error) {
  console.error('Unable to start Laboratory API:', error)
  process.exitCode = 1
}
