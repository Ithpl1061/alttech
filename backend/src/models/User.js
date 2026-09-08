import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 160 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true, maxlength: 320 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Staff', 'Manager'], default: 'Staff' },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
