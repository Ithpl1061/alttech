const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Find the Navbar component and replace it entirely
const navbarRegex = /const Navbar = \(\) => \([\s\S]*?\n  \)\n/m;
const newNavbar = `const Navbar = () => (
    <header className="premium-header">
      <div className="premium-header-inner">
        
        {/* LEFT: Logo & Title */}
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

        {/* CENTER: Main Navigation (Desktop) */}
        <div className="premium-nav-desktop">
          <NavButton icon={<Activity size={16} />} label="Workflow" onClick={() => { setPage('workflow'); setShowMobileMenu(false); }} active={page === 'workflow'} />
          <NavButton icon={<FileText size={16} />} label="Reports" onClick={() => { setPage('list'); setShowMobileMenu(false); }} active={page === 'list'} />
          {currentUser?.role?.toLowerCase() !== 'manager' && <NavButton icon={<LayoutTemplate size={16} />} label="Templates" onClick={() => { setPage('templates'); setShowMobileMenu(false); }} active={page === 'template-form' || page === 'templates'} />}
        </div>

        {/* RIGHT: Profile, Bell, and Logout (Desktop) */}
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
          </div>}

          <div className="premium-logout-desktop">
            <NavButton icon={<LogOut size={16} />} label="Logout" variant="danger" onClick={logout} />
          </div>
        </div>

        {/* MOBILE OVERLAY: Hamburger and Mobile Menu */}
        <div className="premium-header-right">
            <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className={\`premium-nav-links \${showMobileMenu ? 'mobile-open' : ''}\`}>
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
`;

code = code.replace(navbarRegex, newNavbar);
fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx Navbar restructured for semantic grouping.');
