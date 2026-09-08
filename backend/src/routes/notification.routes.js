import express from 'express'
import Notification from '../models/Notification.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50)
    res.json({ success: true, data: { notifications } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { returnDocument: 'after' }
    )
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' })
    res.json({ success: true, data: { notification } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
