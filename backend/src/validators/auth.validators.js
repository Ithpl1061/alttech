const emailPattern = /^\S+@\S+\.\S+$/

export function validateSignup(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const errors = {}
  const fullName = typeof source.fullName === 'string' ? source.fullName.trim() : ''
  const email = typeof source.email === 'string' ? source.email.trim().toLowerCase() : ''
  const password = typeof source.password === 'string' ? source.password : ''
  if (!fullName) errors.fullName = 'Full name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  if (source.confirmPassword === undefined || source.confirmPassword === '') errors.confirmPassword = 'Please confirm your password.'
  else if (password !== source.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return { errors, value: { fullName, email, password } }
}

export function validateLogin(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const errors = {}
  const email = typeof source.email === 'string' ? source.email.trim().toLowerCase() : ''
  const password = typeof source.password === 'string' ? source.password : ''
  if (!email) errors.email = 'Email is required.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return { errors, value: { email, password, remember: Boolean(source.remember) } }
}
