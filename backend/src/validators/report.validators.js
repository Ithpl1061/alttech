const basicFields = [
  ['name', 'Name'], ['address', 'Address'], ['reportNo', 'Report No.'],
  ['sampleReceiptDate', 'Sample Receipt Date'], ['sampleNameNo', 'Sample Name/No.'],
  ['reportDate', 'Report Date'], ['samplePacking', 'Sample Packing'],
]
const testFields = ['parameter', 'method', 'result', 'unit', 'remark']
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isDateOnly(value) {
  if (!datePattern.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateReport(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const errors = {}
  const value = {}
  for (const [key, label] of basicFields) {
    const fieldValue = typeof source[key] === 'string' ? source[key].trim() : ''
    value[key] = fieldValue
    if (!fieldValue) errors[key] = `${label} is required.`
  }
  for (const key of ['sampleReceiptDate', 'reportDate']) {
    if (value[key] && !isDateOnly(value[key])) errors[key] = 'Enter a valid date.'
  }
  const tests = Array.isArray(source.tests) ? source.tests : []
  if (!tests.length) errors.tests = 'Add at least one test row.'
  value.tests = tests.map((test, index) => {
    const normalized = {}
    for (const key of testFields) {
      normalized[key] = typeof test?.[key] === 'string' ? test[key].trim() : ''
      if (!normalized[key]) errors[`tests.${index}.${key}`] = 'Required'
    }
    return normalized
  })
  return { errors, value }
}
