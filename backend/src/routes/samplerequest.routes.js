import express from 'express'
import SampleRequest from '../models/SampleRequest.js'
import Counter from '../models/Counter.js'
import Report from '../models/Report.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadPhoto } from '../middleware/upload.js'
import ExcelJS from 'exceljs'

const router = express.Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query
    if (from && to && from > to) {
      return res.status(400).json({ success: false, error: 'Invalid date range' })
    }

    const user = await User.findById(req.userId)
    let filter = { ownerId: req.userId }
    if (user?.role?.toLowerCase() === 'manager') {
      filter = {}
    }

    if (from || to) {
      const dateCond = {}
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (from && dateRegex.test(from)) {
        dateCond.$gte = new Date(`${from}T00:00:00.000Z`)
      }
      if (to && dateRegex.test(to)) {
        const toDate = new Date(`${to}T00:00:00.000Z`)
        toDate.setDate(toDate.getDate() + 1)
        dateCond.$lt = toDate
      }
      if (Object.keys(dateCond).length > 0) {
        filter.$or = [
          { sampleRequestDate: dateCond },
          { createdAt: dateCond }
        ]
      }
    }

    const requests = await SampleRequest.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: { sampleRequests: requests } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, error: 'Managers cannot create sample requests.' })
    const { sampleName, sampleNo, customerName, sentBy, approvedBy, analysisRequired, location, sampleRequestDate, reportDate, remark } = req.body
    
    if (!reportDate) {
      return res.status(400).json({ success: false, errors: { reportDate: 'Report Date is required.' } })
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: 'sampleRequestId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    )
    
    const request = new SampleRequest({
      ownerId: req.userId,
      sNo: counter.seq,
      sampleName,
      sampleNo,
      customerName,
      sentBy,
      approvedBy,
      analysisRequired,
      location,
      sampleRequestDate,
      reportDate,
      remark,
      status: 'Pending Approval',
      workflowHistory: [{
        status: 'Pending Approval',
        actionBy: req.userId,
        remarks: 'Pickup request created.'
      }]
    })
    
    await request.save()
    const managers = await User.find({ role: 'Manager' }).select('_id')
    if (managers.length > 0) {
      await Notification.insertMany(managers.map(m => ({
        userId: m._id,
        title: 'Sample Request Pending Approval',
        message: `Sample No.: ${request.sampleNo || 'N/A'}\nCustomer: ${request.customerName || 'N/A'}\nSample: ${request.sampleName || 'N/A'}\nAnalysis: ${(request.analysisRequired || []).join(', ') || 'N/A'}\nSent By: ${request.sentBy || 'N/A'}`,
        link: 'workflow',
        type: 'APPROVAL_REVIEW',
        sampleRequestId: request._id
      })))
    }
    res.status(201).json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => { acc[key] = error.errors[key].message; return acc }, {})
      return res.status(400).json({ success: false, errors })
    }
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/approve', async (req, res) => {
  try {
    const { remarks } = req.body
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Only pending requests can be approved.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() !== 'manager') return res.status(403).json({ success: false, error: 'Only Managers can approve requests.' })

    request.status = 'Approved'
    request.approvedBy = request.approvedBy || user.fullName || user.username
    request.workflowHistory.push({
      status: 'Approved',
      actionBy: req.userId,
      remarks: remarks || 'Request approved.'
    })
    
    await request.save()
    await Notification.create({
      userId: request.ownerId,
      title: 'Request Approved',
      message: `Your Sample Pickup Request ${request.sampleNo || request.sampleIdNo} has been approved. ${remarks ? `Remarks: ${remarks}` : ''}`,
      link: 'workflow'
    })
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/reject', async (req, res) => {
  try {
    const { remarks } = req.body
    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ success: false, error: 'Rejection reason is required.' })
    }
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Only pending requests can be rejected.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() !== 'manager') return res.status(403).json({ success: false, error: 'Only Managers can reject requests.' })

    request.status = 'Rejected'
    request.workflowHistory.push({
      status: 'Rejected',
      actionBy: req.userId,
      remarks: remarks || 'Request rejected.'
    })
    
    await request.save()
    await Notification.create({
      userId: request.ownerId,
      title: 'Request Rejected',
      message: `Your Sample Pickup Request ${request.sampleNo || request.sampleIdNo} has been rejected. ${remarks ? `Remarks: ${remarks}` : ''}`,
      link: 'workflow'
    })
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/receive', uploadPhoto.single('photo'), async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Approved') return res.status(400).json({ success: false, error: 'Only Approved requests can be marked as received.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, error: 'Managers cannot perform staff actions.' })
    
    if (!req.file) return res.status(400).json({ success: false, error: 'Condition photo is required.' })
    
    request.status = 'Sample Received'
    request.conditionPhotoUrl = '/uploads/photos/' + req.file.filename
    request.dateOfReceipt = new Date()
    request.workflowHistory.push({
      status: 'Sample Received',
      actionBy: req.userId,
      remarks: 'Sample condition photo uploaded and marked as received.'
    })
    
    await request.save()
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/excel-log', async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, error: 'Managers cannot generate the Excel log.' })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Sample Log')
    
    sheet.columns = [
      { header: 'S.No', key: 'sNo', width: 10 },
      { header: 'Date of receipt', key: 'dateOfReceipt', width: 20 },
      { header: 'Sample name', key: 'sampleName', width: 25 },
      { header: 'Sample no', key: 'sampleNo', width: 20 },
      { header: 'Customer name', key: 'customerName', width: 30 },
      { header: 'Sent by', key: 'sentBy', width: 20 },
      { header: 'Analysis required', key: 'analysisRequired', width: 40 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Report Date', key: 'reportDate', width: 20 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
      { header: 'Sample Request Date', key: 'sampleRequestDate', width: 20 },
      { header: 'Remark', key: 'remark', width: 30 }
    ]
    
    let filter = {}
    if (user?.role?.toLowerCase() !== 'manager') {
      filter.ownerId = req.userId
    }

    const formatDate = (val) => {
      if (!val) return ''
      const d = new Date(val)
      return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-GB')
    }

    const allRequests = await SampleRequest.find(filter).populate('linkedReportId').sort({ createdAt: -1 })
    
    allRequests.forEach((r, idx) => {
      let finalReportDate = ''
      if (r.linkedReportId && r.linkedReportId.reportDate) {
        finalReportDate = formatDate(r.linkedReportId.reportDate)
      } else if (r.reportDate) {
        finalReportDate = formatDate(r.reportDate)
      }

      sheet.addRow({
        sNo: r.sNo || (idx + 1),
        dateOfReceipt: formatDate(r.dateOfReceipt) || formatDate(r.createdAt) || '-',
        sampleName: r.sampleName || r.sampleCategory || r.speciesCategory || '-',
        sampleNo: r.sampleNo || r.sampleIdNo || '-',
        customerName: r.customerName || '-',
        sentBy: r.sentBy || '-',
        analysisRequired: (Array.isArray(r.analysisRequired) && r.analysisRequired.length) 
          ? r.analysisRequired.join(', ') 
          : ((Array.isArray(r.testParameters) && r.testParameters.length) ? r.testParameters.join(', ') : '-'),
        location: r.location || r.customerAddress || '-',
        status: r.status || '-',
        reportDate: finalReportDate || '-',
        approvedBy: r.approvedBy || '-',
        sampleRequestDate: formatDate(r.sampleRequestDate) || formatDate(r.createdAt) || '-',
        remark: r.remark || '-'
      })
    })
    
    sheet.getRow(1).font = { bold: true }
    
    const buffer = await workbook.xlsx.writeBuffer()
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="All_Sample_Requests_Log.xlsx"`)
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/mark-excel-logged', async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' })
    if (request.status !== 'Sample Received') {
      return res.status(400).json({ success: false, error: 'Request must be marked as received before logging to Excel.' })
    }
    request.status = 'Excel Logged'
    request.workflowHistory.push({
      status: 'Excel Logged',
      updatedBy: req.userId,
      updatedAt: new Date()
    })
    await request.save()
    res.json({ success: true, data: request })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/submit-review', async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Results Recorded') return res.status(400).json({ success: false, error: 'Only requests with recorded results can be submitted for review.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') {
      return res.status(403).json({ success: false, error: 'Managers cannot submit reports for review.' })
    }
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Access denied.' })
    }

    request.status = 'Submitted for Review'
    request.workflowHistory.push({
      status: 'Submitted for Review',
      actionBy: req.userId,
      remarks: 'Results submitted for review.'
    })
    await request.save()

    const managers = await User.find({ role: { $regex: /^manager$/i } }).select('_id')
    if (managers.length > 0) {
      await Notification.insertMany(managers.map(m => ({
        userId: m._id,
        title: 'Report Ready for Review',
        message: `Sample Request ${request.sampleNo || request.sampleIdNo || ''} (${request.customerName}) has been submitted for review.`,
        link: 'review',
        type: 'REPORT_REVIEW',
        sampleRequestId: request._id,
        reportId: request.linkedReportId
      })))
    }
    
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') {
      return res.status(403).json({ success: false, error: 'Managers cannot delete sample requests.' })
    }
    
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Access denied.' })
    }
    const lockedStatuses = ['Submitted for Review', 'Reviewed', 'Final/Sent', 'Rejected']
    if (lockedStatuses.includes(request.status)) {
      return res.status(403).json({ success: false, error: 'Cannot delete processed records.' })
    }

    await SampleRequest.findByIdAndDelete(req.params.id)
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/review', async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Submitted for Review') return res.status(400).json({ success: false, error: 'Only submitted requests can be reviewed.' })
    
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() !== 'manager') {
      return res.status(403).json({ success: false, error: 'Only Managers can review reports.' })
    }

    request.status = 'Reviewed'
    request.workflowHistory.push({
      status: 'Reviewed',
      actionBy: req.userId,
      remarks: req.body.reviewComments || 'Report reviewed and approved.'
    })
    await request.save()

    await Notification.create({
      userId: request.ownerId,
      title: 'Report Reviewed',
      message: `Your report for Sample Request ${request.sampleNo || request.sampleIdNo} has been reviewed and approved.`,
      link: 'workflow'
    })
    
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/:id/finalize', async (req, res) => {
  try {
    const request = await SampleRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' })
    if (request.status !== 'Reviewed') return res.status(400).json({ success: false, error: 'Only reviewed requests can be finalized.' })
    
    request.status = 'Final/Sent'
    const linkedReport = await Report.findById(request.linkedReportId)
    request.workflowHistory.push({
      status: 'Final/Sent',
      actionBy: req.userId,
      remarks: 'Report finalized and ready to send.'
    })
    await request.save()
    
    res.json({ success: true, data: { sampleRequest: request } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
