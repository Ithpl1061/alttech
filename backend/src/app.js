import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import helmet from 'helmet'
import { config } from './config/env.js'
import { asyncHandler } from './middleware/asyncHandler.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import reportRoutes from './routes/report.routes.js'
import templateRoutes from './routes/template.routes.js'
import sampleRequestRoutes from './routes/samplerequest.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import locationRoutes from './routes/location.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.isProduction ? 1 : 0)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  const allowedOrigins = new Set(config.clientOrigin.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean))
  app.use(cors({
    origin(origin, callback) {
      if (!config.isProduction || !origin) return callback(null, true)
      const cleanOrigin = origin.replace(/\/$/, '')
      if (allowedOrigins.has(cleanOrigin) || allowedOrigins.has('*') || cleanOrigin.endsWith('.netlify.app')) return callback(null, true)
      return callback(null, cleanOrigin)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '32kb' }))
  app.use(express.urlencoded({ extended: false, limit: '8kb' }))
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
  app.use(session({
    name: 'lab_report_session',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: config.mongodbUri, collectionName: 'sessions' }),
    cookie: {
      httpOnly: true,
      sameSite: config.isProduction ? 'none' : 'lax',
      secure: config.isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }))

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.' } })
  const noStore = (req, res, next) => { res.set('Cache-Control', 'no-store, private'); next() }
  app.get('/api/health', asyncHandler(async (req, res) => res.json({ success: true, data: { status: 'ok' } })))
  app.use('/api/auth', noStore, authRoutes)
  app.use('/api/reports', noStore, reportRoutes)
  app.use('/api/templates', noStore, templateRoutes)
  app.use('/api/sample-requests', noStore, sampleRequestRoutes)
  app.use('/api/notifications', noStore, notificationRoutes)
  app.use('/api/location', noStore, locationRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
