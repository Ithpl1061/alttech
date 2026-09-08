const fs = require('fs');

let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

const oldFunc = `  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sample request?')) return;
    try {
      setAppError('');
      await api.deleteSampleRequest(id);
      setSampleRequests((current) => current.filter(r => r.id !== id));
    } catch (error) {
      setAppError(error.message || 'Failed to delete sample request.');
    }
  };`;

const newFunc = `  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sample request?')) return;
    try {
      setAppError('');
      await api.deleteSampleRequest(id);
      setSampleRequests((current) => current.filter(r => r.id !== id));
    } catch (error) {
      const msg = error.message || 'Failed to delete sample request.';
      setAppError(msg);
      window.alert('Deletion failed: ' + msg);
      console.error('Delete error:', error);
    }
  };`;

appJsx = appJsx.replace(oldFunc, newFunc);
fs.writeFileSync('src/App.jsx', appJsx);
console.log('App.jsx updated with delete alert.');
