const fs = require('fs');
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const brokenSection = `  const handleReceive = async (id, file) => {
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }`;

const fixedSection = `  const handleReceive = async (id, file) => {
    try {
      const updated = await api.receiveSampleRequest(id, file)
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }

  const handleDownloadExcel = async () => {
    setAppError('')
    try {
      const { blob, filename } = await api.downloadExcelLog()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setAppError(error.message)
    }
  }

  const handleSubmitReview = async (id) => {
    try {
      const updated = await api.submitSampleRequestReview(id)
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }`;

app = app.replace(brokenSection, fixedSection);
fs.writeFileSync('frontend/src/App.jsx', app);
console.log('Fixed App.jsx');
