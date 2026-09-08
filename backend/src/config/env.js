import 'dotenv/config'

const requiredInProduction = ['MONGODB_URI', 'SESSION_SECRET', 'CLIENT_ORIGIN']

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key])
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`)
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/laboratory_reports',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://10.10.52.74:5173',
  sessionSecret: process.env.SESSION_SECRET ?? 'development-only-change-this-secret',
  playwrightExecutablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
  isProduction: process.env.NODE_ENV === 'production',
}
