const fs = require('fs');
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

// The replacement logic:
// Replace all <div className="form-row"> with <div className="form-field"> in ApprovalReviewScreen
// Replace <div className="form-row" style={{ marginTop: '16px' }}> with <div className="form-field" style={{ marginTop: '16px' }}>
// Reduce margins in the Approval Decision section:
// From: <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
// To: <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
// For the Approval Decision Manager Comment row:
// From: <div className="form-row" style={{ marginTop: '16px' }}>
// To: <div className="form-field" style={{ marginTop: '12px' }}>
// For the Remark row:
// From: {request.data.remark && (\n          <div className="form-row" style={{ marginTop: '16px' }}>
// To: {request.data.remark && (\n          <div className="form-field" style={{ marginTop: '16px' }}>

appJsx = appJsx.replace(
  /<div className="form-row">/g,
  '<div className="form-field">'
);

appJsx = appJsx.replace(
  /\{request\.data\.remark && \(\s*<div className="form-row" style={{ marginTop: '16px' }}>/g,
  `{request.data.remark && (\n          <div className="form-field" style={{ marginTop: '16px' }}>`
);

appJsx = appJsx.replace(
  /<div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>/,
  `<div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>`
);

appJsx = appJsx.replace(
  /<h3>Approval Decision<\/h3>\s*<div className="form-row" style={{ marginTop: '16px' }}>/,
  `<h3>Approval Decision</h3>\n          <div className="form-field" style={{ marginTop: '12px' }}>`
);

appJsx = appJsx.replace(
  /<div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>/,
  `<div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>`
);

// Fix the styling for textarea to ensure it's full-width, which it should be since it's inside form-field,
// but just in case, we can keep the rows={4} as is.

fs.writeFileSync('src/App.jsx', appJsx);
console.log('Fixed UI layout for ApprovalReviewScreen.');
