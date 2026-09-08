const fs = require('fs');
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add ApprovalReviewScreen component before AuthPage
const approvalReviewComponent = `function ApprovalReviewScreen({ request, onApprove, onReject, onCancel }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  
  const handleApprove = () => {
    onApprove(request.id, comment)
  }
  const handleReject = () => {
    if (!comment || comment.trim() === '') {
      setError('Rejection reason is required.')
      return
    }
    onReject(request.id, comment)
  }

  return (
    <div className="report-form-panel">
      <div className="panel-heading">
        <h2>Sample Request Approval</h2>
        <p>Review the details before making a decision.</p>
      </div>
      <div className="report-form" style={{ padding: '24px' }}>
        <div className="field-grid">
          <div className="form-row">
            <label>Sample No.</label>
            <input type="text" className="premium-input" value={request.data.sampleNo || request.data.sampleIdNo || ''} readOnly />
          </div>
          <div className="form-row">
            <label>Sample Name</label>
            <input type="text" className="premium-input" value={request.data.sampleName || ''} readOnly />
          </div>
          <div className="form-row">
            <label>Customer Name</label>
            <input type="text" className="premium-input" value={request.data.customerName || ''} readOnly />
          </div>
          <div className="form-row">
            <label>Sent By</label>
            <input type="text" className="premium-input" value={request.data.sentBy || ''} readOnly />
          </div>
          <div className="form-row">
            <label>Analysis Required</label>
            <input type="text" className="premium-input" value={(request.data.analysisRequired || []).join(', ')} readOnly />
          </div>
          <div className="form-row">
            <label>Location</label>
            <input type="text" className="premium-input" value={request.data.location || ''} readOnly />
          </div>
          <div className="form-row">
            <label>Sample Request Date</label>
            <input type="text" className="premium-input" value={request.data.sampleRequestDate ? new Date(request.data.sampleRequestDate).toLocaleDateString('en-GB') : ''} readOnly />
          </div>
          <div className="form-row">
            <label>Report Date</label>
            <input type="text" className="premium-input" value={request.data.reportDate ? new Date(request.data.reportDate).toLocaleDateString('en-GB') : ''} readOnly />
          </div>
        </div>
        
        {request.data.remark && (
          <div className="form-row" style={{ marginTop: '16px' }}>
            <label>Remark</label>
            <textarea className="premium-input" value={request.data.remark} readOnly rows={3}></textarea>
          </div>
        )}

        <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <h3>Approval Decision</h3>
          <div className="form-row" style={{ marginTop: '16px' }}>
            <label>Manager Comment <span style={{color: '#64748b', fontWeight: 'normal'}}>(Required for Rejection)</span></label>
            <textarea 
              className="premium-input" 
              value={comment} 
              onChange={e => { setComment(e.target.value); setError(''); }} 
              placeholder="Enter remarks or rejection reason..."
              rows={4}
            ></textarea>
            {error && <span className="field-error" style={{color: '#dc3545', fontSize: '13px', marginTop: '4px'}}>{error}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="validate-button" onClick={handleApprove}>Approve</button>
            <button type="button" className="validate-button" style={{ background: '#dc3545', color: 'white', border: 'none' }} onClick={handleReject}>Reject</button>
            <button type="button" onClick={onCancel} style={{ padding: '0 20px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthPage`;
appJsx = appJsx.replace('function AuthPage', approvalReviewComponent);

// 2. Update Notification click handler
const oldNotifClick = `if (n.type === 'REPORT_REVIEW') openReview(n.reportId, n.sampleRequestId); else if (n.link) setPage(n.link); setShowNotifications(false) }`;
const newNotifClick = `if (n.type === 'REPORT_REVIEW') openReview(n.reportId, n.sampleRequestId); else if (n.type === 'APPROVAL_REVIEW') { setActiveSampleRequestId(n.sampleRequestId); setPage('approval-review'); } else if (n.link) setPage(n.link); setShowNotifications(false) }`;
appJsx = appJsx.replace(oldNotifClick, newNotifClick);

// 3. Update Action table row for Manager Pending Approval
const oldActionButtons = `req.data.status === 'Pending Approval' && currentUser?.role?.toLowerCase() === 'manager' && <><button type="button" onClick={() => handleApprove(req.id)}>Approve</button> <button type="button" onClick={() => handleReject(req.id)} style={{color:'#a13028'}}>Reject</button></>`;
const newActionButtons = `req.data.status === 'Pending Approval' && currentUser?.role?.toLowerCase() === 'manager' && <button type="button" onClick={() => { setActiveSampleRequestId(req.id); setPage('approval-review'); }} style={{ fontSize: '12px', padding: '4px 8px', background: '#0a639f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Review Request</button>`;
appJsx = appJsx.replace(oldActionButtons, newActionButtons);

// 4. Add approval-review page routing
const approvalReviewRoute = `
  if (page === 'approval-review') {
    const request = sampleRequests.find(r => r.id === activeSampleRequestId)
    if (!request) return <main className="app-shell reports-page"><Navbar /><section className="reports-panel"><div style={{padding: '24px'}}>Request not found. <button className="validate-button" onClick={() => setPage('workflow')}>Back</button></div></section></main>
    return (
      <main className="app-shell reports-page">
        <Navbar />
        <section className="reports-panel">
          <ApprovalReviewScreen 
            request={request} 
            onApprove={async (id, comment) => {
              try {
                const updated = await api.approveSampleRequest(id, comment)
                setSampleRequests(current => current.map(r => r.id === id ? updated : r))
                setPage('workflow')
              } catch (e) {
                setAppError(e.message)
              }
            }}
            onReject={async (id, comment) => {
              try {
                const updated = await api.rejectSampleRequest(id, comment)
                setSampleRequests(current => current.map(r => r.id === id ? updated : r))
                setPage('workflow')
              } catch (e) {
                setAppError(e.message)
              }
            }}
            onCancel={() => setPage('workflow')}
          />
        </section>
      </main>
    )
  }

  if (page === 'workflow') {`;
appJsx = appJsx.replace("  if (page === 'workflow') {", approvalReviewRoute);

fs.writeFileSync('src/App.jsx', appJsx);
console.log('App.jsx successfully updated.');
