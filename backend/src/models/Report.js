import mongoose from 'mongoose'

const testSchema = new mongoose.Schema({
  parameter: { type: String, required: true, trim: true, maxlength: 200 },
  method: { type: String, required: true, trim: true, maxlength: 200 },
  result: { type: String, required: true, trim: true, maxlength: 200 },
  unit: { type: String, required: true, trim: true, maxlength: 100 },
  remark: { type: String, required: true, trim: true, maxlength: 200 },
}, { _id: false })

function validDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

const reportSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  reportNo: { type: String, required: true, trim: true, maxlength: 100 },
  sampleReceiptDate: { type: String, required: true, validate: { validator: validDateOnly, message: 'Enter a valid date.' } },
  sampleNameNo: { type: String, required: true, trim: true, maxlength: 200 },
  reportDate: { type: String, required: true, validate: { validator: validDateOnly, message: 'Enter a valid date.' } },
  samplePacking: { type: String, required: true, trim: true, maxlength: 200 },
  tests: { type: [testSchema], required: true, validate: { validator: (value) => value.length > 0, message: 'Add at least one test row.' } },
}, { timestamps: true })

reportSchema.index({ ownerId: 1, updatedAt: -1 })
reportSchema.index({ ownerId: 1, reportDate: -1 })
reportSchema.index({ ownerId: 1, reportNo: 1 })

export default mongoose.model('Report', reportSchema)
