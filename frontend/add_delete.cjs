const fs = require('fs');

let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add handleDeleteRequest function
const handleRejectStr = `  const handleReject = async (id) => {`;
const handleDeleteRequestStr = `  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sample request?')) return;
    try {
      setAppError('');
      await api.deleteSampleRequest(id);
      setSampleRequests((current) => current.filter(r => r.id !== id));
    } catch (error) {
      setAppError(error.message || 'Failed to delete sample request.');
    }
  };

  const handleReject = async (id) => {`;

if (!appJsx.includes('handleDeleteRequest')) {
  appJsx = appJsx.replace(handleRejectStr, handleDeleteRequestStr);
}

// 2. Add Delete button to the table row
// We'll replace `</td></tr>)` with the delete button + `</td></tr>)`
// Need to be careful to match the exact end of the Action td.
// Wait, the row ends with `</button>}</td></tr>)` but there could be other conditions like `</label>}` or just `</span>}` or `</button>} `

// Let's do a more robust replace for the Action td end.
// We are looking for the map function return value for the table body.
// The map looks like: `sampleRequests.map((req) => <tr key={req.id}>...<td data-label="Action">{...}</td></tr>)`

const actionTdRegex = /(<td data-label="Action">.*?)<\/td><\/tr>\)/g;
appJsx = appJsx.replace(actionTdRegex, `$1 <button type="button" onClick={() => handleDeleteRequest(req.id)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginLeft: '8px' }}>Delete</button></td></tr>)`);

fs.writeFileSync('src/App.jsx', appJsx);
console.log('App.jsx updated with Delete option.');
