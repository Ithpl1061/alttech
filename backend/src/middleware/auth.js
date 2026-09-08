import { asyncHandler } from './asyncHandler.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ success: false, message: 'Authentication required.' })
  req.userId = req.session.userId
  next()
})
