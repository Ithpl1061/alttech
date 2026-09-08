const fs = require('fs');
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// The file currently has:
//   const handleReceive = async (id, file) => {
//       setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
//     } catch (error) {
//       setAppError(error.message)
//     }
//   }
//   const handleDeleteRequest = async (id) => {

// Let's replace everything from `const handleReceive = async (id, file) => {` 
// up to `const handleDeleteRequest = async (id) => {`

const startIndex = app.indexOf('  const handleReceive = async (id, file) => {');
const endIndex = app.indexOf('  const handleDeleteRequest = async (id) => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `  const handleReceive = async (id, file) => {
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
  }
`;
  app = app.substring(0, startIndex) + newBlock + app.substring(endIndex);
  fs.writeFileSync('frontend/src/App.jsx', app);
  console.log('Successfully fixed App.jsx block');
} else {
  console.log('Could not find indices!');
}
