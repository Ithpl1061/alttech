import { isValidObjectId, Types } from 'mongoose'
import { Router } from 'express'
import Template from '../models/Template.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { validateTemplate } from '../validators/template.validators.js'

const router = Router()
router.use(requireAuth)

function invalidId(res) {
  return res.status(404).json({ success: false, message: 'Template not found.' })
}

function requireId(id, res) {
  return isValidObjectId(id) ? new Types.ObjectId(id) : invalidId(res)
}

router.get('/', asyncHandler(async (req, res) => {
  const templates = await Template.find({ ownerId: req.userId })
    .sort({ name: 1 })
    .lean()
  return res.json({ success: true, data: { templates } })
}))

router.post('/', asyncHandler(async (req, res) => {
  const { errors, value } = validateTemplate(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  
  const existing = await Template.findOne({ ownerId: req.userId, name: value.name })
  if (existing) return res.status(400).json({ success: false, message: 'Template with this name already exists.', errors: { name: 'Name must be unique.' } })

  const template = await Template.create({ ...value, ownerId: req.userId })
  return res.status(201).json({ success: true, data: { template } })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const template = await Template.findOne({ _id: id, ownerId: req.userId }).lean()
  if (!template) return res.status(404).json({ success: false, message: 'Template not found.' })
  return res.json({ success: true, data: { template } })
}))

async function updateTemplate(req, res) {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const { errors, value } = validateTemplate(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  
  const existing = await Template.findOne({ ownerId: req.userId, name: value.name, _id: { $ne: id } })
  if (existing) return res.status(400).json({ success: false, message: 'Template with this name already exists.', errors: { name: 'Name must be unique.' } })

  const template = await Template.findOneAndUpdate({ _id: id, ownerId: req.userId }, value, { returnDocument: 'after', runValidators: true }).lean()
  if (!template) return res.status(404).json({ success: false, message: 'Template not found.' })
  return res.json({ success: true, data: { template } })
}

router.put('/:id', asyncHandler(updateTemplate))
router.patch('/:id', asyncHandler(updateTemplate))

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = requireId(req.params.id, res)
  if (!id) return undefined
  const template = await Template.findOneAndDelete({ _id: id, ownerId: req.userId })
  if (!template) return res.status(404).json({ success: false, message: 'Template not found.' })
  return res.json({ success: true, data: { id } })
}))

export default router
