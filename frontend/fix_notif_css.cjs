const fs = require('fs');

const notifCSS = `
/* --- PREMIUM NOTIFICATION PANEL --- */
.notif-dropdown {
  position: absolute;
  top: 70px;
  right: 40px; /* Align near the bell */
  width: 360px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-light, #e0e7ec);
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 10px 40px -10px rgba(15, 28, 42, 0.15), 0 4px 12px rgba(15, 28, 42, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notif-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light, #e0e7ec);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card, #ffffff);
}

.notif-header strong {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-heading, #152a43);
  margin: 0;
}

.notif-mark-read {
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  color: var(--text-link, #0066cc);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notif-mark-read:hover {
  background: rgba(0, 102, 204, 0.05);
}

.notif-list {
  max-height: 420px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.notif-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light, #f0f4f8);
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item.unread {
  background: rgba(0, 102, 204, 0.03);
}

.notif-item.read {
  background: transparent;
}

.notif-item:hover {
  background: rgba(15, 28, 42, 0.02);
}

.notif-item.unread:hover {
  background: rgba(0, 102, 204, 0.05);
}

.notif-icon-wrap {
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-icon-success { color: #10b981; }
.notif-icon-error { color: #ef4444; }
.notif-icon-info { color: #8b5cf6; }
.notif-icon-primary { color: #3b82f6; }
.notif-icon-default { color: #64748b; }

.notif-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notif-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-heading, #152a43);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.notif-message {
  font-size: 13px;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
}

.notif-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 500;
}

.notif-empty {
  padding: 32px 20px;
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
}

/* --- MOBILE RESPONSIVENESS FOR NOTIFICATIONS --- */
@media (max-width: 768px) {
  .notif-dropdown {
    position: fixed;
    top: 70px; /* Below navbar */
    left: 10px !important;
    right: 10px !important;
    width: auto !important; /* Take remaining width between left/right bounds */
    max-width: 100vw !important;
    transform: none !important;
    z-index: 1000;
    max-height: calc(100vh - 90px); /* Fit within screen height */
  }

  .notif-list {
    max-height: calc(100vh - 150px);
  }
}
`;

fs.appendFileSync('src/App.css', notifCSS);
console.log("Appended premium notification CSS to App.css");
