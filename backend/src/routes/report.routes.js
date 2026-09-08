import { isValidObjectId, Types } from 'mongoose'
import { Router } from 'express'
import Report from '../models/Report.js'
import SampleRequest from '../models/SampleRequest.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { validateReport } from '../validators/report.validators.js'
import { generateReportPdf } from '../services/pdf.service.js'

const router = Router()
router.use(requireAuth)

function invalidId(res) {
  return res.status(404).json({ success: false, message: 'Report not found.' })
}

function requireId(id, res) {
  return isValidObjectId(id) ? new Types.ObjectId(id) : invalidId(res)
}

router.get('/', asyncHandler(async (req, res) => {
  const { from, to } = req.query
  if (from && to && from > to) {
    return res.status(400).json({ success: false, message: 'Invalid date range' })
  }

  const user = await import('../models/User.js').then(m => m.default.findById(req.userId))
  let reportFilter = { ownerId: req.userId }

  if (user?.role?.toLowerCase() === 'manager') {
    const historicalRequests = await SampleRequest.find({
      status: { $in: ['Reviewed', 'Final/Sent'] },
      linkedReportId: { $exists: true, $ne: null }
    }).select('linkedReportId').lean()
    
    const historicalReportIds = historicalRequests.map(r => r.linkedReportId)
    reportFilter = { _id: { $in: historicalReportIds } }
  }

  if (from || to) {
    reportFilter.reportDate = {}
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (from && dateRegex.test(from)) reportFilter.reportDate.$gte = from
    if (to && dateRegex.test(to)) reportFilter.reportDate.$lte = to
    if (Object.keys(reportFilter.reportDate).length === 0) delete reportFilter.reportDate
  }

  const reports = await Report.find(reportFilter)
    .select('_id name reportNo sampleNameNo reportDate createdAt updatedAt')
    .sort({ reportDate: -1, updatedAt: -1 })
    .lean()
  return res.json({ success: true, data: { reports } })
}))

router.post('/', asyncHandler(async (req, res) => {
  const user = await import('../models/User.js').then(m => m.default.findById(req.userId))
  if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, message: 'Managers cannot create reports.' })
  
  const { sampleRequestId, ...bodyData } = req.body
  const { errors, value } = validateReport(bodyData)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  
  const report = await Report.create({ ...value, ownerId: req.userId })
  
  if (sampleRequestId && isValidObjectId(sampleRequestId)) {
    const sreq = await SampleRequest.findById(sampleRequestId)
    if (sreq && ['Sample Received', 'Excel Logged', 'Results Recorded'].includes(sreq.status)) {
      sreq.linkedReportId = report._id
      sreq.status = 'Results Recorded'
      sreq.workflowHistory.push({
        status: 'Results Recorded',
        actionBy: req.userId,
        remarks: 'Report created and linked.'
      })
      await sreq.save()
    }
  }

  const reportObj = report.toObject ? report.toObject() : report
  if (sampleRequestId) {
    reportObj.sampleRequestId = sampleRequestId
  }

  return res.status(201).json({ success: true, data: { report: reportObj } })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const user = await import('../models/User.js').then(m => m.default.findById(req.userId))
  const query = { _id: id }
  if (user?.role?.toLowerCase() !== 'manager') query.ownerId = req.userId
  const report = await Report.findOne(query).lean()
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })
  
  const linkedRequest = await SampleRequest.findOne({ linkedReportId: id }).lean()
  if (linkedRequest) {
    report.sampleRequestId = linkedRequest._id
    if (['Reviewed', 'Final/Sent'].includes(linkedRequest.status)) {
      report.isFinalized = true
    }
  }
  
  return res.json({ success: true, data: { report } })
}))

async function updateReport(req, res) {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const user = await import('../models/User.js').then(m => m.default.findById(req.userId))
  if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, message: 'Managers cannot edit reports.' })
  
  const linkedRequest = await SampleRequest.findOne({ linkedReportId: id })
  if (linkedRequest && ['Reviewed', 'Final/Sent'].includes(linkedRequest.status)) {
    return res.status(403).json({ success: false, message: 'Cannot edit a finalized report.' })
  }

  const { sampleRequestId, ...bodyData } = req.body
  const { errors, value } = validateReport(bodyData)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  const report = await Report.findOneAndUpdate({ _id: id, ownerId: req.userId }, value, { returnDocument: 'after', runValidators: true }).lean()
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })

  const reqId = sampleRequestId || linkedRequest?._id
  if (reqId && isValidObjectId(reqId)) {
    const sreq = linkedRequest || await SampleRequest.findById(reqId)
    if (sreq && ['Sample Received', 'Excel Logged', 'Results Recorded'].includes(sreq.status)) {
      sreq.linkedReportId = report._id
      if (sreq.status !== 'Results Recorded') {
        sreq.status = 'Results Recorded'
        sreq.workflowHistory.push({
          status: 'Results Recorded',
          actionBy: req.userId,
          remarks: 'Report updated and linked.'
        })
      }
      await sreq.save()
    }
    report.sampleRequestId = reqId
  }

  return res.json({ success: true, data: { report } })
}

router.put('/:id', asyncHandler(updateReport))
router.patch('/:id', asyncHandler(updateReport))

router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const user = await import('../models/User.js').then(m => m.default.findById(req.userId))
  const query = { _id: id }
  if (user?.role?.toLowerCase() !== 'manager') query.ownerId = req.userId
  const report = await Report.findOne(query).lean()
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' })
  const pdf = await generateReportPdf(report)
  res.set({ 'Cache-Control': 'no-store, private', 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${report.reportNo.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'laboratory-report'}.pdf"` })
  return res.send(pdf)
}))

export default router
