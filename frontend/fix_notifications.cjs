const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update imports
jsx = jsx.replace(
  "import { Bell, GitMerge, FileText, LayoutTemplate, LogOut, ChevronDown, Activity, Menu, X } from 'lucide-react'",
  "import { Bell, GitMerge, FileText, LayoutTemplate, LogOut, ChevronDown, Activity, Menu, X, CheckCircle2, XCircle, Package } from 'lucide-react'"
);

// 2. Add helper functions
const helpers = `
function getRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return \`\${diffInMinutes} min ago\`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return \`\${diffInHours} hr ago\`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return \`\${diffInDays} days ago\`;
  return date.toLocaleDateString();
}

function getNotificationIcon(title) {
  if (title.includes('Approved')) return <CheckCircle2 size={16} className="notif-icon-success" />;
  if (title.includes('Rejected')) return <XCircle size={16} className="notif-icon-error" />;
  if (title.includes('Received')) return <Package size={16} className="notif-icon-info" />;
  if (title.includes('Review')) return <FileText size={16} className="notif-icon-primary" />;
  return <Bell size={16} className="notif-icon-default" />;
}

function App() {`;
jsx = jsx.replace('function App() {', helpers);

// 3. Replace the notification dropdown block
const oldNotifRegex = /\{showNotifications && <div style=\{\{ position: 'absolute'[\s\S]*?<\/div>\}/;

const newNotifBlock = `{showNotifications && <div className="notif-dropdown">
            <div className="notif-header">
              <strong>Notifications</strong>
              <button className="notif-mark-read" onClick={async () => { await api.markAllNotificationsRead(); setNotifications(await api.getNotifications()) }}>Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.length ? notifications.map(n => (
                <div key={n._id} className={\`notif-item \${n.read ? 'read' : 'unread'}\`} onClick={async () => { if (!n.read) await api.markNotificationRead(n._id); setNotifications(await api.getNotifications()); if (n.type === 'REPORT_REVIEW') openReview(n.reportId, n.sampleRequestId); else if (n.link) setPage(n.link); setShowNotifications(false) }}>
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
          </div>}`;

jsx = jsx.replace(oldNotifRegex, newNotifBlock);

fs.writeFileSync('src/App.jsx', jsx);

console.log("Updated App.jsx successfully!");
