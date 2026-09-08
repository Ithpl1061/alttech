const testFields = ['parameter', 'method', 'unit'] // result is omitted, remark is optional

export function validateTemplate(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const errors = {}
  const value = {}
  
  const nameValue = typeof source.name === 'string' ? source.name.trim() : ''
  value.name = nameValue
  if (!nameValue) errors.name = 'Template name is required.'
  
  const tests = Array.isArray(source.tests) ? source.tests : []
  if (!tests.length) errors.tests = 'Add at least one test row.'
  value.tests = tests.map((test, index) => {
    const normalized = {}
    for (const key of testFields) {
      normalized[key] = typeof test?.[key] === 'string' ? test[key].trim() : ''
      if (!normalized[key]) errors[`tests.${index}.${key}`] = 'Required'
    }
    normalized.remark = typeof test?.remark === 'string' ? test.remark.trim() : ''
    return normalized
  })
  return { errors, value }
}
