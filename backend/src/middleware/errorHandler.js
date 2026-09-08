export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with that value already exists.', errors: { email: 'Email is already registered.' } })
  }
  if (error?.name === 'ValidationError') {
    const errors = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
    return res.status(400).json({ success: false, message: 'Validation failed.', errors })
  }
  console.error(error)
  return res.status(error.statusCode ?? 500).json({ success: false, message: error.statusCode ? error.message : 'Internal server error.' })
}
