import mongoose from 'mongoose'

const workflowEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String, trim: true, maxlength: 1000 }
}, { _id: false })

const sampleRequestSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Legacy fields (optional to preserve data)
  speciesCategory: { type: String, trim: true, maxlength: 200 },
  sampleCategory: { type: String, trim: true, maxlength: 200 },
  testParameters: { type: [String] },
  sampleIdNo: { type: String, trim: true, maxlength: 100 },
  customerAddress: { type: String, trim: true, maxlength: 500 },
  isExistingCustomer: { type: Boolean, default: false },

  // New Client Fields
  sNo: { type: Number, unique: true },
  sampleName: { type: String, required: true, trim: true, maxlength: 200 },
  sampleNo: { type: String, required: true, trim: true, maxlength: 100 },
  customerName: { type: String, required: true, trim: true, maxlength: 200 },
  sentBy: { type: String, required: true, trim: true, maxlength: 200 },
  analysisRequired: { type: [String], required: true, validate: { validator: (value) => value.length > 0, message: 'Select at least one analysis required.' } },
  location: { type: String, required: true, trim: true, maxlength: 500 },
  sampleRequestDate: { type: Date, required: true },
  remark: { type: String, trim: true, maxlength: 1000 },

  // System Managed Fields
  approvedBy: { type: String },
  dateOfReceipt: { type: Date },
  reportDate: { type: Date },
  
  conditionPhotoUrl: { type: String },
  
  status: { 
    type: String, 
    required: true, 
    enum: [
      'Pending Approval', 'Approved', 'Rejected', 
      'Sample Received', 'Excel Logged', 'Results Recorded', 
      'Submitted for Review', 'Reviewed', 'Final/Sent'
    ],
    default: 'Pending Approval',
    index: true
  },
  linkedReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  workflowHistory: [workflowEventSchema],
}, { timestamps: true })

sampleRequestSchema.index({ ownerId: 1, createdAt: -1 })

export default mongoose.model('SampleRequest', sampleRequestSchema)
