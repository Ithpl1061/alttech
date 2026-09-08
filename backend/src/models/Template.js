import mongoose from 'mongoose'

const testTemplateSchema = new mongoose.Schema({
  parameter: { type: String, required: true, trim: true, maxlength: 200 },
  method: { type: String, required: true, trim: true, maxlength: 200 },
  unit: { type: String, required: true, trim: true, maxlength: 100 },
  remark: { type: String, required: false, trim: true, maxlength: 200 },
}, { _id: false })

const templateSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  tests: { type: [testTemplateSchema], required: true, validate: { validator: (value) => value.length > 0, message: 'Template must have at least one test row.' } },
}, { timestamps: true })

templateSchema.index({ ownerId: 1, name: 1 }, { unique: true })

export default mongoose.model('Template', templateSchema)
