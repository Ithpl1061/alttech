import { useEffect, useMemo, useState } from 'react'
import { Bell, GitMerge, FileText, LayoutTemplate, LogOut, ChevronDown, Activity, Menu, X, CheckCircle2, XCircle, Package } from 'lucide-react'
import { io } from 'socket.io-client'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import './App.css'
import { api } from './api.js'
import signatureStamp from './assets/21aec37710d94a55a24d470aa9cb64cb_gemini-3.1-flash-image-preview.jpg'
import alltechLogo from './assets/Alltech Logo.avif'
import alltechLogoImg from './assets/Alltech-Logo.avif'


const reportFields = [
  ['name', 'Name', 'text'], ['address', 'Address', 'text'], ['reportNo', 'Report No.', 'text'],
  ['sampleReceiptDate', 'Sample Receipt Date', 'date'], ['sampleNameNo', 'Sample Name/No.', 'text'],
  ['reportDate', 'Report Date', 'date'], ['samplePacking', 'Sample Packing', 'text'],
]

function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

function validate(report) {
  const errors = {}
  reportFields.forEach(([key, label]) => { if (!report[key]?.trim()) errors[key] = `${label} is required.` })
  if (!report.tests.length) errors.tests = 'Add at least one test row.'
  report.tests.forEach((test, index) => {
    ;['parameter', 'method', 'result', 'unit', 'remark'].forEach((key) => {
      if (!test[key]?.trim()) errors[`test-${index}-${key}`] = 'Required'
    })
  })
  return errors
}

function Field({ label, type, value, error, onChange }) {
  return <label className="form-field">
    <span>{label} <b aria-hidden="true">*</b></span>
    <input type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} />
    {error && <small role="alert">{error}</small>}
  </label>
}

function ReportPreview({ report }) {
  const rows = report.tests.length ? report.tests : []
  const pageStyle = useMemo(() => ({ '--row-count': Math.max(rows.length, 1) }), [rows.length])

  return <article className="report-page" style={pageStyle} aria-label="Laboratory test report preview">
    <div className="pdf-header">
      <div className="alltech-mark" aria-label="Alltech Foundation"><span className="alltech-a">A</span><strong>lltech</strong><span className="foundation-word">FOUNDATION</span></div>
      <div className="services-title">Laboratory Services</div><div className="amber-rule" />
    </div>
    <section className="report-heading"><h1>TEST REPORT</h1><div className="heading-rule" /></section>
    <section className="client-details"><p><b>Name:</b> {report.name || ' '}</p><p className="address">{report.address || ' '}</p></section>
    <section className="sample-details" aria-label="Report details">
      <div className="detail-cell detail-label">Report no <span>:</span></div><div className="detail-cell">{report.reportNo || ' '}</div>
      <div className="detail-cell detail-label">Sample receipt date <span>:</span></div><div className="detail-cell">{formatDate(report.sampleReceiptDate)}</div>
      <div className="detail-cell detail-label">Sample Name and No:</div><div className="detail-cell">{report.sampleNameNo || ' '}</div>
      <div className="detail-cell detail-label">Report date <span>:</span></div><div className="detail-cell">{formatDate(report.reportDate)}</div>
      <div className="detail-cell detail-label">Sample packing <span>:</span></div><div className="detail-cell">{report.samplePacking || ' '}</div>
      <div className="detail-cell blank" /><div className="detail-cell blank" />
    </section>
    <section className="results-table" aria-label="Test results">
      <div className="result-head"><span>Parameter</span><span>Method</span><span>Result</span><span>Unit</span><span>Remark</span></div>
      {rows.map((row, index) => <div className="result-row" key={index}><span>{row.parameter}</span><span>{row.method}</span><span>{row.result}</span><span>{row.unit}</span><span>{row.remark}</span></div>)}
    </section>
    <div className="report-lower-content">
      <div className="signatory">
        <span>Authorised Signatory,</span>
        <svg className="signatory-stamp" viewBox="0 0 88 88" aria-label="Alltech Foundation Pune stamp" role="img">
          <defs><path id="stamp-top-curve" d="M 13 44 A 31 31 0 0 1 75 44" /></defs>
          <circle cx="44" cy="44" r="35" /><circle cx="44" cy="44" r="25" />
          <text className="stamp-top"><textPath href="#stamp-top-curve" startOffset="50%" textAnchor="middle">ALLTECH FOUNDATION</textPath></text>
          <text className="stamp-bottom" x="44" y="67" textAnchor="middle">PUNE 410501</text>
          <path className="stamp-wave" d="M27 44c6-4 10 4 16 0s10 4 17 0" />
        </svg>
      </div>
      <div className="disclaimer">
        <p>This report is issued solely for the tested sample(s) and does not imply certification or endorsement of an entire product. The laboratory holds no legal and/or incidental responsibility for</p>
        <p>the application or interpretation of the results. Results of tests are based on parameters applied and may vary at different laboratories.</p>
        <p>Alltech Foundation and its related entities, including its personnel make no warranties, express or implied, with respect to this report and assume no liability or responsibility for any</p>
        <p>loss, claim or damage that may occur as a result of presuming the meaning or context of the report, or the use of report in any activities, or any conduct.</p>
      </div>
    </div>
    <footer className="pdf-footer"><div className="footer-rule" />
      <p>Registered Office : <b>Alltech Foundation</b> | PAP-S-65 | Village – Savardari | MIDC – Phase-II</p>
      <p>Chakan Industrial Area | Taluka: Khed | Dist. Pune - 410501, Maharashtra | India | Tel: +91-2135-631666</p>
      <p>Regd. No. E-9281/Pune</p><span className="page-number">1</span>
    </footer>
  </article>
}

void ReportPreview

function FigmaReportPreview({ report }) {
  const rows = report.tests.length ? report.tests : []
  const pageStyle = useMemo(() => ({ '--row-count': Math.max(rows.length, 1) }), [rows.length])

  return <article className="figma-report" style={pageStyle} aria-label="Laboratory test report preview">
    <header className="figma-header">
      <div className="figma-logo" aria-label="Alltech Foundation">
        <img src={alltechLogoImg} alt="Alltech logo" className="figma-logo-img" style={{ height: '200px', width: 'auto', marginRight: '6px', transform: 'translateX(2px)', mixBlendMode: 'multiply' }} />
        <span className="figma-foundation">FOUNDATION</span>
      </div>
      <div className="figma-services">Laboratory Services</div>
    </header>
    <div className="figma-orange-divider" />
    <div className="figma-title">TEST REPORT</div>
    <section className="figma-client"><p>Name: {report.name || ' '}</p><p>{report.address || ' '}</p></section>
    <div className="figma-section-rule" />
    <section className="figma-info" aria-label="Report details">
      <div><p><span>Report no</span><b>:</b>{report.reportNo || ' '}</p><p><span>Sample Name and No:</span><b>:</b>{report.sampleNameNo || ' '}</p><p><span>Sample packing</span><b>:</b>{report.samplePacking || ' '}</p></div>
      <div><p><span>Sample receipt date:</span><b>:</b>{formatDate(report.sampleReceiptDate)}</p><p><span>Report date</span><b>:</b>{formatDate(report.reportDate)}</p></div>
    </section>
    <section className="figma-results" aria-label="Test results">
      <div className="figma-results-head"><span>Parameter</span><span>Method</span><span>Result</span><span>Unit</span><span>Remark</span></div>
      {rows.map((row, index) => <div className="figma-results-row" key={index}><span>{row.parameter}</span><span>{row.method}</span><span>{row.result}</span><span>{row.unit}</span><span>{row.remark}</span></div>)}
    </section>
    <div className="figma-section-rule figma-after-results" />
    <section className="figma-signatory"><p>Authorised Signatory,</p><span className="figma-stamp-crop"><img src={signatureStamp} alt="Alltech Foundation Pune stamp" /></span></section>
    <section className="figma-disclaimer"><p>This report is issued solely for the tested sample(s) and does not imply certification or endorsement of an entire product. The laboratory holds no legal and/or incidental responsibility for the application or interpretation of the results. Results of tests are based on parameters applied and may vary at different laboratories.<br />Alltech Foundation and its related entities, including its personnel make no warranties, express or implied, with respect to this report and assume no liability or responsibility for any loss, claim or damage that may occur as a result of presuming the meaning or context of the report, or the use of report in any activities, or any conduct.</p></section>
    <footer className="figma-footer"><p>Registered Office : <b>Alltech Foundation</b> | PAP-S-65 | Village – Savardari | MIDC – Phase-II<br />Chakan Industrial Area | Taluka: Khed | Dist. Pune-410501, Maharashtra | India | Tel: +91-2135-631666<br />Regd. No. E-9281/Pune</p><span>1</span></footer>
  </article>
}

function copyReport(report) {
  return { ...report, tests: report.tests.map((test) => ({ ...test })) }
}

function createBlankReport() {
  return {
    name: '', address: '', reportNo: '', sampleReceiptDate: '', sampleNameNo: '', reportDate: '', samplePacking: '',
    tests: [{ parameter: '', method: '', result: '', unit: '', remark: '' }],
  }
}

function createBlankSampleRequest() {
    return {
      sampleName: '', sampleNo: '', customerName: '', sentBy: '', approvedBy: '',
      analysisRequired: '', location: '', sampleRequestDate: new Date().toISOString().split('T')[0], reportDate: '', remark: ''
    }
}

function validateSampleRequest(req) {
    const errors = {}
    ;['sampleName', 'sampleNo', 'customerName', 'sentBy', 'analysisRequired', 'location', 'sampleRequestDate', 'reportDate'].forEach((key) => {
    if (!req[key]?.trim()) errors[key] = 'Required.'
  })
  return errors
}

function HomeBrand({ onClick }) {
  return <div className="home-brand" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} style={{ cursor: onClick ? 'pointer' : 'default' }}><img src={alltechLogo} alt="Alltech Foundation" /></div>
}

function AuthPasswordField({ id, label, value, error, onChange }) {
  const [visible, setVisible] = useState(false)
  return <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    <div className="auth-password-wrap">
      <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} aria-invalid={Boolean(error)} autoComplete={id === 'login-password' ? 'current-password' : 'new-password'} />
      <button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>{visible ? 'Hide' : 'Show'}</button>
    </div>
    {error && <small role="alert">{error}</small>}
  </div>
}

function ApprovalReviewScreen({ request, onApprove, onReject, onCancel }) {
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
          <div className="form-field">
            <label>Sample No.</label>
            <input type="text" className="premium-input" value={request.data.sampleNo || request.data.sampleIdNo || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Sample Name</label>
            <input type="text" className="premium-input" value={request.data.sampleName || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Customer Name</label>
            <input type="text" className="premium-input" value={request.data.customerName || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Sent By</label>
            <input type="text" className="premium-input" value={request.data.sentBy || ''} readOnly />
          </div>
          {request.data.approvedBy && (
            <div className="form-field">
              <label>Approved By</label>
              <input type="text" className="premium-input" value={request.data.approvedBy} readOnly />
            </div>
          )}
          <div className="form-field">
            <label>Analysis Required</label>
            <input type="text" className="premium-input" value={(request.data.analysisRequired || []).join(', ')} readOnly />
          </div>
          <div className="form-field">
            <label>Location</label>
            <input type="text" className="premium-input" value={request.data.location || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Sample Request Date</label>
            <input type="text" className="premium-input" value={request.data.sampleRequestDate ? new Date(request.data.sampleRequestDate).toLocaleDateString('en-GB') : ''} readOnly />
          </div>
          <div className="form-field">
            <label>Report Date</label>
            <input type="text" className="premium-input" value={request.data.reportDate ? new Date(request.data.reportDate).toLocaleDateString('en-GB') : ''} readOnly />
          </div>
        </div>
        
        {request.data.remark && (
          <div className="form-field" style={{ marginTop: '16px' }}>
            <label>Remark</label>
            <textarea className="premium-input" value={request.data.remark} readOnly rows={3}></textarea>
          </div>
        )}

        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <h3>Approval Decision</h3>
          <div className="form-field" style={{ marginTop: '12px' }}>
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="validate-button" onClick={handleApprove}>Approve</button>
            <button type="button" className="validate-button" style={{ background: '#dc3545', color: 'white', border: 'none' }} onClick={handleReject}>Reject</button>
            <button type="button" onClick={onCancel} style={{ padding: '0 20px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthPage({ mode, onSwitch, onLogin, onSignup }) {
  const isLogin = mode === 'login'
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '', remember: false })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const changeValue = (key, value) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })) }
  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isLogin && !values.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!values.email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Password is required.'
    if (!isLogin && !values.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.'
    else if (!isLogin && values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setIsSubmitting(true)
    const submitRequest = isLogin ? onLogin : onSignup
    submitRequest(values).then(() => { if (!isLogin) onSwitch('login') }).catch((error) => {
      setErrors(error.errors && Object.keys(error.errors).length ? error.errors : { form: error.message })
    }).finally(() => setIsSubmitting(false))
  }

  return <main className="app-shell auth-page">
    <section className="auth-card" aria-labelledby="auth-title">
      <aside className="auth-branding">
        <HomeBrand />
        <p className="eyebrow">ALLTECH FOUNDATION</p>
        <h1>Laboratory Test Report System</h1>
        <p>Secure access for the internal laboratory reporting application.</p>
      </aside>
      <section className="auth-form-panel">
        <p className="eyebrow">{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</p>
        <h2 id="auth-title">{isLogin ? 'Sign in to your account' : 'Create your account'}</h2>
        <p className="auth-intro">{isLogin ? 'Enter your details to access laboratory reports.' : 'Set up your access to the laboratory report system.'}</p>
        {errors.form && <p className="auth-form-error" role="alert">{errors.form}</p>}
        <form className="auth-form" onSubmit={submit} noValidate>
          {!isLogin && <div className="auth-field"><label htmlFor="full-name">Full Name</label><input id="full-name" type="text" value={values.fullName} onChange={(event) => changeValue('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} autoComplete="name" />{errors.fullName && <small role="alert">{errors.fullName}</small>}</div>}
          <div className="auth-field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" value={values.email} onChange={(event) => changeValue('email', event.target.value)} aria-invalid={Boolean(errors.email)} autoComplete="email" />{errors.email && <small role="alert">{errors.email}</small>}</div>
          <AuthPasswordField id={isLogin ? 'login-password' : 'signup-password'} label="Password" value={values.password} error={errors.password} onChange={(event) => changeValue('password', event.target.value)} />
          {!isLogin && <AuthPasswordField id="confirm-password" label="Confirm Password" value={values.confirmPassword} error={errors.confirmPassword} onChange={(event) => changeValue('confirmPassword', event.target.value)} />}
          {isLogin && <div className="auth-options"><label className="remember-option"><input type="checkbox" checked={values.remember} onChange={(event) => changeValue('remember', event.target.checked)} /> <span>Remember me</span></label><button type="button" className="auth-text-button">Forgot Password?</button></div>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Login' : 'Create Account')}</button>
        </form>
        <p className="auth-switch">{isLogin ? <>New to the system? <button type="button" onClick={() => onSwitch('signup')}>Create Account</button></> : <>Already have an account? <button type="button" onClick={() => onSwitch('login')}>Login</button></>}</p>
      </section>
    </section>
  </main>
}


const templateTestFields = ['parameter', 'method', 'unit', 'remark']

function validateTemplateUI(template) {
  const errors = {}
  if (!template.name?.trim()) errors.name = 'Template Name is required.'
  if (!template.tests.length) errors.tests = 'Add at least one test row.'
  template.tests.forEach((test, index) => {
    ;['parameter', 'method', 'unit'].forEach((key) => {
      if (!test[key]?.trim()) errors[`test-${index}-${key}`] = 'Required'
    })
  })
  return errors
}

function copyTemplate(template) {
  return { ...template, tests: template.tests.map((test) => ({ ...test })) }
}

function createBlankTemplate() {
  return {
    name: '',
    tests: [{ parameter: '', method: '', unit: '', remark: '' }],
  }
}

function DateFilterToolbar({ filter, setFilter, onApply, onClear }) {
  const presets = [
    { label: '1 Month', months: 1 },
    { label: '3 Months', months: 3 },
    { label: '6 Months', months: 6 },
    { label: '1 Year', months: 12 }
  ];

  const handlePreset = (months) => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    
    const formatDate = d => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFilter({
      preset: `${months}m`,
      from: formatDate(from),
      to: formatDate(to)
    });
  };

  const handleCustomDate = (key, value) => {
    setFilter(prev => ({ ...prev, preset: 'custom', [key]: value }));
  };

  return (
    <div className="date-filter-toolbar">
      <div className="date-filter-presets">
        {presets.map(p => (
          <button 
            key={p.label}
            type="button" 
            className={`date-preset-btn ${filter.preset === `${p.months}m` ? 'active' : ''}`}
            onClick={() => handlePreset(p.months)}
          >
            {p.label}
          </button>
        ))}
        <button 
          type="button"
          className={`date-preset-btn ${filter.preset === 'custom' ? 'active' : ''}`}
          onClick={() => setFilter(prev => ({ ...prev, preset: 'custom' }))}
        >
          Custom Range
        </button>
      </div>

      <div className="date-filter-inputs">
        <label>
          <span>From:</span>
          <input 
            type="date" 
            value={filter.from} 
            onChange={(e) => handleCustomDate('from', e.target.value)} 
            disabled={filter.preset !== 'custom'}
          />
        </label>
        <label>
          <span>To:</span>
          <input 
            type="date" 
            value={filter.to} 
            onChange={(e) => handleCustomDate('to', e.target.value)} 
            disabled={filter.preset !== 'custom'}
          />
        </label>
        <button className="validate-button date-apply-btn" type="button" onClick={onApply}>Apply Filter</button>
        {(filter.from || filter.to || filter.preset) && <button className="back-button date-clear-btn" type="button" onClick={onClear}>Clear</button>}
      </div>
    </div>
  );
}


function getRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(title) {
  if (title.includes('Approved')) return <CheckCircle2 size={16} className="notif-icon-success" />;
  if (title.includes('Rejected')) return <XCircle size={16} className="notif-icon-error" />;
  if (title.includes('Received')) return <Package size={16} className="notif-icon-info" />;
  if (title.includes('Review')) return <FileText size={16} className="notif-icon-primary" />;
  return <Bell size={16} className="notif-icon-default" />;
}

function App() {
  const [reports, setReports] = useState([])
  const [report, setReport] = useState(createBlankReport)
  const [errors, setErrors] = useState({})
  const [validated, setValidated] = useState(false)
  const [page, setPage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '')
    return path && ['list', 'templates', 'workflow', 'form', 'preview', 'review', 'workflow-form', 'template-form'].includes(path) ? path : 'login'
  })
  const [previewReady, setPreviewReady] = useState(false)
  const [activeReportId, setActiveReportId] = useState(() => {
    return new URLSearchParams(window.location.search).get('reportId') || null
  })
  const [activeSampleRequestId, setActiveSampleRequestId] = useState(() => {
    return new URLSearchParams(window.location.search).get('reqId') || null
  })
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [appLoading, setAppLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [templates, setTemplates] = useState([])
  const [template, setTemplate] = useState(createBlankTemplate)
  const [activeTemplateId, setActiveTemplateId] = useState(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [sampleRequests, setSampleRequests] = useState([])
  const [sampleRequest, setSampleRequest] = useState(createBlankSampleRequest)
  const [currentUser, setCurrentUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [photoViewerUrl, setPhotoViewerUrl] = useState(null)
  const [dateFilter, setDateFilter] = useState({ preset: '', from: '', to: '' })
  const [toastNotif, setToastNotif] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locError, setLocError] = useState('')

  const [appError, setAppError] = useState('')

  const applyDateFilter = async () => {
    setReportsLoading(true)
    setAppError('')
    try {
      if (page === 'list') {
        setReports(await api.listReports({ force: true, from: dateFilter.from, to: dateFilter.to }))
      } else if (page === 'workflow') {
        setSampleRequests(await api.listSampleRequests({ force: true, from: dateFilter.from, to: dateFilter.to }))
      } else {
        setReports(await api.listReports({ force: true, from: dateFilter.from, to: dateFilter.to }))
        setSampleRequests(await api.listSampleRequests({ force: true, from: dateFilter.from, to: dateFilter.to }))
      }
    } catch (error) {
      setAppError(error.message)
    } finally {
      setReportsLoading(false)
    }
  }

  const clearDateFilter = async () => {
    setDateFilter({ preset: '', from: '', to: '' })
    setReportsLoading(true)
    setAppError('')
    try {
      if (page === 'list') {
        setReports(await api.listReports({ force: true }))
      } else if (page === 'workflow') {
        setSampleRequests(await api.listSampleRequests({ force: true }))
      } else {
        setReports(await api.listReports({ force: true }))
        setSampleRequests(await api.listSampleRequests({ force: true }))
      }
    } catch (error) {
      setAppError(error.message)
    } finally {
      setReportsLoading(false)
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '')
      if (path && ['login', 'list', 'templates', 'workflow', 'form', 'preview', 'review', 'workflow-form', 'template-form'].includes(path)) {
        setPage(path)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!appLoading) {
      let expectedUrl = '/' + page
      if (page === 'review' && activeReportId && activeSampleRequestId) {
        expectedUrl += `?reportId=${activeReportId}&reqId=${activeSampleRequestId}`
      }
      if (window.location.pathname + window.location.search !== expectedUrl) {
        window.history.pushState({}, '', expectedUrl)
      }
    }
  }, [page, appLoading, activeReportId, activeSampleRequestId])

  useEffect(() => {
    let active = true
    api.me().then(async (user) => {
      if (!active) return
      setCurrentUser(user)
      
      const currentPath = window.location.pathname.replace(/^\//, '')
      let nextPage = currentPath === 'login' || currentPath === 'signup' ? 'list' : currentPath
      
      if (nextPage === 'review') {
        const params = new URLSearchParams(window.location.search)
        const rId = params.get('reportId')
        const sId = params.get('reqId')
        if (rId && sId) {
          try {
            const complete = await api.getReport(rId, { force: true })
            if (active) {
              setReport(complete.data)
              setActiveReportId(complete.id)
              setActiveSampleRequestId(sId)
              setPreviewReady(true)
            }
          } catch(e) {
            if (active) nextPage = 'workflow'
          }
        } else {
          nextPage = 'workflow'
        }
      }
      if (active) {
        const pg = nextPage || 'list'
        setPage(pg)
        try {
          setNotifications(await api.getNotifications())
          if (pg === 'list') {
            setReports(await api.listReports())
          } else if (pg === 'workflow') {
            setSampleRequests(await api.listSampleRequests())
          } else {
            setReports(await api.listReports())
            setSampleRequests(await api.listSampleRequests())
          }
        } catch (e) { console.error('Failed to load initial data:', e) }
      }
    }).catch(() => {
      if (active) setPage('login')
    }).finally(() => {
      if (active) setAppLoading(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!currentUser) return
    let active = true
    const loadPageData = async () => {
      try {
        if (page === 'list') {
          const data = await api.listReports({ force: true, from: dateFilter.from, to: dateFilter.to })
          if (active) setReports(data)
        } else if (page === 'workflow') {
          const data = await api.listSampleRequests({ force: true, from: dateFilter.from, to: dateFilter.to })
          if (active) setSampleRequests(data)
        } else if (['templates', 'form'].includes(page)) {
          const data = await api.listTemplates({ force: true })
          if (active) setTemplates(data)
        }
      } catch (err) {
        console.error('Failed to load page data:', err)
      }
    }
    loadPageData()
    return () => { active = false }
  }, [page, currentUser])

  useEffect(() => {
    if (!currentUser) return
    const userId = currentUser._id || currentUser.id
    if (!userId) return

    const getSocketUrl = () => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/api$/, '')
      }
      return window.location.origin.includes(':5173')
        ? `http://${window.location.hostname}:5000`
        : window.location.origin
    }

    const socket = io(getSocketUrl(), {
      auth: { userId },
      query: { userId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      socket.emit('register', { userId })
    })

    socket.on('new_notification', (newNotif) => {
      if (!newNotif) return
      const notifId = newNotif._id || newNotif.id

      setNotifications((prev) => {
        if (prev.some((n) => (n._id || n.id) === notifId)) return prev
        return [newNotif, ...prev]
      })

      setToastNotif(newNotif)
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUser])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setLocError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const address = await api.reverseGeocode(latitude, longitude)
          if (address) {
            setSampleRequest((c) => ({ ...c, location: address }))
            setErrors((c) => ({ ...c, location: undefined }))
          } else {
            setLocError('Could not retrieve address for your location. Please enter manually.')
          }
        } catch (err) {
          setLocError(err.message || 'Reverse geocoding failed. Please enter location manually.')
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocError('Location permission denied. Please allow location access or enter manually.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocError('Location information is unavailable. Please enter location manually.')
            break
          case error.TIMEOUT:
            setLocError('Location request timed out. Please try again or enter location manually.')
            break
          default:
            setLocError('Unable to detect location. Please enter location manually.')
            break
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const changeField = (key, value) => { setReport((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); setValidated(false); setPreviewReady(false) }
  const changeTest = (index, key, value) => {
    setReport((current) => ({ ...current, tests: current.tests.map((test, rowIndex) => rowIndex === index ? { ...test, [key]: value } : test) }))
    setErrors((current) => ({ ...current, [`test-${index}-${key}`]: undefined, tests: undefined })); setValidated(false); setPreviewReady(false)
  }
  const addRow = () => { setReport((current) => ({ ...current, tests: [...current.tests, { parameter: '', method: '', result: '', unit: '', remark: '' }] })); setValidated(false); setPreviewReady(false) }
  const removeRow = (index) => { setReport((current) => ({ ...current, tests: current.tests.filter((_, rowIndex) => rowIndex !== index) })); setValidated(false); setPreviewReady(false) }
  const handleEnterResults = async (req) => {
    if (req.data?.linkedReportId || req.linkedReportId) {
      try {
        const complete = await api.getReport(req.data?.linkedReportId || req.linkedReportId, { force: true });
        setReport({ ...copyReport(complete.data), sampleRequestId: req.id });
        setActiveReportId(complete.id);
        setErrors({}); setValidated(false); setPreviewReady(true); setPage('form');
        return;
      } catch (e) {}
    }
    setReport({
      ...createBlankReport(),
      sampleRequestId: req.id,
      name: req.data?.customerName || '',
      address: req.data?.customerAddress || '',
      sampleNameNo: req.data?.sampleNo || req.data?.sampleIdNo || '',
      sampleReceiptDate: new Date(req.createdAt || req.data?.createdAt || Date.now()).toISOString().split('T')[0],
      tests: (req.data?.analysisRequired || []).map(param => ({ parameter: param, method: '', result: '', unit: '', remark: '' }))
    });
    setActiveReportId(null); setErrors({}); setAppError(''); setValidated(false); setPreviewReady(false); setPage('form')
  }
  const openEdit = async (savedReport) => { try { const complete = await api.getReport(savedReport.id, { force: true }); setReport(copyReport(complete.data)); setActiveReportId(complete.id); setErrors({}); setValidated(false); setPreviewReady(true); setPage('form') } catch (error) { setAppError(error.message) } }
  const openPreview = async (savedReport) => { try { const complete = await api.getReport(savedReport.id, { force: true }); setReport(copyReport(complete.data)); setActiveReportId(complete.id); setErrors({}); setValidated(true); setPreviewReady(true); setPage('preview') } catch (error) { setAppError(error.message) } }
  const onValidate = async (event) => {
    event.preventDefault()
    const nextErrors = validate(report)
    const isValid = Object.keys(nextErrors).length === 0
    setErrors(nextErrors)
    setValidated(isValid)
    if (!isValid) return
    try {
      const saved = activeReportId ? await api.updateReport(activeReportId, report) : await api.createReport(report)
      const sampleReqId = report.sampleRequestId || saved.data?.sampleRequestId
      setReport({ ...copyReport(saved.data), sampleRequestId: sampleReqId }); 
      setActiveReportId(saved.id); 
      setReports((current) => activeReportId ? current.map((savedReport) => savedReport.id === activeReportId ? saved : savedReport) : [saved, ...current]); 
      if (sampleReqId) {
        const updatedRequests = await api.listSampleRequests({ force: true })
        setSampleRequests(updatedRequests)
      }
      setPreviewReady(true)
    } catch (error) {
      const serverErrors = Object.fromEntries(Object.entries(error.errors ?? {}).map(([key, message]) => [key.replace(/^tests\.(\d+)\.(.+)$/, 'test-$1-$2'), message]))
      setErrors(Object.keys(serverErrors).length ? serverErrors : { form: error.message }); setValidated(false)
    }
  }

  const downloadPdf = async () => { if (!activeReportId) return; setPdfLoading(true); setAppError(''); try { const { blob, filename } = await api.downloadPdf(activeReportId); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) } catch (error) { setAppError(error.message) } finally { setPdfLoading(false) } }

  const changeTemplateField = (key, value) => { setTemplate((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); }
  const changeTemplateTest = (index, key, value) => {
    setTemplate((current) => ({ ...current, tests: current.tests.map((test, rowIndex) => rowIndex === index ? { ...test, [key]: value } : test) }))
    setErrors((current) => ({ ...current, [`test-${index}-${key}`]: undefined, tests: undefined }));
  }
  const addTemplateRow = () => { setTemplate((current) => ({ ...current, tests: [...current.tests, { parameter: '', method: '', unit: '', remark: '' }] })); }
  const removeTemplateRow = (index) => { setTemplate((current) => ({ ...current, tests: current.tests.filter((_, rowIndex) => rowIndex !== index) })); }
  const openNewTemplate = () => { setTemplate(createBlankTemplate()); setActiveTemplateId(null); setErrors({}); setAppError(''); setPage('template-form') }
  const openEditTemplate = async (saved) => { try { const complete = await api.getTemplate(saved.id, { force: true }); setTemplate(copyTemplate(complete.data)); setActiveTemplateId(complete.id); setErrors({}); setPage('template-form') } catch (error) { setAppError(error.message) } }
  const deleteTemplate = async (id) => { if (!window.confirm('Delete this template?')) return; try { await api.deleteTemplate(id); setTemplates(await api.listTemplates({ force: true })) } catch (error) { setAppError(error.message) } }
  const onSaveTemplate = async (event) => {
    event.preventDefault()
    const nextErrors = validateTemplateUI(template)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const saved = activeTemplateId ? await api.updateTemplate(activeTemplateId, template) : await api.createTemplate(template)
      setTemplate(copyTemplate(saved.data)); setActiveTemplateId(saved.id); 
      setTemplates((current) => activeTemplateId ? current.map((t) => t.id === activeTemplateId ? saved : t) : [saved, ...current]);
      setPage('templates')
    } catch (error) {
      const serverErrors = Object.fromEntries(Object.entries(error.errors ?? {}).map(([key, message]) => [key.replace(/^tests\.(\d+)\.(.+)$/, 'test-$1-$2'), message]))
      setErrors(Object.keys(serverErrors).length ? serverErrors : { form: error.message });
    }
  }
  const applyTemplate = async (templateId) => {
    if (!templateId) return;
    let selected = templates.find(t => t.id === templateId);
    if (!selected) {
      try {
        selected = await api.getTemplate(templateId, { force: true });
      } catch (e) {
        console.error('Failed to fetch template:', e);
        return;
      }
    }
    if (!selected || !selected.data || !selected.data.tests) return;

    const templateTests = selected.data.tests;
    const isAllBlank = report.tests.length === 0 || (report.tests.length === 1 && Object.values(report.tests[0]).every(v => v === ''));

    if (isAllBlank) {
      const newTests = templateTests.map(t => ({
        parameter: t.parameter || '',
        method: t.method || '',
        unit: t.unit || '',
        remark: t.remark || '',
        result: ''
      }));
      setReport(current => ({ ...current, tests: newTests }));
    } else {
      const existingTests = [...report.tests];
      const templateParamsUsed = new Set();

      const updatedTests = existingTests.map(test => {
        const tParam = (test.parameter || '').trim().toLowerCase();
        const tMatch = templateTests.find(t => (t.parameter || '').trim().toLowerCase() === tParam);
        if (tMatch) {
          templateParamsUsed.add((tMatch.parameter || '').trim().toLowerCase());
          return {
            ...test,
            method: test.method || tMatch.method || '',
            unit: test.unit || tMatch.unit || '',
            remark: test.remark || tMatch.remark || ''
          };
        }
        return test;
      });

      templateTests.forEach(t => {
        const pName = (t.parameter || '').trim().toLowerCase();
        if (!templateParamsUsed.has(pName)) {
          const emptyIdx = updatedTests.findIndex(row => !(row.parameter || '').trim());
          const newRow = {
            parameter: t.parameter || '',
            method: t.method || '',
            unit: t.unit || '',
            remark: t.remark || '',
            result: ''
          };
          if (emptyIdx !== -1) {
            updatedTests[emptyIdx] = newRow;
          } else {
            updatedTests.push(newRow);
          }
        }
      });

      setReport(current => ({ ...current, tests: updatedTests }));
    }

    setValidated(false);
    setPreviewReady(false);
  }
  const handleApprove = async (id) => {
    const remarks = window.prompt('Enter approval remarks (optional):')
    if (remarks === null) return
    try {
      const updated = await api.approveSampleRequest(id, remarks)
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }
  const handleReject = async (id) => {
    const remarks = window.prompt('Enter rejection remarks (optional):')
    if (remarks === null) return
    try {
      const updated = await api.rejectSampleRequest(id, remarks)
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }
  const handleReceive = async (id, file) => {
    try {
      const updated = await api.receiveSampleRequest(id, file)
      setSampleRequests((current) => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }
  const handleMarkExcelLogged = async (id) => {
    try {
      const updated = await api.markExcelLogged(id)
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
  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this sample request?')) {
      try {
        await api.deleteSampleRequest(id)
        setSampleRequests(current => current.filter(r => r.id !== id))
      } catch (error) {
        setAppError(error.message)
      }
    }
  }
  const openReview = async (reportId, sampleRequestId) => {
    if (!reportId) return;
    setAppError('');
    try {
      const complete = await api.getReport(reportId, { force: true });
      setReport(copyReport(complete.data));
      setActiveReportId(complete.id);
      setActiveSampleRequestId(sampleRequestId || null);
      setErrors({});
      setValidated(true);
      setPreviewReady(true);
      setPage('review');
    } catch (error) {
      setAppError(error.message);
    }
  }
  const handleMarkReviewed = async () => {
    if (!activeSampleRequestId) {
      setAppError('Session lost. Please return to the workflow list and try again.')
      return
    }
    try {
      const updated = await api.markSampleRequestReviewed(activeSampleRequestId, reviewRemarks)
      setSampleRequests(current => current.map(r => r.id === activeSampleRequestId ? updated : r))
      setPage('workflow')
      setReviewRemarks('')
    } catch (error) {
      setAppError(error.message)
    }
  }
  const handleFinalize = async (id) => {
    try {
      const updated = await api.finalizeSampleRequest(id)
      setSampleRequests(current => current.map(r => r.id === id ? updated : r))
    } catch (error) {
      setAppError(error.message)
    }
  }
  const handleLogin = async (values) => {
    const user = await api.login(values)
    setCurrentUser(user)
    try {
      setNotifications(await api.getNotifications())
      setReports(await api.listReports())
      setSampleRequests(await api.listSampleRequests())
    } catch(e) { console.error(e) }
    setPage('list')
  }

  const handleSignup = async (values) => {
    await api.signup(values)
  }

  const logout = async () => { await api.logout().catch(() => {}); api.clearCache(); setErrors({}); setValidated(false); setPreviewReady(false); setActiveReportId(null); setActiveSampleRequestId(null); setCurrentUser(null); setNotifications([]); setPage('login') }

  if (appLoading) return <main className="app-shell auth-page"><p className="app-loading" role="status">Loading laboratory application…</p></main>
  if (page === 'login' || page === 'signup') return <AuthPage key={page} mode={page} onSwitch={setPage} onLogin={handleLogin} onSignup={handleSignup} />

  const NavButton = ({ icon, label, variant = 'default', onClick, active }) => {
    const isDanger = variant === 'danger';
    return (
      <button 
        type="button"
        onClick={onClick}
        className={`premium-nav-btn ${isDanger ? 'premium-nav-btn-danger' : 'premium-nav-btn-default'} ${active ? 'active' : ''}`}
      >
        <div className="premium-nav-btn-glow"></div>
        <span className="premium-nav-btn-icon">{icon}</span>
        {label}
      </button>
    );
  }

  const handleNotificationItemClick = async (n) => {
    if (!n) return
    const id = n._id || n.id
    try {
      if (!n.read && id) await api.markNotificationRead(id)
      setNotifications(await api.getNotifications())
    } catch (e) {
      console.error(e)
    }

    const targetReqId = (n.sampleRequestId?._id || n.sampleRequestId || '').toString()

    try {
      const freshRequests = await api.listSampleRequests({ force: true })
      setSampleRequests(freshRequests)
    } catch (e) {
      console.error(e)
    }

    if (n.type === 'REPORT_REVIEW') {
      openReview(n.reportId, targetReqId)
    } else if (n.type === 'APPROVAL_REVIEW') {
      setActiveSampleRequestId(targetReqId)
      setPage('approval-review')
    } else if (n.link) {
      setPage(n.link)
    }
    setShowNotifications(false)
    setToastNotif(null)
  }

  const Navbar = () => (
    <header className="premium-header">
      {toastNotif && (
        <div className="notif-toast-container">
          <div className="notif-toast" onClick={() => handleNotificationItemClick(toastNotif)}>
            <div className="notif-icon-wrap">{getNotificationIcon(toastNotif.title)}</div>
            <div className="notif-toast-body">
              <div className="notif-toast-title">{toastNotif.title}</div>
              <div className="notif-toast-message">{toastNotif.message ? toastNotif.message.replace(' undefined ', ' ') : ''}</div>
            </div>
            <button className="notif-toast-close" onClick={(e) => { e.stopPropagation(); setToastNotif(null); }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div className="premium-header-inner">
        <div className="premium-header-left">
          <div className="premium-logo-wrap" onClick={() => setPage('workflow')}>
            <div className="premium-logo-glow"></div>
            <HomeBrand />
          </div>
          <div className="premium-header-title">
            <h1>
              Laboratory Test Report System
              <span className="premium-pulse-dot">
                <span className="premium-pulse-ping"></span>
                <span className="premium-pulse-core"></span>
              </span>
            </h1>
            <p>Internal Laboratory Application</p>
          </div>
        </div>

        <div className="premium-header-center">
          <div className="premium-profile">
            <div className="premium-avatar">
              {currentUser?.fullName?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="premium-profile-text">
              <span className="premium-username">{currentUser?.fullName}</span>
              <span className="premium-role">{currentUser?.role || 'Staff'}</span>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </div>

          <button className="premium-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="premium-bell-icon" />
            {notifications.filter(n => !n.read).length > 0 && <span className="premium-bell-badge">{notifications.filter(n => !n.read).length}</span>}
          </button>
          
          {showNotifications && <div className="notif-dropdown">
            <div className="notif-header">
              <strong>Notifications</strong>
              <button className="notif-mark-read" onClick={async () => { await api.markAllNotificationsRead(); setNotifications(await api.getNotifications()) }}>Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.length ? notifications.map(n => (
                <div key={n._id || n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} onClick={() => handleNotificationItemClick(n)}>
                  <div className="notif-icon-wrap">
                    {getNotificationIcon(n.title)}
                  </div>
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <span className="notif-title">{n.title}</span>
                      {!n.read && <span className="notif-dot"></span>}
                    </div>
                    <div className="notif-message">{n.message ? n.message.replace(' undefined ', ' ') : ''}</div>
                    {n.createdAt && <div className="notif-time">{getRelativeTime(n.createdAt)}</div>}
                  </div>
                </div>
              )) : <div className="notif-empty">No notifications</div>}
            </div>
          </div>}
        </div>

        <div className="premium-header-right">
            <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className={`premium-nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
              <NavButton icon={<Activity size={16} />} label="Workflow" onClick={() => { setPage('workflow'); setShowMobileMenu(false); }} active={page === 'workflow'} />
              <NavButton icon={<FileText size={16} />} label="Reports" onClick={() => { setPage('list'); setShowMobileMenu(false); }} active={page === 'list'} />
              {currentUser?.role?.toLowerCase() !== 'manager' && <NavButton icon={<LayoutTemplate size={16} />} label="Templates" onClick={() => { setPage('templates'); setShowMobileMenu(false); }} active={page === 'template-form' || page === 'templates'} />}
              <div className="premium-nav-divider"></div>
              <NavButton icon={<LogOut size={16} />} label="Logout" variant="danger" onClick={logout} />
            </div>
        </div>
      </div>
    </header>
  )

  if (page === 'list') {
    return <main className="app-shell reports-page">
      <Navbar />
      <section className="reports-panel" aria-labelledby="reports-title">
        {appError && <p className="api-error" role="alert">{appError}</p>}
        <span className="sr-only" aria-live="polite">{reportsLoading ? 'Loading reports' : ''}</span>
        <div className="reports-heading"><div><p className="eyebrow">LABORATORY SERVICES</p><h1 id="reports-title">Laboratory Reports</h1><p>Manage saved laboratory test report forms.</p></div></div>
        <DateFilterToolbar filter={dateFilter} setFilter={setDateFilter} onApply={applyDateFilter} onClear={clearDateFilter} />
        <div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Customer/Name</th><th>Report No.</th><th>Sample ID/Name</th><th>Report Date</th><th>Action</th></tr></thead><tbody>{reports.length ? reports.map((savedReport) => <tr key={savedReport.id}><td data-label="Customer/Name">{savedReport.data.name || '—'}</td><td data-label="Report No.">{savedReport.data.reportNo || '—'}</td><td data-label="Sample ID/Name">{savedReport.data.sampleNameNo || '—'}</td><td data-label="Report Date">{new Date(savedReport.data.reportDate).toLocaleDateString('en-GB') || '—'}</td><td data-label="Action">{currentUser?.role?.toLowerCase() !== 'manager' && <button type="button" onClick={() => openEdit(savedReport)}>Edit</button>}<button type="button" onClick={() => openPreview(savedReport)}>View PDF</button> <button type="button" onClick={() => handleDeleteRequest(req.id)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginLeft: '8px' }}>Delete</button></td></tr>) : <tr className="reports-empty"><td colSpan="5">No reports created yet.</td></tr>}</tbody></table></div>
      </section>
    </main>
  }


  if (page === 'templates') {
    return <main className="app-shell reports-page">
      <Navbar />
      <section className="reports-panel" aria-labelledby="reports-title">
        {appError && <p className="api-error" role="alert">{appError}</p>}
        <div className="reports-heading"><div><p className="eyebrow">LABORATORY SERVICES</p><h1 id="reports-title">Test Templates</h1><p>Manage reusable templates for test reports.</p></div><button className="validate-button" type="button" onClick={openNewTemplate}>+ New Template</button></div>
        <div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Template Name</th><th>Actions</th></tr></thead><tbody>{templates.length ? templates.map((t) => <tr key={t.id}><td data-label="Template Name">{t.data.name}</td><td data-label="Actions"><button type="button" onClick={() => openEditTemplate(t)}>Edit</button><button type="button" onClick={() => deleteTemplate(t.id)} style={{ color: '#a13028' }}>Delete</button></td></tr>) : <tr className="reports-empty"><td colSpan="2">No templates created yet.</td></tr>}</tbody></table></div>
      </section>
    </main>
  }

  if (page === 'template-form') {
    return <main className="app-shell form-page">
      <section className="editor-panel" aria-labelledby="editor-title">
        <div className="panel-heading"><p className="eyebrow">LABORATORY SERVICES</p><h2 id="editor-title">{activeTemplateId ? 'Edit Template' : 'New Template'}</h2><p>Define standard test rows for a template.</p><button className="back-button" style={{ marginTop: '16px' }} type="button" onClick={() => setPage('templates')}>← Back to Templates</button></div>
        <form onSubmit={onSaveTemplate} noValidate>
          <fieldset><legend>Template Details</legend><div className="field-grid">
            <Field label="Template Name" type="text" value={template.name} error={errors.name} onChange={(event) => changeTemplateField('name', event.target.value)} />
          </div></fieldset>
          

        <fieldset className="test-editor"><div className="fieldset-title"><legend>Template Test Rows</legend><button type="button" className="add-row" onClick={addTemplateRow}>+ Add Row</button></div>
            {errors.tests && <small className="table-error" role="alert">{errors.tests}</small>}
            <div className="test-inputs">{template.tests.map((test, index) => <div className="test-input-row" key={index}>
              <span className="row-label">Test {index + 1}</span>
              {['parameter', 'method', 'unit', 'remark'].map((key) => <label key={key}><span>{key[0].toUpperCase() + key.slice(1)} {key !== 'remark' && <b aria-hidden="true">*</b>}</span><input value={test[key]} onChange={(event) => changeTemplateTest(index, key, event.target.value)} aria-invalid={Boolean(errors[`test-${index}-${key}`])} /></label>)}
              <button type="button" className="remove-row" onClick={() => removeTemplateRow(index)} aria-label={`Remove test row ${index + 1}`}>Remove</button>
            </div>)}</div>
          </fieldset>
          {errors.form && <small className="api-error" role="alert">{errors.form}</small>}
          <div className="form-actions"><button className="validate-button" type="submit">Save Template</button></div>
        </form>
      </section>
    </main>
  }

  const getBackendUrl = (path) => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/api$/, '') + path
    }
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    return `http://${host}:5000${path}`
  }

  if (page === 'approval-review') {
    const targetId = (activeSampleRequestId?._id || activeSampleRequestId || '').toString()
    const request = sampleRequests.find(r => 
      r.id?.toString() === targetId || 
      r._id?.toString() === targetId || 
      r.data?._id?.toString() === targetId
    )
    if (!request) return <main className="app-shell reports-page"><Navbar /><section className="reports-panel"><div style={{padding: '24px'}}>Request not found. <button className="validate-button" onClick={async () => { const fresh = await api.listSampleRequests({ force: true }); setSampleRequests(fresh); }}>Refresh List</button> <button className="back-button" onClick={() => setPage('workflow')}>Back</button></div></section></main>
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

  if (page === 'workflow') {
    return <main className="app-shell reports-page">
      <Navbar />
      {photoViewerUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} onClick={() => setPhotoViewerUrl(null)}>
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setPhotoViewerUrl(null)}>Close</button>
          <img src={getBackendUrl(photoViewerUrl)} alt="Sample Condition" style={{ maxWidth: '90%', maxHeight: '85%', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
      <section className="reports-panel" aria-labelledby="workflow-title">
        {appError && <p className="api-error" role="alert">{appError}</p>}
        <div className="reports-heading"><div><p className="eyebrow">WORKFLOW</p><h1 id="workflow-title">Sample Requests</h1><p>Manage pickup requests and workflow.</p></div>{currentUser?.role?.toLowerCase() !== 'manager' && <button className="validate-button" type="button" style={{height:'max-content'}} onClick={() => { setSampleRequest(createBlankSampleRequest()); setErrors({}); setPage('workflow-form') }}>+ New Request</button>}</div>
        <DateFilterToolbar filter={dateFilter} setFilter={setDateFilter} onApply={applyDateFilter} onClear={clearDateFilter} />
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead><tr><th>Sample No.</th><th>Customer Name</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>{sampleRequests.length ? sampleRequests.map((req) => <tr key={req.id}><td data-label="Sample No.">{req.data?.sampleNo || req.data?.sampleIdNo || req.data?.sampleName || req.sampleNo || req.sampleIdNo || req.sampleName || '—'}</td><td data-label="Customer Name">{req.data?.customerName || req.customerName || req.data?.sentBy || req.sentBy || '—'}</td><td data-label="Status"><span className={`status-badge status-${req.data.status.replace(/\s+/g, '-').toLowerCase()}`}>{req.data.status}</span></td><td data-label="Date">{(req.data?.sampleRequestDate || req.createdAt || req.data?.createdAt) ? new Date(req.data?.sampleRequestDate || req.createdAt || req.data?.createdAt).toLocaleDateString('en-GB') : '—'}</td><td data-label="Action">{req.data.status === 'Pending Approval' && currentUser?.role?.toLowerCase() === 'manager' && <button type="button" onClick={() => { setActiveSampleRequestId(req.id); setPage('approval-review'); }} style={{ fontSize: '12px', padding: '4px 8px', background: '#0a639f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Review Request</button>} {req.data.status === 'Approved' && currentUser?.role?.toLowerCase() !== 'manager' && <label style={{ cursor: 'pointer', color: '#0056b3', fontSize: '13px' }}><strong>Upload Photo to Receive</strong><input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleReceive(req.id, e.target.files[0]) }} /></label>} {req.data.status === 'Sample Received' && req.data.conditionPhotoUrl && <button type="button" onClick={() => setPhotoViewerUrl(req.data.conditionPhotoUrl)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginRight: '8px' }}>View Photo</button>} {req.data.status === 'Sample Received' && !req.data.conditionPhotoUrl && <span style={{ fontSize: '12px', color: '#777', marginRight: '8px' }}>Photo not available</span>} {['Sample Received', 'Excel Logged'].includes(req.data.status) && currentUser?.role?.toLowerCase() !== 'manager' && <button type="button" onClick={() => handleEnterResults(req)} style={{ fontSize: '12px', padding: '4px 8px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Enter Results</button>} {req.data.status === 'Results Recorded' && currentUser?.role?.toLowerCase() !== 'manager' && <button type="button" onClick={() => handleSubmitReview(req.id)} style={{ fontSize: '12px', padding: '4px 8px', background: '#e06b00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Send for Review</button>} {req.data.status === 'Submitted for Review' && currentUser?.role?.toLowerCase() === 'manager' && <button type="button" onClick={() => openReview(req.data.linkedReportId || req.linkedReportId, req.id)} style={{ fontSize: '12px', padding: '4px 8px', background: '#0a639f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Review Report</button>} {req.data.status === 'Reviewed' && <button type="button" onClick={() => handleFinalize(req.id)} style={{ fontSize: '12px', padding: '4px 8px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Finalize Report</button>} {['Excel Logged', 'Results Recorded', 'Submitted for Review', 'Reviewed', 'Final/Sent'].includes(req.data.status) && req.data.conditionPhotoUrl && <button type="button" onClick={() => setPhotoViewerUrl(req.data.conditionPhotoUrl)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginRight: '8px' }}>View Photo</button>} {req.data.status === 'Reviewed' && currentUser?.role?.toLowerCase() === 'manager' && <button type="button" onClick={() => openReview(req.data.linkedReportId || req.linkedReportId, req.id)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginRight: '8px' }}>Preview PDF</button>} {req.data.status === 'Final/Sent' && <button type="button" onClick={() => openPreview({ id: req.data.linkedReportId || req.linkedReportId })} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginRight: '8px' }}>View PDF</button>} <button type="button" onClick={() => handleDeleteRequest(req.id)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginLeft: '8px' }}>Delete</button></td></tr>) : <tr className="reports-empty"><td colSpan="5">No sample requests yet.</td></tr>}</tbody>
          </table>
        </div>
        
        {currentUser?.role?.toLowerCase() !== 'manager' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button 
              className="validate-button" 
              onClick={() => handleDownloadExcel()}
              style={{ background: '#217346', border: 'none' }}
            >
              Download Excel Log
            </button>
          </div>
        )}
      </section>
    </main>
  }
  if (page === 'workflow-form') {
    return <main className="app-shell form-page">
      <section className="editor-panel" aria-labelledby="editor-title">
        <div className="panel-heading"><p className="eyebrow">WORKFLOW</p><h2 id="editor-title">New Sample Pickup Request</h2><p>Submit a new sample for testing.</p><button className="back-button" style={{ marginTop: '16px' }} type="button" onClick={() => setPage('workflow')}>← Back to Workflow</button></div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const nextErrors = validateSampleRequest(sampleRequest)
          setErrors(nextErrors)
          if(Object.keys(nextErrors).length) return
          try {
            const payload = { ...sampleRequest, analysisRequired: sampleRequest.analysisRequired.split(',').map(s=>s.trim()).filter(Boolean) }
            const saved = await api.createSampleRequest(payload)
            setSampleRequests([saved, ...sampleRequests])
            setPage('workflow')
          } catch(error) {
            setErrors(error.errors || { form: error.message })
          }
        }} noValidate>
          <fieldset><legend>Request Details</legend><div className="field-grid">
            
              <label className="form-field">
                <span>Sample Name <b aria-hidden="true">*</b></span>
                <input
                  type="text"
                  list="sample-name-dropdown-options"
                  value={sampleRequest.sampleName}
                  placeholder="Type or select from dropdown..."
                  onChange={(e) => {
                    const val = e.target.value
                    setSampleRequest((c) => {
                      const matchedTemplate = templates.find((t) => t.data?.name?.toLowerCase() === val.toLowerCase())
                      let newAnalysis = c.analysisRequired
                      if (matchedTemplate && matchedTemplate.data?.tests && !c.analysisRequired) {
                        newAnalysis = matchedTemplate.data.tests.map((t) => t.parameter).filter(Boolean).join(', ')
                      }
                      return { ...c, sampleName: val, analysisRequired: newAnalysis }
                    })
                    setErrors((c) => ({ ...c, sampleName: undefined }))
                  }}
                  aria-invalid={Boolean(errors.sampleName)}
                />
                <datalist id="sample-name-dropdown-options">
                  {templates.map((t) => (
                    <option key={`tpl-${t.id}`} value={t.data?.name}>
                      {t.data?.name} (Template)
                    </option>
                  ))}
                  {[...new Set(sampleRequests.map((r) => r.data?.sampleName).filter(Boolean))].map((name, idx) => (
                    <option key={`prev-name-${idx}`} value={name}>
                      {name} (Recent)
                    </option>
                  ))}
                  <option value="Soil Sample" />
                  <option value="Drinking Water" />
                  <option value="Wastewater Sample" />
                  <option value="Animal Feed" />
                  <option value="Poultry Sample" />
                  <option value="Grain Sample" />
                </datalist>
                {errors.sampleName && <small role="alert">{errors.sampleName}</small>}
              </label>
              <label className="form-field">
                <span>Sample No. <b aria-hidden="true">*</b></span>
                <input
                  type="text"
                  list="sample-no-dropdown-options"
                  value={sampleRequest.sampleNo}
                  placeholder="Type or select Sample No..."
                  onChange={(e) => {
                    setSampleRequest((c) => ({ ...c, sampleNo: e.target.value }))
                    setErrors((c) => ({ ...c, sampleNo: undefined }))
                  }}
                  aria-invalid={Boolean(errors.sampleNo)}
                />
                <datalist id="sample-no-dropdown-options">
                  {[...new Set(sampleRequests.map((r) => r.data?.sampleNo || r.data?.sampleIdNo || r.sampleNo || r.sampleIdNo).filter(Boolean))].map((no, idx) => (
                    <option key={`prev-no-${idx}`} value={no} />
                  ))}
                </datalist>
                {errors.sampleNo && <small role="alert">{errors.sampleNo}</small>}
              </label>
              <Field label="Customer Name" type="text" value={sampleRequest.customerName} error={errors.customerName} onChange={(e) => { setSampleRequest(c => ({...c, customerName: e.target.value})); setErrors(c => ({...c, customerName: undefined})) }} />
              <Field label="Sent By" type="text" value={sampleRequest.sentBy} error={errors.sentBy} onChange={(e) => { setSampleRequest(c => ({...c, sentBy: e.target.value})); setErrors(c => ({...c, sentBy: undefined})) }} />
              <Field label="Approved By" type="text" value={sampleRequest.approvedBy} error={errors.approvedBy} onChange={(e) => { setSampleRequest(c => ({...c, approvedBy: e.target.value})); setErrors(c => ({...c, approvedBy: undefined})) }} />
              <Field label="Analysis Required (comma separated)" type="text" value={sampleRequest.analysisRequired} error={errors.analysisRequired} onChange={(e) => { setSampleRequest(c => ({...c, analysisRequired: e.target.value})); setErrors(c => ({...c, analysisRequired: undefined})) }} />
              <div className="form-field location-field-wrap">
                <div className="location-label-row">
                  <span>Location <b aria-hidden="true">*</b></span>
                  <button
                    type="button"
                    className="use-location-btn"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? '📍 Detecting…' : '📍 Use Current Location'}
                  </button>
                </div>
                <input
                  type="text"
                  value={sampleRequest.location}
                  onChange={(e) => {
                    setSampleRequest(c => ({ ...c, location: e.target.value }))
                    setErrors(c => ({ ...c, location: undefined }))
                    setLocError('')
                  }}
                  aria-invalid={Boolean(errors.location)}
                  placeholder="Enter location or click Use Current Location"
                />
                {errors.location && <small role="alert">{errors.location}</small>}
                {locError && <small className="location-error-msg" role="alert">{locError}</small>}
              </div>
              <Field label="Sample Request Date *" type="date" value={sampleRequest.sampleRequestDate} error={errors.sampleRequestDate} onChange={(e) => { setSampleRequest(c => ({...c, sampleRequestDate: e.target.value})); setErrors(c => ({...c, sampleRequestDate: undefined})) }} />
              <Field label="Report Date *" type="date" value={sampleRequest.reportDate} error={errors.reportDate} onChange={(e) => { setSampleRequest(c => ({...c, reportDate: e.target.value})); setErrors(c => ({...c, reportDate: undefined})) }} />
              <Field label="Remark *" type="text" value={sampleRequest.remark} error={errors.remark} onChange={(e) => { setSampleRequest(c => ({...c, remark: e.target.value})); setErrors(c => ({...c, remark: undefined})) }} />
            </div>
          </fieldset>
          {errors.form && <small className="api-error" role="alert">{errors.form}</small>}
          <div className="form-actions"><button className="premium-submit-btn" type="submit">Submit Request</button></div>
        </form>
      </section>
    </main>
  }
  if (page === 'preview') {
    return <main className="app-shell preview-page">
      <div className="preview-toolbar" aria-label="Report preview actions">{currentUser?.role?.toLowerCase() !== 'manager' && !report.isFinalized && <button className="previous-button" type="button" onClick={() => setPage('form')}>Back to Edit</button>}<button className="previous-button" type="button" onClick={() => setPage('list')}>Reports List</button><button className="validate-button" type="button" disabled={pdfLoading} onClick={downloadPdf}>{pdfLoading ? 'Generating PDF…' : 'Print / Download PDF'}</button>{report.sampleRequestId && currentUser?.role?.toLowerCase() !== 'manager' && sampleRequests.find(r => r.id === report.sampleRequestId)?.data?.status === 'Results Recorded' && <button className="validate-button" style={{ background: '#e06b00', border: 'none', marginLeft: '12px' }} type="button" onClick={async () => { await handleSubmitReview(report.sampleRequestId); setPage('workflow'); }}>Send for Review</button>}</div>
      {appError && <p className="api-error" role="alert">{appError}</p>}
      <section className="preview-panel" aria-label="Laboratory test report preview"><div className="page-frame"><FigmaReportPreview report={report} /></div></section>
    </main>
  }

  if (page === 'review') {
    return <main className="app-shell preview-page">
      <div className="preview-toolbar" aria-label="Report preview actions">
        <button className="previous-button" type="button" onClick={() => setPage('workflow')}>Back to Workflow</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="text" placeholder="Optional comments..." value={reviewRemarks} onChange={e => setReviewRemarks(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', width: '250px' }} />
          <button className="validate-button" type="button" onClick={handleMarkReviewed}>Approve & Mark Reviewed</button>
        </div>
      </div>
      {appError && <p className="api-error" role="alert">{appError}</p>}
      <section className="preview-panel" aria-label="Laboratory test report review"><div className="page-frame"><FigmaReportPreview report={report} /></div></section>
    </main>
  }

  return <main className="app-shell form-page">
    <section className="editor-panel" aria-labelledby="editor-title">
      <div className="panel-heading"><p className="eyebrow">LABORATORY SERVICES</p><h2 id="editor-title">{activeReportId ? 'Edit Laboratory Report' : 'New Laboratory Report'}</h2><p>Complete and validate the required fields before previewing the report.</p><button className="back-button" style={{ marginTop: '16px' }} type="button" onClick={() => setPage('list')}>← Back to Reports</button></div>
      <form onSubmit={onValidate} noValidate>
        <fieldset><legend>Client and sample details</legend><div className="field-grid">
          {reportFields.map(([key, label, type]) => <Field key={key} label={label} type={type} value={report[key]} error={errors[key]} onChange={(event) => changeField(key, event.target.value)} />)}
        </div></fieldset>
        
        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-header)', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: 'var(--text-heading)', marginBottom: '8px' }}>Smart Test Template Auto-Fill</label>
          <select onChange={(e) => applyTemplate(e.target.value)} value="" style={{ width: '100%', height: '38px', padding: '0 9px', borderRadius: '3px', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="">Select a template to auto-fill rows...</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.data.name}</option>)}
          </select>
        </div>
        <fieldset className="test-editor"><div className="fieldset-title"><legend>Test rows</legend><button type="button" className="add-row" onClick={addRow}>+ Add Row</button></div>
          {errors.tests && <small className="table-error" role="alert">{errors.tests}</small>}
          <div className="test-inputs">{report.tests.map((test, index) => <div className="test-input-row" key={index}>
            <span className="row-label">Test {index + 1}</span>
            {['parameter', 'method', 'result', 'unit', 'remark'].map((key) => <label key={key}><span>{key === 'parameter' ? 'Parameter' : key[0].toUpperCase() + key.slice(1)} <b aria-hidden="true">*</b></span><input value={test[key]} onChange={(event) => changeTest(index, key, event.target.value)} aria-invalid={Boolean(errors[`test-${index}-${key}`])} /></label>)}
            <button type="button" className="remove-row" onClick={() => removeRow(index)} aria-label={`Remove test row ${index + 1}`}>Remove</button>
          </div>)}</div>
        </fieldset>
        {errors.form && <small className="api-error" role="alert">{errors.form}</small>}
        <div className="form-actions"><button className="validate-button" type="submit">{activeReportId ? 'Save Changes' : 'Validate / Save'}</button><button className="preview-button" type="button" disabled={!previewReady} onClick={() => setPage('preview')}>Preview Report</button>{report.sampleRequestId && previewReady && currentUser?.role?.toLowerCase() !== 'manager' && sampleRequests.find(r => r.id === report.sampleRequestId)?.data?.status === 'Results Recorded' && <button className="validate-button" style={{ background: '#e06b00', border: 'none', marginLeft: '12px' }} type="button" onClick={async () => { await handleSubmitReview(report.sampleRequestId); setPage('workflow'); }}>Send for Review</button>}</div>
        {validated && <p className="validation-success" role="status">Report saved separately and ready for preview.</p>}
      </form>
    </section>
  </main>
}

export default App
