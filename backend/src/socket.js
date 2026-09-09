import { Server } from 'socket.io'
import { config } from './config/env.js'

let io = null

export function initSocket(httpServer) {
  const allowedOrigins = new Set(
    (config.clientOrigin || '*').split(',').map((origin) => origin.trim()).filter(Boolean)
  )

  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!config.isProduction || !origin || allowedOrigins.has(origin) || allowedOrigins.has('*')) {
          return callback(null, true)
        }
        return callback(new Error('Origin not allowed by Socket.IO CORS'))
      },
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId

    if (userId) {
      const roomName = `user_${userId}`
      socket.join(roomName)
      console.log(`[Socket.IO] Client ${socket.id} joined room ${roomName}`)
    }

    socket.on('register', (data) => {
      const id = data?.userId || data
      if (id) {
        const roomName = `user_${id}`
        socket.join(roomName)
        console.log(`[Socket.IO] Client ${socket.id} registered to room ${roomName}`)
      }
    })

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client ${socket.id} disconnected`)
    })
  })

  return io
}

export function getIO() {
  return io
}

export function emitNotificationToUser(userId, notification) {
  if (!io || !userId) return false
  const targetId = userId._id ? userId._id.toString() : userId.toString()
  const roomName = `user_${targetId}`
  io.to(roomName).emit('new_notification', notification)
  console.log(`[Socket.IO] Emitted notification to room ${roomName}:`, notification?.title)
  return true
}
