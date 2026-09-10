import http from 'http'
import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { config } from './config/env.js'
import { initSocket } from './socket.js'

const app = createApp()
const server = http.createServer(app)
initSocket(server)

server.keepAliveTimeout = 65000
server.headersTimeout = 66000

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Laboratory API listening on port ${config.port}`)
})

try {
  await connectDatabase(config.mongodbUri)
} catch (error) {
  console.error('Unable to connect to MongoDB:', error)
}
