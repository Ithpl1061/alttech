const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.trim() !== '') {
    const raw = envUrl.trim().replace(/\/$/, '')
    return raw.endsWith('/api') ? raw : `${raw}/api`
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify')) {
    return 'https://alttech.onrender.com/api'
  }
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

const cache = { list: null, details: new Map() }

class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(path, options = {}, retryCount = 0) {
  const isFormData = options.body instanceof FormData
  const headers = { ...options.headers }
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json'

  const isAuthMe = path === '/auth/me'
  const MAX_RETRIES = options._maxRetries ?? (isAuthMe ? 2 : 1)
  const timeoutMs = options.timeout ?? (isAuthMe ? 8000 : 7000)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers,
      signal: options.signal || controller.signal,
    })
    clearTimeout(timeoutId)
  } catch (err) {
    clearTimeout(timeoutId)
    if (retryCount < MAX_RETRIES && err.name !== 'AbortError') {
      await new Promise((r) => setTimeout(r, 400))
      return request(path, options, retryCount + 1)
    }
    throw new ApiError('Unable to connect to server. Please check your connection or wait a moment for the server to respond.', 0)
  }

  if ([502, 503, 504].includes(response.status) && retryCount < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, 600))
    return request(path, options, retryCount + 1)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const errMsg = typeof body === 'object' && body ? (body.error || body.message || 'Request failed.') : 'Request failed.'
    throw new ApiError(errMsg, response.status, body?.errors ?? {})
  }
  if (typeof body !== 'object' || body === null) {
    throw new ApiError('Cannot connect to backend API. Please set VITE_API_URL in Netlify Environment Variables.', 500)
  }
  return body
}

function reportForClient(report) {
  return { id: report._id ?? report.id, createdAt: report.createdAt, updatedAt: report.updatedAt, data: { ...report, id: undefined, _id: undefined, ownerId: undefined } }
}

export const api = {
  async me() {
    const res = await request('/auth/me')
    if (!res?.data?.user) throw new ApiError('Authentication required.', 401)
    return res.data.user
  },
  async signup(values) {
    const res = await request('/auth/signup', { method: 'POST', body: JSON.stringify(values) })
    if (!res?.data?.user) throw new ApiError(res?.message || 'Signup failed.', 400)
    return res.data.user
  },
  async createManager(values) {
    const res = await request('/auth/create-manager', { method: 'POST', body: JSON.stringify(values) })
    if (!res?.data?.user) throw new ApiError(res?.message || 'Manager creation failed.', 400)
    return res.data.user
  },
  async login(values) {
    const res = await request('/auth/login', { method: 'POST', body: JSON.stringify(values) })
    if (!res?.data?.user) throw new ApiError(res?.message || 'Login failed.', 400)
    return res.data.user
  },
  async logout() { return (await request('/auth/logout', { method: 'POST' })).data },
  async listReports({ force = false, from, to } = {}) {
    const isFiltered = from || to
    if (!force && !isFiltered && cache.list) return cache.list
    const query = new URLSearchParams()
    if (from) query.append('from', from)
    if (to) query.append('to', to)
    const qs = query.toString() ? `?${query.toString()}` : ''
    
    const result = (await request(`/reports${qs}`)).data.reports.map(reportForClient)
    if (!isFiltered) cache.list = result
    return result
  },
  async getReport(id, { force = false } = {}) {
    if (!force && cache.details.has(id)) return cache.details.get(id)
    const result = reportForClient((await request(`/reports/${encodeURIComponent(id)}`)).data.report)
    cache.details.set(id, result)
    return result
  },
  async createReport(data) {
    const result = reportForClient((await request('/reports', { method: 'POST', body: JSON.stringify(data) })).data.report)
    cache.details.set(result.id, result)
    cache.list = null
    cache.sampleRequestsList = null
    return result
  },
  async updateReport(id, data) {
    const result = reportForClient((await request(`/reports/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })).data.report)
    cache.details.set(result.id, result)
    cache.list = null
    cache.sampleRequestsList = null
    return result
  },
  async downloadPdf(id) {
    const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(id)}/pdf`, { credentials: 'include' })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(body.message || 'Unable to generate PDF.', response.status, body.errors ?? {})
    }
    return { blob: await response.blob(), filename: response.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/i)?.[1] ?? 'laboratory-report.pdf' }
  },
  async listTemplates({ force = false } = {}) {
    if (!force && cache.templatesList) return cache.templatesList
    const result = (await request('/templates')).data.templates.map(reportForClient)
    cache.templatesList = result
    return result
  },
  async getTemplate(id, { force = false } = {}) {
    if (!force && cache.details.has(`template_${id}`)) return cache.details.get(`template_${id}`)
    const result = reportForClient((await request(`/templates/${encodeURIComponent(id)}`)).data.template)
    cache.details.set(`template_${id}`, result)
    return result
  },
  async createTemplate(data) {
    const result = reportForClient((await request('/templates', { method: 'POST', body: JSON.stringify(data) })).data.template)
    cache.details.set(`template_${result.id}`, result)
    cache.templatesList = null
    return result
  },
  async updateTemplate(id, data) {
    const result = reportForClient((await request(`/templates/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })).data.template)
    cache.details.set(`template_${result.id}`, result)
    cache.templatesList = null
    return result
  },
  async deleteTemplate(id) {
    await request(`/templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
    cache.details.delete(`template_${id}`)
    cache.templatesList = null
  },
  async listSampleRequests({ force = false, from, to } = {}) {
    const isFiltered = from || to
    if (!force && !isFiltered && cache.sampleRequestsList) return cache.sampleRequestsList
    const query = new URLSearchParams()
    if (from) query.append('from', from)
    if (to) query.append('to', to)
    const qs = query.toString() ? `?${query.toString()}` : ''
    
    const result = (await request(`/sample-requests${qs}`)).data.sampleRequests
    const mapped = result.map(reportForClient)
    if (!isFiltered) cache.sampleRequestsList = mapped
    return mapped
  },
  async createSampleRequest(data) {
    const result = reportForClient((await request('/sample-requests', { method: 'POST', body: JSON.stringify(data) })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async approveSampleRequest(id, remarks) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/approve`, { method: 'PATCH', body: JSON.stringify({ remarks }) })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async rejectSampleRequest(id, remarks) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/reject`, { method: 'PATCH', body: JSON.stringify({ remarks }) })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async receiveSampleRequest(id, photoFile) {
    const formData = new FormData()
    formData.append('photo', photoFile)
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/receive`, { method: 'PATCH', body: formData })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async markExcelLogged(id) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/mark-excel-logged`, { method: 'PATCH' })).data)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async downloadExcelLog() {
    const response = await fetch(`${API_BASE_URL}/sample-requests/excel-log`, { method: 'GET', credentials: 'include' })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(body?.error || 'Failed to download Excel', response.status)
    }
    const blob = await response.blob()
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `All_Sample_Requests_Log.xlsx`
    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/["']/g, '')
    }
    return { blob, filename }
  },
  async submitSampleRequestReview(id) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/submit-review`, { method: 'PATCH' })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async markSampleRequestReviewed(id, remarks) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/review`, { method: 'PATCH', body: JSON.stringify({ reviewComments: remarks }) })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async finalizeSampleRequest(id) {
    const result = reportForClient((await request(`/sample-requests/${encodeURIComponent(id)}/finalize`, { method: 'PATCH' })).data.sampleRequest)
    cache.details.set(`samplerequest_${result.id}`, result)
    cache.sampleRequestsList = null
    return result
  },
  async deleteSampleRequest(id) {
    await request(`/sample-requests/${encodeURIComponent(id)}`, { method: 'DELETE' })
    cache.details.delete(`samplerequest_${id}`)
    cache.sampleRequestsList = null
  },
  async getNotifications() {
    return (await request('/notifications')).data.notifications
  },
  async markNotificationRead(id) {
    return (await request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' })).data.notification
  },
  async markAllNotificationsRead() {
    return (await request('/notifications/read-all', { method: 'PATCH' })).success
  },
  async reverseGeocode(lat, lng) {
    return (await request(`/location/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)).data.address
  },
  clearCache() { cache.list = null; cache.templatesList = null; cache.sampleRequestsList = null; cache.details.clear() },
}

export { ApiError }
