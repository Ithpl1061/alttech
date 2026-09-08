import bcrypt from 'bcryptjs'
import { Router } from 'express'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { validateLogin, validateSignup } from '../validators/auth.validators.js'

const router = Router()
const BCRYPT_ROUNDS = 12

function publicUser(user) {
  return { id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role }
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()))
}

router.post('/signup', asyncHandler(async (req, res) => {
  const { errors, value } = validateSignup(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  const passwordHash = await bcrypt.hash(value.password, BCRYPT_ROUNDS)
  const user = await User.create({ fullName: value.fullName, email: value.email, passwordHash, role: 'Staff' })
  return res.status(201).json({ success: true, data: { user: publicUser(user) } })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { errors, value } = validateLogin(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  const user = await User.findOne({ email: value.email }).select('+passwordHash')
  const passwordMatches = user ? await bcrypt.compare(value.password, user.passwordHash) : false
  if (!passwordMatches) return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  await regenerateSession(req)
  req.session.userId = user._id.toString()
  req.session.cookie.maxAge = value.remember ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 8
  return res.json({ success: true, data: { user: publicUser(user) } })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('_id fullName email role').lean()
  if (!user) {
    req.session.destroy(() => {})
    return res.status(401).json({ success: false, message: 'Authentication required.' })
  }
  return res.json({ success: true, data: { user: publicUser(user) } })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  if (req.session) await new Promise((resolve) => req.session.destroy(() => resolve()))
  res.clearCookie('lab_report_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  return res.json({ success: true, data: { loggedOut: true } })
}))

export default router
