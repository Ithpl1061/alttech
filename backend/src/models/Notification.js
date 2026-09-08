import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  read: { type: Boolean, default: false },
  link: { type: String, trim: true, maxlength: 500 },
  type: { type: String, trim: true, maxlength: 100 },
  sampleRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SampleRequest' },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
}, { timestamps: true })

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

export default mongoose.model('Notification', notificationSchema)
