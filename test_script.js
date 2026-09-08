import { api } from './src/api.js'

async function runTest() {
  try {
    console.log('1. Trying to login with test user')
    await api.login({ email: 'ar123@gmail.com', password: 'password123' }).catch(async (e) => {
      console.log('Login failed, attempting signup', e.message)
      await api.signup({ fullName: 'Test User', email: 'ar123@gmail.com', password: 'password123' }).catch(() => {})
      await api.login({ email: 'ar123@gmail.com', password: 'password123' })
    })

    console.log('Logged in successfully.')

    console.log('2. Creating Template "DDGS_TEST"')
    const newTemplate = await api.createTemplate({
      name: 'DDGS_TEST_' + Date.now(),
      tests: [{
        parameter: 'Protein',
        method: 'AOAC',
        unit: '%',
        remark: 'Standard'
      }]
    })
    console.log('Template created:', newTemplate)

    console.log('3. Fetching templates...')
    const templates = await api.listTemplates({ force: true })
    console.log(`Found ${templates.length} templates.`)
    const found = templates.find(t => t.id === newTemplate.id)
    if (!found) {
      throw new Error('Created template was not found in list!')
    }
    console.log('Verified template exists in list.')

    console.log('ALL BACKEND TESTS PASSED.')

  } catch (error) {
    console.error('TEST FAILED:', error)
  }
}

runTest()
